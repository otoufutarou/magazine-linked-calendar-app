export type CalendarEvent = {
  id: string
  title: string
  date: string
  start: number
  end: number
  category: 'work' | 'personal' | 'outing'
  note: string
  place?: string
  storyId?: string
}

export type FreeSlot = { start: number; end: number }

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function parseDate(key: string): Date {
  return new Date(`${key}T00:00:00`)
}

export function moveDate(key: string, days: number): string {
  const date = parseDate(key)
  date.setDate(date.getDate() + days)
  return dateKey(date)
}

export function clock(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

export function minutes(value: string): number {
  const [hours, mins] = value.split(':').map(Number)
  return hours * 60 + mins
}

export function freeSlots(events: CalendarEvent[], date: string): FreeSlot[] {
  const busy = events.filter((event) => event.date === date)
    .sort((a, b) => a.start - b.start)
  const slots: FreeSlot[] = []
  let cursor = 9 * 60
  for (const event of busy) {
    const end = Math.min(event.start, 22 * 60)
    if (end - cursor >= 45) slots.push({ start: cursor, end })
    cursor = Math.max(cursor, event.end)
  }
  if (22 * 60 - cursor >= 45) slots.push({ start: cursor, end: 22 * 60 })
  return slots
}

export function overlaps(events: CalendarEvent[], candidate: CalendarEvent): boolean {
  return events.some((event) => event.id !== candidate.id && event.date === candidate.date
    && event.start < candidate.end && event.end > candidate.start)
}

export function isEvent(value: unknown): value is CalendarEvent {
  if (typeof value !== 'object' || value === null) return false
  const event = value as Record<string, unknown>
  return typeof event.id === 'string' && typeof event.title === 'string'
    && event.title.trim().length > 0 && typeof event.date === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(event.date)
    && !Number.isNaN(parseDate(event.date).getTime())
    && dateKey(parseDate(event.date)) === event.date
    && typeof event.start === 'number' && Number.isInteger(event.start) && event.start >= 0
    && typeof event.end === 'number' && Number.isInteger(event.end)
    && event.end <= 1439 && event.end > event.start
    && ['work', 'personal', 'outing'].includes(String(event.category))
    && typeof event.note === 'string'
    && (event.place === undefined || typeof event.place === 'string')
    && (event.storyId === undefined || typeof event.storyId === 'string')
}

export function createDemoEvents(today: Date): CalendarEvent[] {
  const events: CalendarEvent[] = []
  for (let offset = -14; offset <= 35; offset++) {
    const date = moveDate(dateKey(today), offset)
    const weekday = parseDate(date).getDay()
    if (weekday > 0 && weekday < 6) {
      events.push(
        { id: `demo-am-${date}`, title: weekday === 1 ? 'チームミーティング' : '集中ワーク', date, start: 540, end: 720, category: 'work', note: 'デモユーザーのサンプル予定です。自由に編集できます。' },
        { id: `demo-pm-${date}`, title: 'プロジェクトワーク', date, start: 780, end: 1080, category: 'work', note: '18時にお仕事終了。帰り道に寄り道を。' },
      )
      if (weekday === 3) events.push({ id: `demo-yoga-${date}`, title: '夜のヨガ', date, start: 1200, end: 1260, category: 'personal', note: 'ヨガマットを忘れずに。' })
    } else {
      events.push({ id: `demo-weekend-${date}`, title: weekday === 6 ? 'ゆっくり朝ごはん' : '散歩と買いもの', date, start: 600, end: 660, category: 'personal', note: '自分のための時間。' })
    }
  }
  const outings = [
    { day: 2, storyId: 'wine', title: '余韻 / YOIN', start: 1080, duration: 90 },
    { day: 4, storyId: 'coffee', title: '栞のある日', start: 720, duration: 60 },
    { day: 8, storyId: 'garden', title: '木漏れ日の庭', start: 720, duration: 45 },
    { day: 10, storyId: 'dinner', title: '旅の食卓', start: 1080, duration: 60 },
    { day: 12, storyId: 'shop', title: '日々の棚', start: 720, duration: 60 },
    { day: 6, storyId: 'art', title: 'ギャラリー 間', start: 660, duration: 120 },
  ]
  for (const outing of [...outings.map((item) => ({ ...item, day: item.day - 14 })), ...outings]) {
    let date = moveDate(dateKey(today), outing.day)
    if (outing.storyId === 'art') date = moveDate(date, (6 - parseDate(date).getDay() + 7) % 7)
    const start = outing.storyId === 'art' ? 660 : ['shop', 'garden', 'coffee'].includes(outing.storyId) ? 720 : outing.start
    const duration = outing.storyId === 'art' ? 120 : outing.duration
    if (outing.storyId === 'art') {
      while ((parseDate(date).getDay() > 0 && parseDate(date).getDay() < 6)
        || overlaps(events, { id: 'demo-art-candidate', title: outing.title, date, start, end: start + duration, category: 'outing', note: '' })) {
        date = moveDate(date, 1)
      }
    }
    events.push({ id: `demo-outing-${date}-${outing.storyId}`, title: outing.title, date, start, end: start + duration, category: 'outing', storyId: outing.storyId, note: '雑誌から見つけた架空のお出かけのサンプルです。自由に変更できます。' })
  }
  return events
}
