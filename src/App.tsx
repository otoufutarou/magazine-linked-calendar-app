import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, PointerEvent, ReactNode } from 'react'
import { clock, createDemoEvents, dateKey, eventCategories, freeSlots, isEvent, minutes, moveDate, overlaps, parseDate } from './events'
import type { CalendarEvent, FreeSlot } from './events'
import { dayPlan, fits, magazineEditions, magazineFor, stories, storyCategory, storyStart, storyTone } from './stories'
import type { Story } from './stories'
import { loadData, saveData } from './storage'
import { planConflict, planEvents } from './plans'
import { categoryForStory, dailySuggestions, displayCategory, storyKind, suggestionSlots } from './recommendations'
import type { Suggestion } from './recommendations'
import { DayTimeline } from './DayTimeline'
import { products, productFor } from './products'
import type { Product } from './products'
import { ProductCards, ProductImage } from './ProductCards'
import './App.css'
import './Timeline.css'
import { selectEditorialCopy } from './data/editorialCopies'
import type { EditorialCategory } from './data/editorialCopies'

type Page = 'calendar' | 'discover' | 'favorites' | 'plans'
type View = 'day' | 'week' | 'month'
const weekdays = ['日', '月', '火', '水', '木', '金', '土']
const fullDate = new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric', weekday: 'long' })
const image = (story: Story) => `${import.meta.env.BASE_URL}images/${story.image}`
function editorialCategory(category: string | undefined): EditorialCategory | undefined {
  if (category === 'カルチャー') return '男性ライフスタイル'
  if (category === '自然') return 'アウトドア'
  if (category === 'ビューティー') return '女性美容'
  if (category === 'ファッション') return '働く女性ファッション'
  if (category === 'グルメ') return 'グルメ'
  return undefined
}

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18m-13 4h1m6 0h1m-8 3h1" /></>,
    discover: <><circle cx="12" cy="12" r="9" /><path d="m16 8-2 6-6 2 2-6Z" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    sparkle: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" /><path d="M20 2v4m-2-2h4" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.calendar}</svg>
}

function Modal({ label, close, children, wide = false, swipe = false }: { label: string; close: () => void; children: ReactNode; wide?: boolean; swipe?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!
    dialog.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous; dialog.close() }
  }, [])
  return <dialog ref={ref} className={`modal ${wide ? 'wide' : ''} ${swipe ? 'proposal-modal' : ''}`} aria-label={label} onCancel={close} onClick={(event) => { if (event.target === event.currentTarget) close() }}>
    <button className="icon-button modal-close" onClick={close} aria-label="閉じる"><Icon name="close" /></button>
    {children}
  </dialog>
}

