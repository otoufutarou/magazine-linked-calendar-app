import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { clock, createDemoEvents, dateKey, freeSlots, isEvent, minutes, moveDate, overlaps, parseDate } from '../src/events.ts'
import type { CalendarEvent } from '../src/events.ts'
import { dayPlan, fits, magazineEditions, magazineFor, stories, storyCategory, storyStart, storyTone } from '../src/stories.ts'
import { planConflict, planEvents } from '../src/plans.ts'
import { loadData, saveData } from '../src/storage.ts'

const date = '2026-10-30'
const event = (start: number, end: number, id = 'work'): CalendarEvent => ({
  id, title: '仕事', date, start, end, category: 'work', note: '',
})

test('local dates cross month, year and leap-day boundaries without UTC conversion', () => {
  assert.equal(moveDate('2026-12-31', 1), '2027-01-01')
  assert.equal(moveDate('2024-02-28', 1), '2024-02-29')
  assert.equal(dateKey(parseDate(date)), date)
  assert.equal(clock(minutes('18:05')), '18:05')
})

test('free-time detection uses 09:00–22:00 and a real 45 minute minimum', () => {
  assert.deepEqual(freeSlots([], date), [{ start: 540, end: 1320 }])
  assert.deepEqual(freeSlots([event(540, 720), event(780, 1080, 'pm')], date), [
    { start: 720, end: 780 }, { start: 1080, end: 1320 },
  ])
  assert.deepEqual(freeSlots([event(0, 584), event(628, 1320, 'pm')], date), [])
  assert.deepEqual(freeSlots([event(0, 584), event(629, 1439, 'pm')], date), [{ start: 584, end: 629 }])
})

test('free-time detection merges nested, overlapping and touching busy periods', () => {
  assert.deepEqual(freeSlots([event(600, 800), event(630, 700, 'nested'), event(780, 900, 'overlap'), event(900, 1320, 'touching')], date), [{ start: 540, end: 600 }])
  assert.deepEqual(freeSlots([event(0, 1320), event(1330, 1439, 'late')], date), [])
  assert.deepEqual(freeSlots([{ ...event(540, 1320), date: '2026-10-31' }], date), [{ start: 540, end: 1320 }])
})

test('event validation rejects invalid dates, reversed times and malformed persisted data', () => {
  assert.ok(isEvent(event(540, 600)))
  assert.ok(isEvent({ ...event(540, 600), place: '表参道' }))
  assert.equal(isEvent({ ...event(540, 600), place: 42 }), false)
  for (const bad of [null, {}, { ...event(540, 600), title: ' ' }, { ...event(540, 600), date: '2026-02-30' }, event(600, 540), event(-1, 600), event(600, 1440), event(600.5, 700), { ...event(540, 600), category: 'bad' }]) assert.equal(isEvent(bad), false)
})

test('overlap detection allows adjacency and editing the same event', () => {
  const saved = [event(540, 720)]
  assert.equal(overlaps(saved, event(700, 780, 'new')), true)
  assert.equal(overlaps(saved, event(720, 780, 'new')), false)
  assert.equal(overlaps(saved, event(540, 700)), false)
  assert.equal(overlaps(saved, { ...event(540, 700, 'new'), date: '2026-10-31' }), false)
})

test('at least thirty original recommendations cover diverse magazines and labeled advertising formats', () => {
  assert.ok(stories.length >= 30)
  assert.equal(new Set(stories.map((story) => story.id)).size, stories.length)
  assert.deepEqual(new Set(stories.filter((story) => story.sponsored).map((story) => story.sponsored)), new Set(['Sponsored Recommendation', 'Calendar Native Ads', 'Editorial Sponsored Story']))
  for (const story of stories) {
    assert.ok(story.paragraphs.length >= 3 && story.reason && story.image && story.magazine)
    assert.ok(story.duration >= 45)
  }
  assert.equal(new Set(stories.map((story) => storyTone(story.id))).size, 6)
})

test('recommendations fit actual gap length and their opening hours', () => {
  const wine = stories.find((story) => story.id === 'wine')!
  const cafe = stories.find((story) => story.id === 'coffee')!
  assert.equal(fits(wine, { start: 1080, end: 1170 }), true)
  assert.equal(fits(wine, { start: 1080, end: 1169 }), false)
  assert.equal(fits(wine, { start: 720, end: 780 }), false)
  assert.equal(fits(cafe, { start: 1080, end: 1320 }), false)
  assert.equal(fits(cafe, { start: 720, end: 780 }), true)
  assert.equal(storyStart(wine, { start: 900, end: 1320 }), 1020)
  assert.equal(fits(wine, { start: 1290, end: 1439 }), false)
})

