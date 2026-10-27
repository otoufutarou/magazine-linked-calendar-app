import { useState } from 'react'
import { createDemoEvents, dateKey } from './events'
import './App.css'

const weekdays = ['日', '月', '火', '水', '木', '金', '土']
const fullDate = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})

export default function App() {
  const [today] = useState(() => new Date())
  const [events] = useState(() => createDemoEvents(today))
  const [month, setMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  )
  const [selectedDate, setSelectedDate] = useState(() => dateKey(today))
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstWeekday = month.getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7
  const selectedEvents = events.filter((event) => event.releaseDate === selectedDate)
  const selectedDay = new Date(`${selectedDate}T00:00:00`)
  const monthEvents = events.filter((event) =>
    event.releaseDate.startsWith(`${year}-${String(monthIndex + 1).padStart(2, '0')}-`),
  )

  function changeMonth(offset: number) {
    const nextMonth = new Date(year, monthIndex + offset, 1)
    setMonth(nextMonth)
    setSelectedDate(dateKey(nextMonth))
  }

  function resetMonth() {
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(dateKey(today))
  }

  return (
    <main className="app">
      <header className="page-header">
        <p className="eyebrow">MAGAZINE CALENDAR / DEMO</p>
        <h1>雑誌連動カレンダー（デモ）</h1>
        <p>気になる一冊と出会う日を、カレンダーで。</p>
        <p className="demo-notice">掲載内容はすべて架空のサンプルです。データの保存は行いません。</p>
      </header>

      <div className="layout">
        <section className="calendar panel" aria-labelledby="month-heading">
          <div className="calendar-toolbar">
            <div>
              <h2 id="month-heading" aria-live="polite">{year}年{monthIndex + 1}月</h2>
              <p className="muted">発売予定 {monthEvents.length}件</p>
            </div>
            <nav className="month-navigation" aria-label="表示月の切り替え">
              <button type="button" onClick={() => changeMonth(-1)} aria-label="前の月">‹</button>
              <button type="button" onClick={resetMonth}>今月</button>
              <button type="button" onClick={() => changeMonth(1)} aria-label="次の月">›</button>
            </nav>
          </div>

          <div className="calendar-grid" role="group" aria-labelledby="month-heading">
            {weekdays.map((day) => <div className="weekday" key={day}>{day}</div>)}
            {Array.from({ length: cellCount }, (_, index) => {
              const day = index - firstWeekday + 1
              if (day < 1 || day > daysInMonth) {
                return <div className="empty-day" key={`empty-${index}`} aria-hidden="true" />
              }
              const date = new Date(year, monthIndex, day)
              const key = dateKey(date)
              const dayEvents = events.filter((event) => event.releaseDate === key)
              return (
                <button
                  type="button"
                  className={`day${key === dateKey(today) ? ' today' : ''}`}
                  key={key}
                  aria-label={`${fullDate.format(date)}、発売予定${dayEvents.length}件`}
                  aria-pressed={key === selectedDate}
                  aria-current={key === dateKey(today) ? 'date' : undefined}
                  onClick={() => setSelectedDate(key)}
                >
                  <span className="day-number">{day}</span>
                  {dayEvents.length > 0 && (
                    <>
                      <span className="event-count">{dayEvents.length}件</span>
                      <span className="event-preview">{dayEvents[0].title}</span>
                    </>
                  )}
                </button>
              )
            })}
          </div>
          <p className="calendar-help">日付を選ぶと、発売予定の詳細を確認できます。</p>
        </section>

        <section className="details panel" aria-labelledby="details-heading" aria-live="polite">
          <p className="eyebrow">RELEASE NOTES</p>
          <h2 id="details-heading">{fullDate.format(selectedDay)}</h2>
          <p className="muted">この日の発売予定 {selectedEvents.length}件</p>
          {selectedEvents.length === 0 ? (
            <div className="empty-state">
              <p>この日の発売予定はありません</p>
              <p className="muted">件数のある日付を選んでみてください。</p>
            </div>
          ) : (
            <ul className="event-list">
              {selectedEvents.map((event) => (
                <li key={event.id}>
                  <article className="event-card">
                    <span className="event-tag">デモイベント</span>
                    <h3>{event.title}</h3>
                    <p className="release-date">発売日：<time dateTime={event.releaseDate}>{event.releaseDate.replaceAll('-', '/')}</time></p>
                    {event.note && <p className="event-note">{event.note}</p>}
                  </article>
                </li>
              ))}
            </ul>
          )}
          <p className="details-note">サンプルは起動時の当月3・8・15・22・27日に配置しています。</p>
        </section>
      </div>
      <footer>雑誌連動カレンダー · デモ版 / 閲覧専用</footer>
    </main>
  )
}
