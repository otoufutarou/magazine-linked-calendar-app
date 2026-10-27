import assert from 'node:assert/strict'
import { test } from 'node:test'
import { editorialCopies, editorialMagazines, selectEditorialCopy } from '../src/data/editorialCopies.ts'
import type { CalendarEvent } from '../src/events.ts'

test('editorial library contains at least 25 distinct, fully-described copies for each of six magazines', () => {
  assert.equal(editorialMagazines.length, 6)
  assert.ok(editorialCopies.length >= 150)
  assert.equal(new Set(editorialCopies.map((copy) => copy.id)).size, editorialCopies.length)
  for (const magazine of editorialMagazines) {
    const copies = editorialCopies.filter((copy) => copy.category === magazine.category)
    assert.ok(copies.length >= 25)
    assert.ok(new Set(copies.map((copy) => copy.text)).size >= 25)
    for (const copy of copies) {
      assert.equal(copy.magazineId, magazine.id)
      assert.ok(copy.tone && copy.timeOfDay && copy.dayType && copy.placement)
      assert.ok(copy.minFreeMinutes >= 0 && copy.priority > 0)
      assert.ok(Array.isArray(copy.relatedEventTypes) && Array.isArray(copy.season))
    }
  }
})

test('editorial selection matches placement, schedule category and free-time threshold without consecutive repeats', () => {
  const date = '2026-10-27'
  const work: CalendarEvent = { id: 'work', title: '企画会議', date, start: 600, end: 660, category: 'work', note: '' }
  const context = { date, events: [work], freeMinutes: 180, placement: 'Ticker' as const }
  const first = selectEditorialCopy(context)
  const next = selectEditorialCopy(context)
  assert.equal(first.placement, 'Ticker')
  assert.equal(first.relatedEventTypes.includes('work'), true)
  assert.equal(first.id, next.id)
  const followingDay = selectEditorialCopy({ ...context, date: '2026-10-28' })
  assert.notEqual(first.id, followingDay.id)

  const whisper = selectEditorialCopy({ ...context, placement: 'Whisper', freeMinutes: 45 })
  assert.equal(whisper.placement, 'Whisper')
  assert.ok(whisper.minFreeMinutes <= 45)
})
