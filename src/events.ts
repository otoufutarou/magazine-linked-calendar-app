export type CalendarEvent = {
  id: string
  title: string
  date: string
  start: number
  end: number
  category: 'work' | 'personal' | 'outing' | 'date' | 'gourmet' | 'beauty' | 'travel' | 'hobby' | 'outdoor'
  note: string
  place?: string
  storyId?: string
}

export type FreeSlot = { start: number; end: number }
export const eventCategories = {
  work: '仕事', personal: 'プライベート', outing: 'お出かけ', date: 'デート',
  gourmet: 'グルメ', beauty: '美容', travel: '旅行', hobby: '趣味', outdoor: 'アウトドア',
}

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
    && typeof event.category === 'string' && Object.hasOwn(eventCategories, event.category)
    && typeof event.note === 'string'
    && (event.place === undefined || typeof event.place === 'string')
    && (event.storyId === undefined || typeof event.storyId === 'string')
}

export function createDemoEvents(today: Date): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const quietDates = new Set<string>()
  for (let offset = -14; offset <= 35; offset++) {
    const date = moveDate(dateKey(today), offset)
    const weekday = parseDate(date).getDay()
    if (offset >= 0 && offset % 10 === 4) {
      quietDates.add(date)
      continue
    }
    const week = Math.floor((offset + 14) / 7)
    const travelDay = weekday === 3 && week % 3 === 1
    const sample = weekday === 1
      ? [
        { title: 'チーム朝会', start: 570, end: 600, category: 'work' as const },
        { title: '集中作業', start: 615, end: 720, category: 'work' as const },
        { title: '同僚とランチ', start: 720, end: 780, category: 'gourmet' as const },
        { title: week % 2 ? '1on1ミーティング' : '企画レビュー', start: 810, end: 855, category: 'work' as const },
        { title: '資料レビュー', start: 900, end: 960, category: 'work' as const },
        { title: 'ジム', start: 1080, end: 1140, category: 'personal' as const },
      ]
      : weekday === 2
        ? [
          { title: 'オフィスへ移動', start: 510, end: 570, category: 'work' as const },
          { title: 'プロジェクト定例', start: 585, end: 630, category: 'work' as const },
          { title: '集中作業', start: 645, end: 720, category: 'work' as const },
          { title: '同僚とランチ', start: 720, end: 780, category: 'gourmet' as const },
          { title: week % 2 ? 'クライアントMTG' : '制作チームMTG', start: 810, end: 870, category: 'work' as const },
          { title: '提案資料の仕上げ', start: 900, end: 960, category: 'work' as const },
          { title: '帰宅', start: 990, end: 1050, category: 'work' as const },
        ]
        : weekday === 3
          ? travelDay
            ? [
              { title: '大阪出張・新幹線移動', start: 450, end: 570, category: 'work' as const },
              { title: '取引先を訪問', start: 600, end: 690, category: 'work' as const },
              { title: '先方とランチ', start: 690, end: 750, category: 'gourmet' as const },
              { title: '導入相談MTG', start: 780, end: 870, category: 'work' as const },
              { title: '新幹線で帰京', start: 900, end: 1020, category: 'work' as const },
            ]
            : [
              { title: '集中作業', start: 570, end: 690, category: 'work' as const },
              { title: 'デザイン確認MTG', start: 690, end: 735, category: 'work' as const },
              { title: 'ランチ', start: 735, end: 795, category: 'gourmet' as const },
              { title: 'チーム相談', start: 840, end: 900, category: 'work' as const },
              { title: '映画鑑賞', start: 1110, end: 1230, category: 'hobby' as const },
            ]
          : weekday === 4
            ? [
              { title: '今週のタスク整理', start: 570, end: 600, category: 'work' as const },
              { title: 'リモート作業', start: 615, end: 720, category: 'work' as const },
              { title: 'ランチ', start: 720, end: 780, category: 'gourmet' as const },
              { title: week % 2 ? 'パートナー企業とMTG' : 'プロダクト定例', start: 810, end: 870, category: 'work' as const },
              { title: 'メール・翌日準備', start: 900, end: 945, category: 'work' as const },
              { title: '美容院', start: 1020, end: 1080, category: 'beauty' as const },
            ]
            : weekday === 5
              ? [
                { title: '週次チームMTG', start: 600, end: 645, category: 'work' as const },
                { title: '集中作業', start: 660, end: 720, category: 'work' as const },
                { title: '同僚とランチ', start: 720, end: 780, category: 'gourmet' as const },
                { title: '進捗共有', start: 810, end: 855, category: 'work' as const },
                { title: '来週の準備', start: 870, end: 915, category: 'work' as const },
                { title: '友人とディナー', start: 1080, end: 1200, category: 'gourmet' as const },
              ]
              : weekday === 6
                ? [{ title: 'ショッピング', start: 660, end: 750, category: 'outing' as const }, { title: '展覧会', start: 900, end: 1020, category: 'hobby' as const }]
                : [{ title: '朝カフェ', start: 600, end: 660, category: 'gourmet' as const }, { title: '散歩', start: 780, end: 840, category: 'outdoor' as const }]
    const visible = offset % 3 === 1 ? sample.slice(0, 3) : sample
    for (const [index, item] of visible.entries()) events.push({
      id: `demo-${date}-${index}`,
      title: item.title,
      date,
      start: item.start,
      end: item.end,
      category: item.category,
      note: 'デモ用のサンプル予定です。自由に編集できます。',
    })
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
    if (quietDates.has(date)) continue
    if (outing.storyId === 'art') date = moveDate(date, (6 - parseDate(date).getDay() + 7) % 7)
    const start = outing.storyId === 'art' ? 660 : ['shop', 'garden', 'coffee'].includes(outing.storyId) ? 720 : outing.start
    const duration = outing.storyId === 'art' ? 120 : outing.duration
    if (outing.storyId === 'art') {
      while ((parseDate(date).getDay() > 0 && parseDate(date).getDay() < 6)
        || quietDates.has(date)
        || overlaps(events, { id: 'demo-art-candidate', title: outing.title, date, start, end: start + duration, category: 'outing', note: '' })) {
        date = moveDate(date, 1)
      }
    }
    const candidate: CalendarEvent = { id: `demo-outing-${date}-${outing.storyId}`, title: outing.title, date, start, end: start + duration, category: 'outing', storyId: outing.storyId, note: '雑誌から見つけた架空のお出かけのサンプルです。自由に編集できます。' }
    if (!overlaps(events, candidate)) events.push(candidate)
  }
  return events
}
