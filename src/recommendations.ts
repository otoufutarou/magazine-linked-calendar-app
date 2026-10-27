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
  const dayEvents = events.filter((event) => event.date === date)
  const used = new Set([...skipped, ...dayEvents.map((event) => event.storyId)])
  const gaps = suggestionSlots(events, date)
  const weekday = new Date(`${date}T00:00:00`).getDay()
  const weekend = weekday === 0 || weekday === 6
  const contextType = [...dayEvents].sort((a, b) => a.start - b.start)
    .find((event) => event.category === 'date' || event.category === 'work' || event.category === 'outdoor')?.category
  const dateSeed = Number(date.replaceAll('-', ''))
  function editorialFit(story: Story, gap: FreeSlot): number {
    const category = storyCategory(story)
    if (contextType === 'date') return ['ビューティー', 'ファッション', 'グルメ'].includes(category) ? 3 : 0
    if (contextType === 'work') {
      if (gap.start >= 17 * 60) return category === 'グルメ' ? 4 : ['カルチャー', '自然'].includes(category) ? 2 : 0
      return ['カルチャー', 'グルメ', 'ファッション'].includes(category) ? 3 : 0
    }
    if (contextType === 'outdoor') return ['自然', 'カルチャー', 'グルメ'].includes(category) ? 4 : 0
    if (weekend) return ['自然', 'カルチャー', 'グルメ'].includes(category) ? 3 : 0
    if (gap.start >= 17 * 60) return category === 'グルメ' ? 2 : 0
    return 0
  }
  function dailyRank(story: Story): number {
    return [...story.id].reduce((sum, character) => (sum * 31 + character.charCodeAt(0)) >>> 0, dateSeed)
  }
  // Fill separate gaps first, then offer a second stop only if room remains.
  for (let pass = 0; pass < 3 && result.length < 3; pass++) {
    for (const gap of gaps) {
      const options = stories.filter((story) => storyKind(story) === 'experience' && !used.has(story.id) && fits(story, gap))
      options.sort((a, b) => storyStart(a, gap) - storyStart(b, gap)
        || editorialFit(b, gap) - editorialFit(a, gap)
        || (gap.end - gap.start < 120 ? a.duration - b.duration : dailyRank(a) - dailyRank(b)))
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