test('every story image and the hero are bundled for subpath deployment without external APIs', () => {
  for (const name of new Set(['hero.jpg', ...stories.map((story) => story.image)])) {
    const bytes = readFileSync(new URL(`../public/images/${name}`, import.meta.url))
    assert.ok(bytes.length > 1000, name)
    if (name.endsWith('.svg')) assert.match(bytes.toString(), /^<svg[^>]+xmlns="http:\/\/www.w3.org\/2000\/svg"/)
    else assert.equal(bytes.readUInt16BE(0), 0xffd8, name)
  }
  const notices = readFileSync(new URL('../public/images/THIRD-PARTY-NOTICES.txt', import.meta.url), 'utf8')
  assert.ok(notices.includes('MIT License') && notices.includes('Sadee') && notices.includes('Start Bootstrap'))
})

test('six fictional editorial brands include beauty and working-women fashion with compatible recommendations', () => {
  assert.equal(magazineEditions.length, 6)
  assert.equal(new Set(magazineEditions.map((edition) => edition.name)).size, 6)
  for (const edition of magazineEditions) {
    const story = stories.find((item) => item.magazine === edition.name)!
    assert.ok(story)
    assert.equal(magazineFor(story), edition)
    assert.ok(edition.product && edition.price && edition.genre)
    assert.ok(readFileSync(new URL(`../public/images/${edition.image}`, import.meta.url)).length > 1000)
  }
  const beauty = stories.find((story) => story.id === 'beauty')!
  assert.equal(storyCategory(beauty), 'ビューティー')
  assert.ok(fits(beauty, { start: 1080, end: 1125 }))
  assert.equal(fits(beauty, { start: 1080, end: 1124 }), false)
  assert.equal(storyCategory(stories.find((story) => story.id === 'style')!), 'ファッション')
})

test('demo starts with varied, editable appointments, conflict-free outings and intentional empty days', () => {
  const realisticWeek = createDemoEvents(new Date(2026, 9, 25))
  assert.ok(realisticWeek.some((item) => item.title.includes('MTG')))
  assert.ok(realisticWeek.some((item) => item.title.includes('出張')))
  assert.ok(realisticWeek.some((item) => item.title === '取引先を訪問'))
  for (let day = 25; day <= 31; day++) {
    const today = new Date(2026, 9, day)
    const events = createDemoEvents(today)
    assert.ok(events.every(isEvent))
    const weekDates = Array.from({ length: 7 }, (_, offset) => moveDate(dateKey(today), offset))
    assert.ok(weekDates.filter((date) => events.some((item) => item.date === date)).length >= 5)
    assert.ok(weekDates.some((date) => !events.some((item) => item.date === date)))
    assert.equal(new Set(events.map((item) => item.id)).size, events.length)
    for (const item of events) assert.equal(overlaps(events, item), false, `${item.date}: ${item.title}`)
    for (const item of events.filter((item) => item.storyId)) {
      const story = stories.find((story) => story.id === item.storyId)!
      assert.equal(item.end - item.start, story.duration)
      assert.ok(fits(story, { start: item.start, end: item.end }))
    }
  }
})

test('one-day plan has four ordered, non-overlapping stops and is atomic on conflict', () => {
  const plan = planEvents(date)
  assert.equal(plan.length, 4)
  assert.deepEqual(plan.map((item) => clock(item.start)), ['11:00', '13:00', '15:30', '18:00'])
  assert.equal(planConflict([], date), null)
  assert.equal(planConflict([event(780, 810)], date)?.includes('重なって'), true)
  assert.equal(planConflict(plan, date)?.includes('登録'), true)
  for (const stop of plan) {
    assert.ok(isEvent(stop))
    assert.equal(overlaps(plan, stop), false)
    assert.ok(fits(stories.find((story) => story.id === stop.storyId)!, stop))
  }
  assert.equal(dayPlan.length, 4)
})

test('storage preserves changes and favorites; corruption and quota errors are visible', (context) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const values = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  } })
  context.mock.method(console, 'error', () => {})
  try {
    assert.deepEqual(loadData(), { data: null, error: '' })
    const data = { events: [event(540, 600)], favorites: ['wine'] }
    assert.equal(saveData(data), '')
    assert.deepEqual(loadData().data, data)
    values.set('mag-life-v1', '{invalid')
    assert.ok(loadData().error)
    values.set('mag-life-v1', JSON.stringify({ events: [event(540, 600), event(540, 600)], favorites: [] }))
    assert.ok(loadData().error)
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
      getItem() { throw new Error('Storage disabled') },
      setItem() { throw new Error('Quota exceeded') },
    } })
    assert.ok(loadData().error)
    assert.ok(saveData(data))
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
    else Reflect.deleteProperty(globalThis, 'localStorage')
  }
})