function StoryCard({ story, favorite, onFavorite, onSave, onOpen, onAdd, onSkip, compact = false, editorialCopy }: {
  story: Story; favorite: boolean; onFavorite: () => void; onSave?: () => void; onOpen: () => void; onAdd?: () => void; onSkip?: () => void; compact?: boolean; editorialCopy?: string
}) {
  const [drag, setDrag] = useState(0)
  const [flight, setFlight] = useState<'left' | 'right' | null>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const startedAt = useRef(0)
  const suppressClick = useRef(false)
  const locked = useRef(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  function fly(direction: 'left' | 'right') {
    if (locked.current) return
    locked.current = true
    setFlight(direction)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    timer.current = window.setTimeout(() => {
      if (direction === 'right') (onSave ?? onFavorite)()
      else onSkip?.()
      setDrag(0)
      setFlight(null)
      locked.current = false
    }, reduced ? 0 : 320)
  }
  function down(event: PointerEvent<HTMLButtonElement>) {
    if (!onSkip || locked.current || !event.isPrimary || event.button !== 0) return
    start.current = { x: event.clientX, y: event.clientY }
    startedAt.current = performance.now()
    suppressClick.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function up(event: PointerEvent<HTMLButtonElement>) {
    if (start.current === null) return
    const distance = event.clientX - start.current.x
    const vertical = event.clientY - start.current.y
    start.current = null
    suppressClick.current = Math.abs(distance) > 12
    setDrag(0)
    const elapsed = Math.max(1, performance.now() - startedAt.current)
    if ((Math.abs(distance) > 85 || (Math.abs(distance) > 35 && Math.abs(distance) / elapsed > 0.65))
      && Math.abs(distance) > Math.abs(vertical) * 1.3) fly(distance > 0 ? 'right' : 'left')
  }
  return <article className={`story-card tone-${storyTone(story.id)} ${compact ? 'compact' : ''} ${drag && !flight ? 'dragging' : ''} ${flight ? 'flying' : ''}`} style={{ transform: flight ? `translateX(${flight === 'right' ? '' : '-'}${Math.max(window.innerWidth, 700) * 1.2}px) rotate(${flight === 'right' ? 22 : -22}deg)` : `translateX(${drag}px) rotate(${drag / 24}deg)` }} aria-busy={!!flight}>
    <button className="story-open" onClick={() => { if (!suppressClick.current && !locked.current) onOpen(); suppressClick.current = false }} onPointerDown={down} onPointerMove={(event) => { if (start.current !== null && Math.abs(event.clientX - start.current.x) > Math.abs(event.clientY - start.current.y) * 1.3) { setDrag(event.clientX - start.current.x); suppressClick.current = true } }} onPointerUp={up} onPointerCancel={() => { start.current = null; setDrag(0); suppressClick.current = true }} style={{ touchAction: onSkip ? 'pan-y' : 'auto' }} aria-label={`記事を読む：${story.title.replace('\n', '')}`}>
      <div className="story-photo"><img src={image(story)} alt={story.spot} loading="lazy" draggable={false} /><span className="photo-tag">{story.label}</span>{story.sponsored && <span className="pr-badge">PR</span>}{Math.abs(drag) > 35 && <span className={`swipe-feedback ${drag > 0 ? 'add' : ''}`}>{drag > 0 ? '♥ お気に入り' : '今回はパス'}</span>}</div>
      <div className="story-copy"><p className="magazine-label">{story.magazine} <span>— {story.issue.split(' / ')[0]}</span></p><h3>{story.title}</h3><div className="story-meta"><span><Icon name="pin" size={14} />{story.area}</span><span><Icon name="clock" size={14} />{storyKind(story) === 'article' ? '読みもの' : `${story.duration}分`}</span></div>{!compact && <p className="reason">{editorialCopy ?? story.reason}</p>}{story.sponsored && <p className="sponsor-label">PR · {story.sponsored}</p>}</div>
    </button>
    <div className="card-actions">
      {onSkip && <button className="skip-button" disabled={!!flight} onClick={() => fly('left')}><Icon name="close" size={16} />今回はパス</button>}
      <button className={`favorite-button ${favorite ? 'saved' : ''}`} disabled={!!flight} onClick={() => onSkip ? fly('right') : onFavorite()} aria-label={favorite ? (onSkip ? '保存済み・次の提案へ' : 'お気に入りを解除') : 'お気に入りに保存'} aria-pressed={favorite}><Icon name="heart" size={18} /></button>
      {onAdd ? <button className="primary small" onClick={onAdd}><Icon name="plus" size={16} />予定に追加</button> : <button className="text-button" onClick={onOpen}>記事を読む <Icon name="arrow" size={16} /></button>}
    </div>
  </article>
}

function MagazineCover({ story, onOpen }: { story: Story; onOpen: () => void }) {
  const edition = magazineFor(story)
  return <button className={`magazine-cover tone-${storyTone(story.id)}`} onClick={onOpen} aria-label={`${edition.name}の提案を開く`}>
    <img src={`${import.meta.env.BASE_URL}images/${edition.image}`} alt="" />
    <span className="cover-top">ORIGINAL FICTIONAL MAGAZINE · {story.issue.split(' / ')[0]}</span>
    <strong>{edition.name}</strong><span className="cover-genre">{edition.genre}</span>
    <span className="cover-line">{edition.line}</span><span className="cover-open">タップして提案を読む ↗</span>
  </button>
}

function ProposalDeck({ suggestions, first, favorites, onSave, onSkip, onOpen, onAdd }: {
  suggestions: Suggestion[]; first: string; favorites: string[]; onSave: (story: Story) => void; onSkip: (story: Story) => void; onOpen: (story: Story) => void; onAdd: (story: Story, start: number) => void
}) {
  const [handled, setHandled] = useState<string[]>([])
  const [feedback, setFeedback] = useState('')
  const ordered = [...suggestions.filter((item) => item.story.id === first), ...suggestions.filter((item) => item.story.id !== first)]
  const remaining = ordered.filter((item) => !handled.includes(item.story.id))
  const current = remaining[0]
  return <div className="proposal-deck"><p className="eyebrow">MAGAZINE SUGGESTIONS · デモ推薦</p><h2>余白で、なにしよう？</h2><p className="proposal-time" role="status" aria-live="polite">{feedback || (current ? `${clock(current.start)}–${clock(current.end)} · 保存だけでは予定に登録されません` : '今日の提案はここまで。')}</p>
    {current ? <div className="deck-stack">{remaining[1] && <div className="deck-next" aria-hidden="true"><img src={image(remaining[1].story)} alt="" /><strong>{remaining[1].story.spot}</strong></div>}
      <StoryCard key={current.story.id} story={current.story} favorite={favorites.includes(current.story.id)} onFavorite={() => onSave(current.story)}
        onSave={() => { onSave(current.story); setHandled((ids) => [...ids, current.story.id]); setFeedback('♥ 保存しました。予定にはまだ登録されていません') }} onSkip={() => { onSkip(current.story); setHandled((ids) => [...ids, current.story.id]); setFeedback('提案をスキップしました') }}
        onOpen={() => onOpen(current.story)} onAdd={() => onAdd(current.story, current.start)} />
    </div> : <p className="collection-empty">保存した提案は「お気に入り」から確認できます。</p>}
    <p className="swipe-hint">← スキップ <span>タップで記事の詳細</span> 保存 ♥ →</p>
  </div>
}

function EventDetail({ event, favorite, onFavorite, onEdit, onOpen, close, favorites, onProductFavorite, onProductOpen }: { event: CalendarEvent; favorite: boolean; onFavorite: (story: Story) => void; onEdit: () => void; onOpen: (story: Story) => void; close: () => void; favorites: string[]; onProductFavorite: (product: Product) => void; onProductOpen: (product: Product) => void }) {
  const related = relatedStory(event)
  return <Modal label="予定の詳細" close={close} wide><div className={`event-detail ${event.category} tone-${storyTone(related.id)}`}>
    <div className={`event-detail-heading category-${displayCategory(event)}`}><p className="eyebrow">{eventCategories[event.category]}</p><h2>{event.title}</h2><p>{fullDate.format(parseDate(event.date))} · {parseDate(event.date).getFullYear()}</p></div>
    <div className="event-detail-body"><dl className="event-facts"><div><dt>時間</dt><dd>{clock(event.start)} – {clock(event.end)}</dd></div><div><dt>場所</dt><dd>{event.place || (event.storyId ? related.address : '未設定')}</dd></div><div><dt>メモ</dt><dd>{event.note || 'メモはありません'}</dd></div></dl><button className="secondary" onClick={onEdit}>予定を編集する</button>
    <section className="little-inspiration"><section className="related-edition"><div><p className="eyebrow">A LITTLE INSPIRATION</p><h3>この予定に、<br />新しい「好き」を。</h3><p>{related.reason}</p><small>{related.sponsored ? 'PR · タイアップ記事' : '編集部のおすすめ記事'}</small><button className="favorite-detail secondary" aria-pressed={favorite} onClick={() => onFavorite(related)}><Icon name="heart" />{favorite ? '保存済み' : 'おすすめを保存'}</button></div><MagazineCover story={related} onOpen={() => onOpen(related)} /></section><ProductCards items={[productFor(related)]} favorites={favorites} onFavorite={onProductFavorite} onOpen={onProductOpen} /></section></div>
  </div></Modal>
}

function relatedStory(event: CalendarEvent): Story {
  const ids: Partial<Record<CalendarEvent['category'], string>> = { work: 'style', travel: 'coffee', outdoor: 'garden', gourmet: 'dinner', hobby: 'art', date: 'wine' }
  return stories.find((story) => story.id === event.storyId) ?? stories.find((story) => story.id === (ids[event.category] ?? 'beauty'))!
}

function EventForm({ event, events, onSave, onDelete, close }: { event: CalendarEvent; events: CalendarEvent[]; onSave: (event: CalendarEvent) => void; onDelete: () => void; close: () => void }) {
  const [error, setError] = useState('')
  const exists = events.some((item) => item.id === event.id)
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const candidate: CalendarEvent = { ...event, title: String(data.get('title')).trim(), date: String(data.get('date')), start: minutes(String(data.get('start'))), end: minutes(String(data.get('end'))), category: data.get('category') as CalendarEvent['category'], note: String(data.get('note')).trim(), place: String(data.get('place')).trim() }
    if (!isEvent(candidate)) { setError('タイトル・日付・時間を確認してください。終了時刻は開始時刻より後にしてください。'); return }
    if (overlaps(events, candidate)) { setError('同じ時間に別の予定があります。時間を調整してください。'); return }
    onSave(candidate)
  }
  return <Modal label={exists ? '予定を編集' : '予定を追加'} close={close}>
    <form className="event-form" onSubmit={submit}>
      <p className="eyebrow">YOUR TIME, YOUR LIFE</p><h2>{exists ? '予定を編集' : event.storyId ? '日時を確認して追加' : '新しい予定'}</h2>
      <label>タイトル<input name="title" defaultValue={event.title} placeholder="どんな時間にしますか？" required maxLength={80} autoFocus /></label>
      <label>日付<input name="date" type="date" defaultValue={event.date} required min="1900-01-01" max="2100-12-31" /></label>
      <div className="form-row"><label>開始<input name="start" type="time" defaultValue={clock(event.start)} required /></label><label>終了<input name="end" type="time" defaultValue={clock(event.end)} required /></label></div>
      <label>カテゴリー<select name="category" defaultValue={event.category}>{Object.entries(eventCategories).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <label>場所<input name="place" defaultValue={event.place ?? (event.storyId ? stories.find((story) => story.id === event.storyId)?.address : '')} placeholder="場所・住所を入力" maxLength={200} /></label>
      <label>メモ<textarea name="note" defaultValue={event.note} rows={3} maxLength={1000} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">{exists && <button type="button" className="danger-button" onClick={onDelete}>予定を削除</button>}<button type="submit" className="primary">保存する <Icon name="check" size={17} /></button></div>
    </form>
  </Modal>
}

export default function App() {
  const [initial] = useState(loadData)
  const [today] = useState(() => dateKey(new Date()))
  const [events, setEvents] = useState(() => initial.data?.events ?? createDemoEvents(parseDate(today)))
  const [favorites, setFavorites] = useState<string[]>(() => initial.data?.favorites ?? [])
  const [storageError, setStorageError] = useState(initial.error)
  const [page, setPage] = useState<Page>('calendar')
  const [view, setView] = useState<View>('day')
  const [selected, setSelected] = useState(today)
  const [slotChoice, setSlotChoice] = useState<number | null>(null)
  const [skipped, setSkipped] = useState<Record<string, string[]>>(() => initial.data?.skipped ?? {})
  const [proposal, setProposal] = useState<string | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [reviewed, setReviewed] = useState<string[]>([])
  const [article, setArticle] = useState<Story | null>(null)
  const [editor, setEditor] = useState<CalendarEvent | null>(null)
  const [detail, setDetail] = useState<CalendarEvent | null>(null)
  const [toast, setToast] = useState('')
  const [filter, setFilter] = useState('すべて')
  const [planDate, setPlanDate] = useState(() => {
    let date = moveDate(today, 1)
    while ((parseDate(date).getDay() > 0 && parseDate(date).getDay() < 6) || planConflict(events, date)) date = moveDate(date, 1)
    return date
  })
  const [planError, setPlanError] = useState('')
  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 4500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const selectedDate = parseDate(selected)
  const slots = freeSlots(events, selected)
  const safeSlots = suggestionSlots(events, selected)
  const suggestions = useMemo(() => dailySuggestions(events, selected, [...(skipped[selected] ?? []), ...(skipped.discover ?? [])]), [events, selected, skipped])
  const slot = slots.find((item) => item.start === slotChoice) ?? slots.find((item) => item.start >= 1080) ?? slots[0]
  const slotKey = `${selected}-${slot?.start}`
  const candidates = slot ? stories.filter((story) => storyKind(story) === 'experience' && safeSlots.some((safe) => safe.start >= slot.start && safe.end <= slot.end && fits(story, safe)) && ![...(skipped[selected] ?? []), ...(skipped.discover ?? []), ...reviewed].includes(story.id) && !events.some((event) => event.date === selected && event.storyId === story.id)) : []
  const recommended = candidates[0]
  const recommendedCategory = recommended ? editorialCategory(storyCategory(recommended)) : undefined
  const recommendedId = recommended?.id
  const slotStart = slot?.start
  const slotEnd = slot?.end
  const recommendedCopy = recommendedId ? selectEditorialCopy({
    date: selected,
    events,
    freeMinutes: slotStart !== undefined && slotEnd !== undefined ? slotEnd - slotStart : 0,
    placement: 'Recommendation',
    category: recommendedCategory,
    recommendationId: recommendedId,
    savedIds: favorites,
    skippedIds: [...(skipped[selected] ?? []), ...(skipped.discover ?? [])],
  }) : null
  const dayEvents = events.filter((event) => event.date === selected).sort((a, b) => a.start - b.start)
  const tickerCopy = useMemo(() => selectEditorialCopy({
    date: selected,
    events,
    freeMinutes: Math.max(0, ...freeSlots(events, selected).map((free) => free.end - free.start)),
    placement: 'Ticker',
    savedIds: favorites,
    skippedIds: [...(skipped[selected] ?? []), ...(skipped.discover ?? [])],
  }), [selected, events, favorites, skipped])
  const whisperCopies = useMemo(() => {
    const usedCopyIds = new Set([tickerCopy.id])
    return suggestions.slice(0, 2).map((suggestion) => {
      const copy = selectEditorialCopy({
        date: selected,
        events,
        freeMinutes: suggestion.end - suggestion.start,
        placement: 'Whisper',
        category: editorialCategory(storyCategory(suggestion.story)),
        recommendationId: suggestion.story.id,
        savedIds: favorites,
        skippedIds: [...(skipped[selected] ?? []), ...(skipped.discover ?? [])],
        excludeCopyIds: [...usedCopyIds],
      })
      usedCopyIds.add(copy.id)
      return { storyId: suggestion.story.id, copy }
    })
  }, [selected, events, suggestions, favorites, skipped, tickerCopy])
  const scheduledStory = (story: Story) => events.some((event) => event.date === selected && event.storyId === story.id)
  const weekStart = moveDate(selected, -((selectedDate.getDay() + 6) % 7))
  const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  const monthGridStart = moveDate(dateKey(monthStart), -((monthStart.getDay() + 6) % 7))
  const monthCells = Math.ceil((((monthStart.getDay() + 6) % 7) + new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate()) / 7) * 7
  const days = view === 'month' ? Array.from({ length: monthCells }, (_, index) => moveDate(monthGridStart, index)) : view === 'week' ? Array.from({ length: 7 }, (_, index) => moveDate(weekStart, index)) : [selected]

  function persist(nextEvents: CalendarEvent[], nextFavorites = favorites, nextSkipped = skipped) {
    setEvents(nextEvents)
    setFavorites(nextFavorites)
    setSkipped(nextSkipped)
    setStorageError(saveData({ events: nextEvents, favorites: nextFavorites, skipped: nextSkipped }))
  }
  function toggleFavorite(id: string) {
    const saved = favorites.includes(id)
    persist(events, saved ? favorites.filter((item) => item !== id) : [...favorites, id])
    setToast(saved ? 'お気に入りから外しました' : 'お気に入りに保存しました')
  }
  function favorite(story: Story) { toggleFavorite(story.id) }
  function saveFavorite(story: Story) {
    if (!favorites.includes(story.id)) persist(events, [...favorites, story.id])
    setToast('お気に入りに保存しました。予定にはまだ登録されていません')
  }
  function saveAndAdvance(story: Story) {
    saveFavorite(story)
    setReviewed((ids) => [...new Set([...ids, story.id])])
  }
  function selectDate(date: string) { setSelected(date); setSlotChoice(null) }
  function navigatePage(next: Page) {
    setPage(next)
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  function navigate(offset: number) {
    if (view === 'month') selectDate(dateKey(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1)))
    else selectDate(moveDate(selected, offset * (view === 'week' ? 7 : 1)))
  }
  function newEvent() {
    const next = slots[0]
    setEditor({ id: crypto.randomUUID(), title: '', date: selected, start: next?.start ?? 540, end: next ? Math.min(next.start + 60, next.end) : 600, category: 'personal', note: '' })
  }
  function available(story: Story): FreeSlot | undefined {
    if (storyKind(story) !== 'experience') return undefined
    return safeSlots.find((item) => slot && item.start >= slot.start && item.end <= slot.end && fits(story, item)) ?? safeSlots.find((item) => fits(story, item))
  }
  function addStory(story: Story, requestedStart?: number) {
    const free = available(story)
    if (scheduledStory(story)) { setToast('この記事は選択日の予定に追加済みです'); return }
    if (!free) { setToast('この日に合う空き時間がありません。別の日を選んでください'); return }
    const placed = suggestions.find((item) => item.story.id === story.id)
    const start = requestedStart ?? placed?.start ?? storyStart(story, free)
    const event: CalendarEvent = { id: crypto.randomUUID(), title: story.spot, date: selected, start, end: start + story.duration, category: categoryForStory(story), place: story.address, note: `${story.magazine} / ${story.area}\n${story.sponsored ? `PR · ${story.sponsored}\n` : ''}架空のスポットです。前後の移動に各10分を確保するデモ目安です。`, storyId: story.id }
    if (overlaps(events, event)) { setToast('予定が重なっています。別の時間を選んでください'); return }
    setEditor(event)
    setArticle(null)
    setProposal(null)
  }
  function skipStory(story: Story, scope = selected) {
    persist(events, favorites, { ...skipped, [scope]: [...new Set([...(skipped[scope] ?? []), story.id])] })
    setToast('提案をスキップしました。カレンダーの仮表示からも除外します')
  }
  function openCalendar() {
    navigatePage('calendar')
  }
  function addPlan() {
    const error = planConflict(events, planDate)
    if (error) { setPlanError(error); return }
    persist([...events, ...planEvents(planDate)])
    selectDate(planDate)
    setPage('calendar')
    setPlanError('')
    setToast('一日プランの4件をカレンダーに追加しました')
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  const filteredStories = stories.filter((story) => (page !== 'favorites' || favorites.includes(story.id)) && (page === 'favorites' || ![...(skipped.discover ?? []), ...reviewed].includes(story.id)) && (filter === 'すべて' || storyCategory(story) === filter))

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href={import.meta.env.BASE_URL} onClick={(e) => { e.preventDefault(); openCalendar() }}>Mag Life<span className="brand-dot">.</span><small>日常に、余白と出会いを。</small></a>
      <p className="nav-caption">MY WORKSPACE</p>
      <nav className="main-nav" aria-label="メインナビゲーション">{([
        ['calendar', 'calendar', 'カレンダー'], ['discover', 'discover', '見つける'], ['plans', 'sparkle', '一日プラン'], ['favorites', 'heart', 'お気に入り'],
      ] as const).map(([id, icon, label]) => <button key={id} onClick={() => navigatePage(id)} className={page === id ? 'active' : ''} aria-current={page === id ? 'page' : undefined}><Icon name={icon} /><span>{label}</span>{id === 'favorites' && favorites.length > 0 && <span className="nav-count">{favorites.length}</span>}</button>)}</nav>
      <div className="sidebar-note"><span className="tiny-sparkle">✧</span><p>予定のない時間に、<br />新しい「好き」を。</p><span>雑誌の視点で、毎日をちょっと豊かに。</span></div>
      <div className="profile"><div className="avatar">M</div><div><strong>Misaki</strong><small>デモアカウント</small></div><span className="demo-pill">DEMO</span></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><span>MAKE ROOM FOR SOMETHING GOOD</span><div><span className="status-dot" />あなたの暮らしに、ちょうどいい発見</div></header>
      {page === 'calendar' && <button className="editorial-ticker" onClick={() => setArticle(stories.find((story) => story.id === tickerCopy.recommendationId) ?? recommended ?? stories[0])} aria-label={`編集部から今日のひとこと：${tickerCopy.text}。タップして関連記事を読む`}>
        <span className="ticker-track"><span><Icon name="sparkle" size={15} />{tickerCopy.text}<b>FROM {tickerCopy.magazineId.replaceAll('-', ' ').toUpperCase()}</b></span><span aria-hidden="true"><Icon name="sparkle" size={15} />{tickerCopy.text}<b>FROM {tickerCopy.magazineId.replaceAll('-', ' ').toUpperCase()}</b></span></span>
      </button>}
      {storageError && <div className="storage-error" role="alert">{storageError}<button onClick={() => setStorageError(saveData({ events, favorites, skipped }))}>保存を再試行</button></div>}
      <section className={`page-intro ${page === 'calendar' ? 'calendar-intro' : ''}`}><div><p className="eyebrow">{page === 'calendar' ? 'YOUR PERSONAL EDITOR' : page === 'discover' ? 'THE EDITOR’S SELECTION' : page === 'plans' ? 'A DAY, BEAUTIFULLY PLANNED' : 'YOUR LITTLE COLLECTION'}</p><h1>{page === 'calendar' ? 'カレンダー' : page === 'discover' ? '次の「行ってみたい」に出会う。' : page === 'plans' ? '一日を、ひとつの物語に。' : '好きな時間を、とっておく。'}</h1><p>{page === 'calendar' ? '日々の隙間に、雑誌を。' : page === 'discover' ? '雑誌をめくるように、街の楽しみを見つけよう。' : page === 'plans' ? '編集部が選んだ記事をつなぐ、小さなお出かけプラン。' : '心が動いた場所を、次のお出かけのきっかけに。'}</p></div><button className="primary add-event" aria-label="予定を追加" onClick={newEvent}><Icon name="plus" size={18} />予定を追加</button></section>

      {page === 'calendar' && <>
        <section className="hero" aria-label="編集部の特集">
          <img src={`${import.meta.env.BASE_URL}images/hero.jpg`} alt="食事をゆっくり楽しむレストランの風景（イメージ）" />
          <div className="hero-shade" /><div className="hero-copy"><p className="hero-kicker">A LITTLE DETOUR, A BETTER DAY</p><h2>まっすぐ帰るには、<br />もったいない夜がある。</h2><p>一杯のワイン、一冊の本、新しい景色。<br />いつもの毎日に、小さなときめきを。</p><button onClick={() => setArticle(stories[0])}>今夜の寄り道を読む <Icon name="arrow" size={18} /></button></div><span className="hero-issue">HOMME DAYS &nbsp; / &nbsp; THE EVENING ISSUE</span>
        </section>
        <div className="workspace">
          <section className="calendar-panel" aria-label="カレンダー">
            <div className="section-heading"><div><p className="eyebrow">MY CALENDAR</p><h2>わたしのカレンダー</h2></div><span className="subtle">予定も、楽しみも。</span></div>
            <div className="calendar-toolbar"><div className="date-nav"><h3>{selectedDate.getFullYear()}<span>年</span> {selectedDate.getMonth() + 1}<span>月</span></h3><button className="icon-button" onClick={() => navigate(-1)} aria-label={`前の${view === 'month' ? '月' : view === 'week' ? '週' : '日'}`}>‹</button><button className="icon-button" onClick={() => navigate(1)} aria-label={`次の${view === 'month' ? '月' : view === 'week' ? '週' : '日'}`}>›</button><button className="today-button" onClick={() => selectDate(today)}>今日</button></div><div className="view-switch" aria-label="カレンダー表示">{([['day', '日'], ['week', '週'], ['month', '月']] as const).map(([id, label]) => <button key={id} onClick={() => setView(id)} aria-pressed={view === id}>{label}</button>)}</div></div>
            {view !== 'day' && <div className={`calendar-grid ${view}`} style={{ '--columns': 7 } as React.CSSProperties}>
              {view === 'month' && ['月', '火', '水', '木', '金', '土', '日'].map((day) => <span className="weekday" key={day}>{day}</span>)}
              {days.map((date) => {
                const day = parseDate(date)
                const items = events.filter((event) => event.date === date).sort((a, b) => a.start - b.start)
                const limit = view === 'month' ? 2 : 5
                return <div className={`calendar-cell ${date === selected ? 'selected' : ''} ${day.getMonth() !== selectedDate.getMonth() ? 'outside' : ''}`} key={date}>
                  <button className={`date-button ${date === today ? 'is-today' : ''}`} onClick={() => { selectDate(date); setView('day') }} aria-pressed={date === selected} aria-current={date === today ? 'date' : undefined} aria-label={`${fullDate.format(day)}、予定${items.length}件`}>{view !== 'month' && <span>{weekdays[day.getDay()]}</span>}<strong>{day.getDate()}</strong></button>
                  <div className="cell-events">{items.slice(0, limit).map((event) => <button className={`mini-event ${event.category} category-${displayCategory(event)}`} key={event.id} title={`${clock(event.start)}–${clock(event.end)} ${event.title}`} onClick={() => { selectDate(date); setDetail(event) }}><time>{clock(event.start)}</time><span>{event.storyId && stories.find((story) => story.id === event.storyId)?.sponsored ? 'PR · ' : ''}{event.title}</span></button>)}{items.length > limit && <button className="more-events" onClick={() => { selectDate(date); setView('day') }}>+{items.length - limit}件</button>}{items.length === 0 && <span className="free-day">余白</span>}</div>
                </div>
              })}
            </div>}
            <div className="calendar-legend"><span><i className="work-dot" />確定した予定</span><span><i className="proposal-dot" />雑誌からの仮提案</span><span className="local-label">デモ推薦 · 移動目安10分 · 最大3件</span></div>
            {view === 'day' && <div className="day-agenda">
              <div className="agenda-heading"><h3>{fullDate.format(selectedDate)}</h3><button className="text-button" onClick={newEvent}><Icon name="plus" size={15} />予定を追加</button></div>
              {dayEvents.length === 0 && <p className="empty-agenda">予定はありません。自由な一日を、どう過ごしますか？</p>}
              <DayTimeline date={selected} events={dayEvents} suggestions={suggestions} whispers={whisperCopies} onEvent={setDetail} onSuggestion={(item) => setProposal(item.story.id)} />
              <div className="free-time-banner"><Icon name="sparkle" size={22} /><div><strong>{slots.length ? `${slots.length}つの空き時間が見つかりました` : 'この日は予定がいっぱいです'}</strong><p>{slots.length ? '45分以上の余白から、おすすめをお届け。' : '別の日を選んで、次の寄り道を探しましょう。'}</p></div></div>
              {slots.some((item) => fits(stories[3], item)) && <button className="native-ad" onClick={() => setArticle(stories[3])}><img src={image(stories[3])} alt="" /><span><small>PR · Calendar Native Ads</small><strong>45分の余白に、緑の寄り道。</strong><span>記事を読んでから、予定に追加できます。</span></span><Icon name="arrow" size={18} /></button>}
            </div>}
          </section>
          <aside className="recommendation-panel" aria-label="空き時間へのおすすめ">
            <div className="section-heading"><div><p className="eyebrow">JUST FOR YOUR FREE TIME</p><h2><Icon name="sparkle" size={20} />余白に、ひとつ提案。</h2></div></div>
            <p className="recommendation-intro">{selectedDate.getDay() === 5 && slot && slot.start >= 1080 ? '仕事終わりに、ちょっと寄り道しませんか？' : slot && slot.start >= 1080 ? '今日の終わりに、自分だけのごほうびを。' : '次の予定まで、好きなことをひとつ。'}</p>
            <div className="slot-picker" aria-label="提案する空き時間">{slots.map((item) => <button key={item.start} aria-pressed={slot?.start === item.start} onClick={() => setSlotChoice(item.start)}><Icon name="clock" size={13} />{clock(item.start)}–{clock(item.end)}</button>)}</div>
            {recommended ? <StoryCard key={`${slotKey}-${recommended.id}`} story={recommended} editorialCopy={recommendedCopy?.text} favorite={favorites.includes(recommended.id)} onFavorite={() => favorite(recommended)} onSave={() => saveAndAdvance(recommended)} onOpen={() => setArticle(recommended)} onAdd={() => addStory(recommended)} onSkip={() => skipStory(recommended)} /> : <div className="recommendation-empty"><Icon name="discover" size={32} /><h3>{slot ? 'この時間の提案は、ここまで。' : '新しい余白を探しましょう。'}</h3><p>{slot ? '別の空き時間や日付も試してみてください。' : '予定の編集や日付の移動で、おすすめが変わります。'}</p>{slot && ((skipped[selected]?.length ?? 0) > 0 || reviewed.length > 0) && <button className="secondary" onClick={() => { persist(events, favorites, { ...skipped, [selected]: [] }); setReviewed([]) }}>もう一度見る</button>}</div>}
            <p className="swipe-hint">← パス <span>ドラッグ / スワイプ</span> ♥ 保存 →</p>
            <div className="editor-note"><span>FROM THE EDITORS</span><p>何もしない時間も、<br />何かに出会う時間も。<br />あなたの余白は、あなたのもの。</p><button className="text-button" onClick={() => navigatePage('discover')}>ほかの記事を見つける <Icon name="arrow" size={16} /></button></div>
          </aside>
        </div>
      </>}

      {(page === 'discover' || page === 'favorites') && <section className="collection">
        {page === 'discover' && <section className="magazine-shelf" aria-label="架空の雑誌コレクション"><div className="section-heading"><div><p className="eyebrow">SIX PERSPECTIVES. YOUR NEXT CHAPTER.</p><h2>今日の気分で、表紙を選ぶ。</h2></div></div><div className="magazine-strip">{magazineEditions.map((edition) => <MagazineCover key={edition.name} story={stories.find((story) => story.magazine === edition.name)!} onOpen={() => setArticle(stories.find((story) => story.magazine === edition.name)!)} />)}</div><p className="fiction-note">すべてオリジナルの架空雑誌です。横スクロールで6つの視点を。</p></section>}
        <div className="collection-toolbar"><div className="filter-tabs" aria-label="記事カテゴリー">{['すべて', 'グルメ', 'カルチャー', '自然', 'ビューティー', 'ファッション'].map((label) => <button key={label} aria-pressed={filter === label} onClick={() => setFilter(label)}>{label}</button>)}</div><span>{page === 'favorites' ? `${favorites.length}件の保存` : `${stories.length}の小さな寄り道`}</span></div>
        <div className="collection-date"><Icon name="calendar" size={18} /><label>予定の追加先 <input type="date" value={selected} min="1900-01-01" max="2100-12-31" onChange={(e) => { if (e.target.value) selectDate(e.target.value) }} /></label><button className="text-button" onClick={openCalendar}>カレンダーを見る <Icon name="arrow" size={15} /></button></div>
        {page === 'discover' && <p className="discovery-hint">← パス · スワイプで次の発見へ · 右にスワイプで保存 ♥</p>}
        <div className="story-grid">{filteredStories.map((story) => <StoryCard key={story.id} story={story} compact favorite={favorites.includes(story.id)} onFavorite={() => favorite(story)} onSave={() => saveAndAdvance(story)} onOpen={() => setArticle(story)} onSkip={page === 'discover' ? () => skipStory(story, 'discover') : undefined} />)}</div>
        {(page === 'discover' || products.some((item) => favorites.includes(item.id))) && <ProductCards items={products.filter((item) => page === 'discover' || favorites.includes(item.id))} favorites={favorites} onFavorite={(item) => toggleFavorite(item.id)} onOpen={setProduct} />}
        {page === 'discover' && filteredStories.length === 0 && <div className="collection-empty"><p>このカテゴリーの提案はここまで。</p><button className="secondary" onClick={() => { persist(events, favorites, { ...skipped, discover: [] }); setReviewed([]) }}>パスした記事をもう一度見る</button></div>}
        {page === 'favorites' && favorites.length === 0 && <div className="collection-empty"><Icon name="heart" size={36} /><h2>心が動いたら、ハートを。</h2><p>お気に入りの記事が、ここに並びます。</p><button className="primary" onClick={() => { navigatePage('discover'); setFilter('すべて') }}>記事を見つける</button></div>}
        {page === 'favorites' && favorites.length > 0 && filteredStories.length === 0 && <p className="collection-empty">このカテゴリーにはまだ保存がありません。</p>}
      </section>}
      {page === 'plans' && <section className="plan-page"><div className="plan-banner"><img src={image(stories[1])} alt="一日プランの始まりに立ち寄るカフェ" /><div><p className="eyebrow">THE SLOW CITY GUIDE</p><h2>コーヒーから始まる、<br />感性を満たす休日。</h2><p>清澄白河・蔵前・恵比寿 / 4つの寄り道</p></div></div><div className="plan-layout"><div className="plan-timeline">{dayPlan.map((stop, index) => { const story = stories.find((item) => item.id === stop.storyId)!; return <button className={`plan-stop tone-${storyTone(story.id)}`} key={story.id} onClick={() => { selectDate(planDate); setArticle(story) }}><span className="plan-time">{clock(stop.start)}<small>{String(index + 1).padStart(2, '0')}</small></span><img src={image(story)} alt={story.spot} /><span className="plan-stop-copy"><small>{story.magazine} {story.sponsored ? '· PR' : ''}</small><strong>{story.spot}</strong><span>{story.area} · {story.duration}分</span><span>{story.subtitle}</span></span><Icon name="arrow" size={18} /></button> })}</div><aside className="plan-booking"><p className="eyebrow">YOUR NEXT DAY OFF</p><h3>次の休日に、いかがですか？</h3><label>お出かけする日<input type="date" value={planDate} min="1900-01-01" max="2100-12-31" onChange={(e) => { if (e.target.value) { setPlanDate(e.target.value); setPlanError('') } }} /></label><p>11:00–19:00 / 4スポット<br />移動・休憩の余白を含むモデルプランです。<br />PR記事を2件含みます。</p>{planError && <p className="form-error" role="alert">{planError}</p>}<button className="primary" onClick={addPlan}><Icon name="plus" size={18} />まとめて予定に追加</button><small>既存の予定と重なる場合は追加しません。<br />各スポットを押すと記事を読めます。<br />スポットはすべて架空です。</small></aside></div></section>}
      <footer><span className="footer-brand">Mag Life.</span><p>予定と、雑誌と、まだ知らない毎日。</p><small>DEMO · 雑誌・記事・スポット・広告主はすべて架空です。予約・実店舗への送客は行いません。<br />所要時間は移動を含む目安です。位置情報・実際の営業時間との連携はありません。</small></footer>
    </main>
    <div className="toast" role="status" aria-live="polite">{toast && <><Icon name="check" size={17} />{toast}</>}</div>
    {detail && <EventDetail event={detail} close={() => setDetail(null)} favorite={favorites.includes(relatedStory(detail).id)} onFavorite={favorite} onEdit={() => { setEditor(detail); setDetail(null) }} onOpen={(story) => { setDetail(null); setArticle(story) }} favorites={favorites} onProductFavorite={(item) => toggleFavorite(item.id)} onProductOpen={(item) => { setDetail(null); setProduct(item) }} />}
    {proposal && <Modal label="雑誌からの提案" swipe close={() => setProposal(null)}><ProposalDeck first={proposal} suggestions={suggestions} favorites={favorites} onSave={saveFavorite} onSkip={skipStory} onOpen={(story) => { setProposal(null); setArticle(story) }} onAdd={addStory} /></Modal>}
    {product && <Modal label="PR商品詳細" close={() => setProduct(null)}><div className="product-detail"><span className="product-pr">PR · 広告 / 架空の商品</span><ProductImage product={product} /><p className="eyebrow">{product.brand}</p><h2>{product.name}</h2><p>{product.description}</p><p>{product.price}</p><button className="secondary" aria-pressed={favorites.includes(product.id)} onClick={() => toggleFavorite(product.id)}>{favorites.includes(product.id) ? '♥ 保存済み' : '♡ お気に入り保存'}</button><p className="fiction-note">デモ用の架空商品です。購入・予定登録は行いません。</p></div></Modal>}
    {editor && <EventForm key={editor.id} event={editor} events={events} close={() => setEditor(null)} onSave={(event) => { persist([...events.filter((item) => item.id !== event.id), event]); selectDate(event.date); setEditor(null); setToast('予定を保存しました') }} onDelete={() => { persist(events.filter((event) => event.id !== editor.id)); setEditor(null); setToast('予定を削除しました') }} />}
    {article && <Modal label={article.title.replace('\n', '')} wide close={() => setArticle(null)}><article className="article-detail">
      <div className="article-cover"><img src={image(article)} alt={article.spot} />{article.sponsored && <span className="pr-badge">PR · {article.sponsored}</span>}</div>
      <div className="article-body"><p className="magazine-label">{article.magazine} <span>{article.issue}</span></p><p className="eyebrow">{article.label}</p><h2>{article.title}</h2><p className="article-subtitle">{article.subtitle}</p>
        {article.sponsored && <p className="article-disclosure">PR · {article.spot} 提供の架空のタイアップ記事です。</p>}
        <div className="article-prose">{article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        {storyKind(article) === 'experience' && <section className="spot-info"><p className="eyebrow">SPOT INFORMATION</p><h3>{article.spot}</h3><dl><div><dt>エリア</dt><dd>{article.address}</dd></div><div><dt>営業時間</dt><dd>{article.hours}（デモ設定）</dd></div><div><dt>所要時間</dt><dd>{article.duration}分</dd></div><div><dt>予算</dt><dd>{article.price}</dd></div></dl><p>この記事・雑誌名・スポットはオリジナルの架空コンテンツです。</p></section>}
        <div className="article-booking">
          {storyKind(article) === 'experience' && <><label>お出かけする日<input type="date" value={selected} min="1900-01-01" max="2100-12-31" onChange={(e) => { if (e.target.value) selectDate(e.target.value) }} /></label><p>{scheduledStory(article) ? 'この日のカレンダーに追加済みです' : available(article) ? `${clock(suggestions.find((item) => item.story.id === article.id)?.start ?? storyStart(article, available(article)!))} から、日時を確認して追加できます` : 'この日に合う空き時間がありません。別の日を選んでください。'}</p></>}
          <div>{storyKind(article) === 'experience' && <button className="primary" disabled={!available(article) || scheduledStory(article)} onClick={() => addStory(article)}><Icon name={scheduledStory(article) ? 'check' : 'plus'} size={18} />{scheduledStory(article) ? '追加済み' : '予定に追加'}</button>}<button className="secondary" aria-pressed={favorites.includes(article.id)} onClick={() => favorite(article)}><Icon name="heart" size={18} />{favorites.includes(article.id) ? '保存済み' : 'お気に入り'}</button></div>
        </div>
        <ProductCards items={[productFor(article)]} favorites={favorites} onFavorite={(item) => toggleFavorite(item.id)} onOpen={(item) => { setArticle(null); setProduct(item) }} />
        <section className="edition-links"><h3>この雑誌のおすすめ記事・体験</h3>{stories.filter((item) => item.magazine === article.magazine && item.id !== article.id).map((item) => <button className="text-button" key={item.id} onClick={() => setArticle(item)}>{storyKind(item) === 'article' ? '読みもの' : '体験'} · {item.title.replace('\n', '')} →</button>)}</section>
      </div></article></Modal>}
  </div>
}
