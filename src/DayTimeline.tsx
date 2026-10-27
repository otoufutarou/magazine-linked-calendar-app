import { useEffect, useRef, useState } from 'react'
import { clock, dateKey, eventCategories } from './events'
import type { CalendarEvent } from './events'
import { categoryForStory, displayCategory, positionEvents } from './recommendations'
import type { Suggestion } from './recommendations'
import { stories } from './stories'

const scale = 1.2

export function DayTimeline({ date, events, suggestions, onEvent, onSuggestion }: {
  date: string; events: CalendarEvent[]; suggestions: Suggestion[]
  onEvent: (event: CalendarEvent) => void; onSuggestion: (suggestion: Suggestion) => void
}) {
  const [now, setNow] = useState(() => new Date())
  const scroll = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => { if (scroll.current) scroll.current.scrollTop = 8 * 60 * scale }, [date])
  const currentMinute = now.getHours() * 60 + now.getMinutes()
  return <div className="timeline-scroll" ref={scroll} role="region" aria-label="1日の縦型タイムライン" tabIndex={0}>
    <div className="day-timeline" style={{ height: 1440 * scale }}>
      {Array.from({ length: 24 }, (_, hour) => <div className="timeline-hour" key={hour} style={{ top: hour * 60 * scale }}><time>{clock(hour * 60)}</time><span /></div>)}
      <div className="timeline-events">
        {positionEvents(events).map(({ event, lane, lanes }) => <button key={event.id} className={`timeline-block confirmed category-${displayCategory(event)}`}
          style={{ top: event.start * scale, height: (event.end - event.start) * scale, left: `calc(${lane / lanes * 100}% + 2px)`, width: `calc(${100 / lanes}% - 5px)` }}
          title={`${event.title} ${clock(event.start)}–${clock(event.end)} ${event.place ?? ''}`}
          aria-label={`${event.title}、${clock(event.start)}から${clock(event.end)}、${eventCategories[displayCategory(event)]}`}
          onClick={() => onEvent(event)}>
          <strong>{stories.find((story) => story.id === event.storyId)?.sponsored && 'PR · '}{event.title}</strong><time>{clock(event.start)}–{clock(event.end)}</time>{event.place && <small>{event.place}</small>}
        </button>)}
        {suggestions.map((suggestion) => <button key={suggestion.story.id} className={`timeline-block tentative category-${categoryForStory(suggestion.story)}`}
          style={{ top: suggestion.start * scale, height: (suggestion.end - suggestion.start) * scale }}
          onClick={() => onSuggestion(suggestion)} aria-label={`雑誌からの提案：${suggestion.story.spot}、${clock(suggestion.start)}から${clock(suggestion.end)}`}>
          <span className="tentative-label">▤ 雑誌からの提案 {suggestion.story.sponsored ? '· PR' : ''}</span><strong>{suggestion.story.spot}</strong><time>{clock(suggestion.start)}–{clock(suggestion.end)}</time>
        </button>)}
        {date === dateKey(now) && <div className="now-line" style={{ top: currentMinute * scale }} aria-label={`現在時刻 ${clock(currentMinute)}`}><span /> <time>{clock(currentMinute)}</time></div>}
      </div>
    </div>
  </div>
}
