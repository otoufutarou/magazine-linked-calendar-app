import type { CSSProperties } from 'react'
import { clock, parseDate, eventCategories } from './events'
import type { CalendarEvent } from './events'
import { displayCategory } from './recommendations'
import { stories } from './stories'

const weekdays = ['日', '月', '火', '水', '木', '金', '土']
const fullDate = new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric', weekday: 'long' })

type CalendarGridProps = {
  days: string[]
  selected: string
  today: string
  selectedMonth: number
  events: CalendarEvent[]
  onSelectDate: (date: string) => void
  onOpenEvent: (event: CalendarEvent) => void
}

function CalendarDays({ days, selected, today, selectedMonth, events, onSelectDate, onOpenEvent, month }: CalendarGridProps & { month: boolean }) {
  return <div className={`calendar-grid ${month ? 'month' : 'week'}`} style={{ '--columns': 7 } as CSSProperties}>
    {month && ['月', '火', '水', '木', '金', '土', '日'].map((day) => <span className="weekday" key={day}>{day}</span>)}
    {days.map((date) => {
      const day = parseDate(date)
      const items = events.filter((event) => event.date === date).sort((a, b) => a.start - b.start)
      const limit = month ? 2 : 5
      return <div className={`calendar-cell ${date === selected ? 'selected' : ''} ${day.getMonth() !== selectedMonth ? 'outside' : ''}`} key={date}>
        <button className={`date-button ${date === today ? 'is-today' : ''}`} onClick={() => onSelectDate(date)} aria-pressed={date === selected} aria-current={date === today ? 'date' : undefined} aria-label={`${fullDate.format(day)}、予定${items.length}件`}>
          {!month && <span>{weekdays[day.getDay()]}</span>}<strong>{day.getDate()}</strong>
        </button>
        <div className="cell-events">
          {items.slice(0, limit).map((event) => <button className={`mini-event ${event.category} category-${displayCategory(event)}`} key={event.id} title={`${clock(event.start)}–${clock(event.end)} ${event.title}`} aria-label={`${event.title}、${eventCategories[displayCategory(event)]}`} onClick={() => { onSelectDate(date); onOpenEvent(event) }}>
            <time>{clock(event.start)}</time><span>{event.storyId && stories.find((story) => story.id === event.storyId)?.sponsored ? 'PR · ' : ''}{event.title}</span>
          </button>)}
          {items.length > limit && <button className="more-events" onClick={() => onSelectDate(date)}>+{items.length - limit}件</button>}
          {items.length === 0 && <span className="free-day">余白</span>}
        </div>
      </div>
    })}
  </div>
}

export function MonthCalendar(props: CalendarGridProps) {
  return <CalendarDays {...props} month />
}

export function WeekCalendar(props: CalendarGridProps) {
  return <CalendarDays {...props} month={false} />
}
