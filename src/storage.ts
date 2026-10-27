import { isEvent } from './events.ts'
import type { CalendarEvent } from './events.ts'

export type SavedData = { events: CalendarEvent[]; favorites: string[]; skipped?: Record<string, string[]> }
const key = 'mag-life-v1'

export function loadData(): { data: SavedData | null; error: string } {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return { data: null, error: '' }
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null || !('events' in data) || !('favorites' in data)
      || !Array.isArray(data.events) || !data.events.every(isEvent)
      || new Set(data.events.map((event) => event.id)).size !== data.events.length
      || !Array.isArray(data.favorites) || !data.favorites.every((id) => typeof id === 'string')
      || ('skipped' in data && (typeof data.skipped !== 'object' || data.skipped === null || Array.isArray(data.skipped)
        || !Object.values(data.skipped).every((ids) => Array.isArray(ids) && ids.every((id) => typeof id === 'string'))))) {
      throw new Error('保存データの形式が正しくありません')
    }
    return { data: { events: data.events, favorites: data.favorites, ...('skipped' in data ? { skipped: data.skipped as Record<string, string[]> } : {}) }, error: '' }
  } catch (error) {
    console.error('Mag Life: failed to load local data', error)
    return { data: null, error: '保存データを読み込めませんでした。デモ予定を表示しています。変更を保存すると既存データが置き換わります。' }
  }
}

export function saveData(data: SavedData): string {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return ''
  } catch (error) {
    console.error('Mag Life: failed to save local data', error)
    return 'このブラウザに保存できませんでした。変更は画面に反映されていますが、再読み込みで失われます。'
  }
}
