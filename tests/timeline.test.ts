import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createDemoEvents, eventCategories, isEvent, overlaps } from '../src/events.ts'
import type { CalendarEvent } from '../src/events.ts'
import { categoryForStory, dailySuggestions, positionEvents, storyKind, suggestionSlots } from '../src/recommendations.ts'
import { fits, stories } from '../src/stories.ts'
import { productFor, products } from '../src/products.ts'
import { loadData, saveData } from '../src/storage.ts'

const date = '2026-10-30'
const busy = (start: number, end: number, id = `${start}`): CalendarEvent => ({
  id, date, title: '既存予定', category: 'work', start, end, note: '保持するメモ', place: '既存の場所',
})

test('travel buffers reserve ten minutes next to each confirmed appointment', () => {
  assert.deepEqual(suggestionSlots([busy(540, 720), busy(780, 900), busy(1080, 1200)], date), [
    { start: 730, end: 770 }, // filtered below: less than 45 minutes
    { start: 910, end: 1070 }, { start: 1210, end: 1320 },
  ].filter((slot) => slot.end - slot.start >= 45))
  assert.equal(dailySuggestions([busy(0, 1439)], date).length, 0)
  assert.deepEqual(suggestionSlots([], date), [{ start: 540, end: 1320 }])
})

test('a short gap prioritizes a 45 minute experience, and duration must fit including buffers', () => {
  const events = [busy(0, 900), busy(965, 1439)]
  const suggestions = dailySuggestions(events, date)
  assert.equal(suggestions.length, 1)
  assert.equal(suggestions[0].story.duration, 45)
  assert.equal(suggestions[0].start, 910)
  assert.equal(suggestions[0].end, 955)
  assert.equal(dailySuggestions([busy(0, 900), busy(964, 1439)], date).length, 0)
})

test('suggestions remain separate, limited to three, fit hours and never overlap busy times or one another', () => {
  const events = createDemoEvents(new Date(2026, 9, 30))
  const before = structuredClone(events)
  for (const day of [...new Set(events.map((event) => event.date)), '2027-01-01']) {
    const suggestions = dailySuggestions(events, day)
    assert.ok(suggestions.length <= 3)
    const proposals = suggestions.map((item, index) => ({
      ...busy(item.start, item.end, `proposal-${index}`), date: day, storyId: item.story.id,
    }))
    for (let index = 0; index < suggestions.length; index++) {
      const item = suggestions[index]
      assert.equal(item.end - item.start, item.story.duration)
      assert.equal(storyKind(item.story), 'experience')
      assert.ok(fits(item.story, item))
      assert.equal(overlaps([...events, ...proposals], proposals[index]), false)
      for (const other of [...events.filter((event) => event.date === day), ...proposals.filter((_, i) => i !== index)]) {
        assert.ok(item.start - other.end >= 10 || other.start - item.end >= 10)
      }
    }
  }
  assert.deepEqual(events, before)
})

test('skip excludes an experience for the whole date; edits and deletions recompute placements', () => {
  const first = dailySuggestions([], date)
  const skipped = dailySuggestions([], date, [first[0].story.id])
  assert.equal(skipped.some((item) => item.story.id === first[0].story.id), false)
  const occupied = [busy(0, 1439)]
  assert.equal(dailySuggestions(occupied, date).length, 0)
  assert.ok(dailySuggestions([], date).length > 0)
  const edited = dailySuggestions([busy(0, 1080)], date)
  assert.ok(edited.every((item) => item.start >= 1090))
  const confirmed: CalendarEvent = { ...busy(first[0].start, first[0].end), storyId: first[0].story.id, category: categoryForStory(first[0].story) }
  assert.ok(isEvent(confirmed))
  assert.equal(dailySuggestions([confirmed], date).some((item) => item.story.id === confirmed.storyId), false)
})

test('overlapping timeline appointments get distinct lanes; touching ones share a lane', () => {
  const a = busy(540, 720, 'a')
  const b = busy(600, 660, 'b')
  const c = busy(650, 800, 'c')
  const d = busy(800, 900, 'd')
  const before = structuredClone([c, b, d, a])
  const positioned = positionEvents([c, b, d, a])
  assert.deepEqual(positioned.map(({ event, lane, lanes }) => [event.id, lane, lanes]), [
    ['a', 0, 3], ['b', 1, 3], ['c', 2, 3], ['d', 0, 1],
  ])
  assert.deepEqual(positionEvents([a, { ...b, start: 720, end: 780 }]).map((item) => item.lanes), [1, 1])
  assert.deepEqual([c, b, d, a], before)
})

test('all category colors are valid stored event categories; products and reading are not calendar experiences', () => {
  for (const category of Object.keys(eventCategories)) assert.ok(isEvent({ ...busy(540, 600), category }))
  assert.equal(products.length, 6)
  assert.equal(new Set(products.map((product) => product.id)).size, products.length)
  for (const story of stories) {
    const product = productFor(story)
    assert.ok(product.name && product.brand && product.description && product.color && product.price)
  }
  assert.ok(stories.some((story) => storyKind(story) === 'article'))
  assert.ok(dailySuggestions([], date).every((item) => storyKind(item.story) !== 'article'))
})

test('legacy storage stays intact while skipped IDs and product favorites persist independently of events', (context) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  let raw = JSON.stringify({ events: [busy(540, 720)], favorites: ['wine', 'legacy-unknown'] })
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: () => raw,
    setItem: (_key: string, value: string) => { raw = value },
  } })
  context.mock.method(console, 'error', () => {})
  try {
    const legacy = loadData().data!
    const next = { ...legacy, favorites: [...legacy.favorites, products[0].id], skipped: { [date]: ['coffee'], discover: ['art'] } }
    assert.equal(saveData(next), '')
    assert.deepEqual(loadData().data, next)
    assert.deepEqual(loadData().data!.events, legacy.events)
    raw = JSON.stringify({ ...next, skipped: { [date]: [123] } })
    assert.ok(loadData().error)
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
    else Reflect.deleteProperty(globalThis, 'localStorage')
  }
})
