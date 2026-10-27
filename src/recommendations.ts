import { freeSlots } from './events.ts'
import type { CalendarEvent, FreeSlot } from './events.ts'
import { fits, stories, storyCategory, storyStart } from './stories.ts'
import type { Story } from './stories.ts'

export type Suggestion = { story: Story; start: number; end: number }
export const travelBuffer = 10

export function suggestionSlots(events: CalendarEvent[], date: string): FreeSlot[] {
  const day = events.filter((event) => event.date === date)
  return freeSlots(events, date).map((slot) => ({
    start: slot.start + (day.some((event) => event.end === slot.start) ? travelBuffer : 0),
    end: slot.end - (day.some((event) => event.start === slot.end) ? travelBuffer : 0),
  })).filter((slot) => slot.end - slot.start >= 45)
}

export function dailySuggestions(events: CalendarEvent[], date: string, skipped: string[] = []): Suggestion[] {
  const result: Suggestion[] = []
  const used = new Set([...skipped, ...events.filter((event) => event.date === date).map((event) => event.storyId)])
  const gaps = suggestionSlots(events, date)
  // Fill separate gaps first, then offer a second stop only if room remains.
  for (let pass = 0; pass < 3 && result.length < 3; pass++) {
    for (const gap of gaps) {
      const options = stories.filter((story) => storyKind(story) === 'experience' && !used.has(story.id) && fits(story, gap))
      options.sort((a, b) => storyStart(a, gap) - storyStart(b, gap)
        || (gap.end - gap.start < 120 ? a.duration - b.duration : 0))
      const story = options[0]
      if (!story) continue
      const start = storyStart(story, gap)
      result.push({ story, start, end: start + story.duration })
      used.add(story.id)
      gap.start = start + story.duration + travelBuffer
      if (result.length === 3) break
    }
  }
  return result.sort((a, b) => a.start - b.start)
}

export function storyKind(story: Story): 'experience' | 'article' {
  return story.kind ?? 'experience'
}

export function categoryForStory(story: Story): CalendarEvent['category'] {
  const category = storyCategory(story)
  return category === 'ビューティー' ? 'beauty' : category === '自然' ? 'outdoor'
    : category === 'グルメ' ? 'gourmet' : 'hobby'
}

export function displayCategory(event: CalendarEvent): CalendarEvent['category'] {
  const story = stories.find((item) => item.id === event.storyId)
  return event.category === 'outing' && story ? categoryForStory(story) : event.category
}

export type PositionedEvent = { event: CalendarEvent; lane: number; lanes: number }

export function positionEvents(events: CalendarEvent[]): PositionedEvent[] {
  const sorted = [...events].sort((a, b) => a.start - b.start || b.end - a.end)
  const result: PositionedEvent[] = []
  let group: PositionedEvent[] = []
  let ends: number[] = []
  let groupEnd = -1
  function flush() {
    for (const item of group) result.push({ ...item, lanes: ends.length })
    group = []
    ends = []
  }
  for (const event of sorted) {
    if (event.start >= groupEnd) flush()
    let lane = ends.findIndex((end) => end <= event.start)
    if (lane === -1) lane = ends.length
    ends[lane] = event.end
    group.push({ event, lane, lanes: 1 })
    groupEnd = Math.max(groupEnd, event.end)
  }
  flush()
  return result
}
