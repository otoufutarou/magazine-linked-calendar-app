import { overlaps } from './events.ts'
import type { CalendarEvent } from './events.ts'
import { dayPlan, stories } from './stories.ts'

export function planEvents(date: string): CalendarEvent[] {
  return dayPlan.map((stop) => {
    const story = stories.find((item) => item.id === stop.storyId)!
    return {
      id: `plan-${date}-${story.id}`,
      title: story.spot,
      date,
      start: stop.start,
      end: stop.start + story.duration,
      category: 'outing',
      storyId: story.id,
      note: `${story.magazine} / ${story.area}\n${story.sponsored ? `PR · ${story.sponsored}\n` : ''}一日プランから追加。架空のスポット・移動を含むデモ目安です。`,
    }
  })
}

export function planConflict(events: CalendarEvent[], date: string): string | null {
  const proposed = planEvents(date)
  if (proposed.some((event) => events.some((item) => item.date === date && item.storyId === event.storyId))) {
    return 'プラン内のスポットがすでに登録されています。重複する予定を編集・削除するか、別の日を選んでください。'
  }
  if (proposed.some((event) => overlaps(events, event))) {
    return '既存の予定と時間が重なっています。カレンダーで調整するか、別の日を選んでください。'
  }
  return null
}
