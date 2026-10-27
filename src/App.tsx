import { useEffect, useRef, useState } from 'react'
import type { FormEvent, PointerEvent, ReactNode } from 'react'
import { clock, createDemoEvents, dateKey, freeSlots, isEvent, minutes, moveDate, overlaps, parseDate } from './events'
import type { CalendarEvent, FreeSlot } from './events'
import { dayPlan, fits, stories, storyCategory, storyStart, storyTone } from './stories'
import type { Story } from './stories'
import { loadData, saveData } from './storage'
import { planConflict, planEvents } from './plans'
import './App.css'

type Page = 'calendar' | 'discover' | 'favorites' | 'plans'
type View = 'day' | 'week' | 'month'
const weekdays = ['日', '月', '火', '水', '木', '金', '土']
const fullDate = new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric', weekday: 'long' })
const image = (story: Story) => `${import.meta.env.BASE_URL}images/${story.image}`

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

function Modal({ label, close, children, wide = false }: { label: string; close: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!
    dialog.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous; dialog.close() }
  }, [])
  return <dialog ref={ref} className={`modal ${wide ? 'wide' : ''}`} aria-label={label} onCancel={close} onClick={(event) => { if (event.target === event.currentTarget) close() }}>
    <button className="icon-button modal-close" onClick={close} aria-label="閉じる"><Icon name="close" /></button>
    {children}
  </dialog>
}

function StoryCard({ story, favorite, onFavorite, onOpen, onAdd, onSkip, compact = false }: {
  story: Story; favorite: boolean; onFavorite: () => void; onOpen: () => void; onAdd?: () => void; onSkip?: () => void; compact?: boolean
}) {
  const [drag, setDrag] = useState(0)
  const start = useRef<number | null>(null)
  const suppressClick = useRef(false)
  function down(event: PointerEvent<HTMLButtonElement>) {
    if (!onSkip || !event.isPrimary || event.button !== 0) return
    start.current = event.clientX
    suppressClick.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function up(event: PointerEvent<HTMLButtonElement>) {
    if (start.current === null) return
    const distance = event.clientX - start.current
    start.current = null
    suppressClick.current = Math.abs(distance) > 12
    setDrag(0)
    if (distance > 85 && onAdd) onAdd()
    else if (distance < -85) onSkip?.()
  }
  return <article className={`story-card tone-${storyTone(story.id)} ${compact ? 'compact' : ''} ${drag ? 'dragging' : ''}`} style={{ transform: `translateX(${drag * .45}px) translateY(var(--card-lift, 0px)) rotate(${drag / 65}deg)` }}>
    <button className="story-open" onClick={() => { if (!suppressClick.current) onOpen(); suppressClick.current = false }} onPointerDown={down} onPointerMove={(event) => { if (start.current !== null) setDrag(event.clientX - start.current) }} onPointerUp={up} onPointerCancel={() => { start.current = null; setDrag(0); suppressClick.current = true }} style={{ touchAction: onSkip ? 'pan-y' : 'auto' }} aria-label={`記事を読む：${story.title.replace('\n', '')}`}>
      <div className="story-photo"><img src={image(story)} alt={story.spot} loading="lazy" draggable={false} /><span className="photo-tag">{story.label}</span>{story.sponsored && <span className="pr-badge">PR</span>}{Math.abs(drag) > 35 && <span className={`swipe-feedback ${drag > 0 ? 'add' : ''}`}>{drag > 0 ? '予定に追加' : '今回はパス'}</span>}</div>
      <div className="story-copy"><p className="magazine-label">{story.magazine} <span>— {story.issue.split(' / ')[0]}</span></p><h3>{story.title}</h3><div className="story-meta"><span><Icon name="pin" size={14} />{story.area}</span><span><Icon name="clock" size={14} />{story.duration}分</span></div>{!compact && <p className="reason">{story.reason}</p>}{story.sponsored && <p className="sponsor-label">PR · {story.sponsored}</p>}</div>
    </button>
    <div className="card-actions">
      {onSkip && <button className="skip-button" onClick={onSkip}><Icon name="close" size={16} />今回はパス</button>}
      <button className={`favorite-button ${favorite ? 'saved' : ''}`} onClick={onFavorite} aria-label={favorite ? 'お気に入りを解除' : 'お気に入りに保存'} aria-pressed={favorite}><Icon name="heart" size={18} /></button>
      {onAdd ? <button className="primary small" onClick={onAdd}><Icon name="plus" size={16} />予定に追加</button> : <button className="text-button" onClick={onOpen}>記事を読む <Icon name="arrow" size={16} /></button>}
    </div>
  </article>
}

function EventForm({ event, events, onSave, onDelete, close }: { event: CalendarEvent; events: CalendarEvent[]; onSave: (event: CalendarEvent) => void; onDelete: () => void; close: () => void }) {
  const [error, setError] = useState('')
  const exists = events.some((item) => item.id === event.id)
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const candidate: CalendarEvent = { ...event, title: String(data.get('title')).trim(), date: String(data.get('date')), start: minutes(String(data.get('start'))), end: minutes(String(data.get('end'))), category: data.get('category') as CalendarEvent['category'], note: String(data.get('note')).trim() }
    if (!isEvent(candidate)) { setError('タイトル・日付・時間を確認してください。終了時刻は開始時刻より後にしてください。'); return }
    if (overlaps(events, candidate)) { setError('同じ時間に別の予定があります。時間を調整してください。'); return }
    onSave(candidate)
  }
  return <Modal label={exists ? '予定を編集' : '予定を追加'} close={close}><form className="event-form" onSubmit={submit}><p className="eyebrow">YOUR TIME, YOUR LIFE</p><h2>{exists ? '予定を編集' : '新しい予定'}</h2><label>タイトル<input name="title" defaultValue={event.title} placeholder="どんな時間にしますか？" required maxLength={80} autoFocus /></label><label>日付<input name="date" type="date" defaultValue={event.date} required min="1900-01-01" max="2100-12-31" /></label><div className="form-row"><label>開始<input name="start" type="time" defaultValue={clock(event.start)} required /></label><label>終了<input name="end" type="time" defaultValue={clock(event.end)} required /></label></div><label>カテゴリー<select name="category" defaultValue={event.category}><option value="work">仕事</option><option value="personal">プライベート</option><option value="outing">お出かけ</option></select></label><label>メモ<textarea name="note" defaultValue={event.note} rows={3} maxLength={1000} /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions">{exists && <button type="button" className="danger-button" onClick={onDelete}>予定を削除</button>}<button type="submit" className="primary">保存する <Icon name="check" size={17} /></button></div></form></Modal>
}

export default function App() {
  const [initial] = useState(loadData)
  const [today] = useState(() => dateKey(new Date()))
  const [events, setEvents] = useState(() => initial.data?.events ?? createDemoEvents(parseDate(today)))
  const [favorites, setFavorites] = useState<string[]>(() => initial.data?.favorites ?? [])
  const [storageError, setStorageError] = useState(initial.error)
  const [page, setPage] = useState<Page>('calendar')
  const [view, setView] = useState<View>('week')
  const [selected, setSelected] = useState(today)
  const [slotChoice, setSlotChoice] = useState<number | null>(null)
  const [skipped, setSkipped] = useState<Record<string, string[]>>({})
  const [article, setArticle] = useState<Story | null>(null)
  const [editor, setEditor] = useState<CalendarEvent | null>(null)
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
  const slot = slots.find((item) => item.start === slotChoice) ?? slots.find((item) => item.start >= 1080) ?? slots[0]
  const slotKey = `${selected}-${slot?.start}`
  const candidates = slot ? stories.filter((story) => fits(story, slot) && !(skipped[slotKey] ?? []).includes(story.id) && !events.some((event) => event.date === selected && event.storyId === story.id)) : []
  const recommended = candidates[0]
  const dayEvents = events.filter((event) => event.date === selected).sort((a, b) => a.start - b.start)
  const scheduledStory = (story: Story) => events.some((event) => event.date === selected && event.storyId === story.id)
  const weekStart = moveDate(selected, -((selectedDate.getDay() + 6) % 7))
  const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  const monthGridStart = moveDate(dateKey(monthStart), -((monthStart.getDay() + 6) % 7))
  const monthCells = Math.ceil((((monthStart.getDay() + 6) % 7) + new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate()) / 7) * 7
  const days = view === 'month' ? Array.from({ length: monthCells }, (_, index) => moveDate(monthGridStart, index)) : view === 'week' ? Array.from({ length: 7 }, (_, index) => moveDate(weekStart, index)) : [selected]

  function persist(nextEvents: CalendarEvent[], nextFavorites = favorites) {
    setEvents(nextEvents)
    setFavorites(nextFavorites)
    setStorageError(saveData({ events: nextEvents, favorites: nextFavorites }))
  }
  function favorite(story: Story) {
    const saved = favorites.includes(story.id)
    persist(events, saved ? favorites.filter((id) => id !== story.id) : [...favorites, story.id])
    setToast(saved ? 'お気に入りから外しました' : 'お気に入りに保存しました')
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
    return slot && fits(story, slot) ? slot : slots.find((item) => fits(story, item))
  }
  function addStory(story: Story) {
    const free = available(story)
    if (scheduledStory(story)) { setToast('この記事は選択日の予定に追加済みです'); return }
    if (!free) { setToast('この日に合う空き時間がありません。別の日を選んでください'); return }
    const start = storyStart(story, free)
    const event: CalendarEvent = { id: crypto.randomUUID(), title: story.spot, date: selected, start, end: start + story.duration, category: 'outing', note: `${story.magazine} / ${story.area}\n${story.sponsored ? `PR · ${story.sponsored}\n` : ''}架空のスポットです。所要時間は移動を含むデモ目安です。`, storyId: story.id }
    if (overlaps(events, event)) { setToast('予定が重なっています。別の時間を選んでください'); return }
    persist([...events, event])
    setToast(`${selectedDate.getMonth() + 1}/${selectedDate.getDate()} ${clock(start)}「${story.spot}」を予定に追加しました`)
    setArticle(null)
  }
  function skipStory(story: Story) {
    setSkipped((current) => ({ ...current, [slotKey]: [...(current[slotKey] ?? []), story.id] }))
    setToast('次のおすすめに切り替えました')
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
  const filteredStories = stories.filter((story) => (page !== 'favorites' || favorites.includes(story.id)) && (filter === 'すべて' || storyCategory(story) === filter))

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
      {storageError && <div className="storage-error" role="alert">{storageError}<button onClick={() => setStorageError(saveData({ events, favorites }))}>保存を再試行</button></div>}
      <section className="page-intro"><div><p className="eyebrow">{page === 'calendar' ? 'YOUR PERSONAL EDITOR' : page === 'discover' ? 'THE EDITOR’S SELECTION' : page === 'plans' ? 'A DAY, BEAUTIFULLY PLANNED' : 'YOUR LITTLE COLLECTION'}</p><h1>{page === 'calendar' ? <>毎日に、ちょっといい<span>余白</span>を。</> : page === 'discover' ? '次の「行ってみたい」に出会う。' : page === 'plans' ? '一日を、ひとつの物語に。' : '好きな時間を、とっておく。'}</h1><p>{page === 'calendar' ? '予定のあいまに、あなたらしい寄り道を。' : page === 'discover' ? '雑誌をめくるように、街の楽しみを見つけよう。' : page === 'plans' ? '編集部が選んだ記事をつなぐ、小さなお出かけプラン。' : '心が動いた場所を、次のお出かけのきっかけに。'}</p></div><button className="primary add-event" onClick={newEvent}><Icon name="plus" size={18} />予定を追加</button></section>

      {page === 'calendar' && <>
        <section className="hero">
          <img src={`${import.meta.env.BASE_URL}images/hero.jpg`} alt="食事をゆっくり楽しむレストランの風景（イメージ）" />
          <div className="hero-shade" /><div className="hero-copy"><p className="hero-kicker">A LITTLE DETOUR, A BETTER DAY</p><h2>まっすぐ帰るには、<br />もったいない夜がある。</h2><p>一杯のワイン、一冊の本、新しい景色。<br />いつもの毎日に、小さなときめきを。</p><button onClick={() => setArticle(stories[0])}>今夜の寄り道を読む <Icon name="arrow" size={18} /></button></div><span className="hero-issue">LIFE □ &nbsp; / &nbsp; THE EVENING ISSUE</span>
        </section>
        <div className="workspace">
          <section className="calendar-panel" aria-label="カレンダー">
            <div className="section-heading"><div><p className="eyebrow">MY CALENDAR</p><h2>わたしのカレンダー</h2></div><span className="subtle">予定も、楽しみも。</span></div>
            <div className="calendar-toolbar"><div className="date-nav"><h3>{selectedDate.getFullYear()}<span>年</span> {selectedDate.getMonth() + 1}<span>月</span></h3><button className="icon-button" onClick={() => navigate(-1)} aria-label={`前の${view === 'month' ? '月' : view === 'week' ? '週' : '日'}`}>‹</button><button className="icon-button" onClick={() => navigate(1)} aria-label={`次の${view === 'month' ? '月' : view === 'week' ? '週' : '日'}`}>›</button><button className="today-button" onClick={() => selectDate(today)}>今日</button></div><div className="view-switch" aria-label="カレンダー表示">{([['day', '日'], ['week', '週'], ['month', '月']] as const).map(([id, label]) => <button key={id} onClick={() => setView(id)} aria-pressed={view === id}>{label}</button>)}</div></div>
            <div className={`calendar-grid ${view}`} style={{ '--columns': view === 'day' ? 1 : 7 } as React.CSSProperties}>
              {view === 'month' && ['月', '火', '水', '木', '金', '土', '日'].map((day) => <span className="weekday" key={day}>{day}</span>)}
              {days.map((date) => {
                const day = parseDate(date)
                const items = events.filter((event) => event.date === date).sort((a, b) => a.start - b.start)
                return <div className={`calendar-cell ${date === selected ? 'selected' : ''} ${day.getMonth() !== selectedDate.getMonth() ? 'outside' : ''}`} key={date}>
                  <button className={`date-button ${date === today ? 'is-today' : ''}`} onClick={() => selectDate(date)} aria-pressed={date === selected} aria-current={date === today ? 'date' : undefined} aria-label={`${fullDate.format(day)}、予定${items.length}件`}>{view !== 'month' && <span>{weekdays[day.getDay()]}</span>}<strong>{day.getDate()}</strong></button>
                  <div className="cell-events">{items.slice(0, view === 'month' ? 4 : 5).map((event) => <button className={`mini-event ${event.category} ${event.category === 'outing' ? `tone-${storyTone(event.storyId)}` : ''}`} key={event.id} title={`${clock(event.start)}–${clock(event.end)} ${event.title}`} onClick={() => { selectDate(date); setEditor(event) }}><time>{clock(event.start)}</time><span>{event.storyId && stories.find((story) => story.id === event.storyId)?.sponsored ? 'PR · ' : ''}{event.title}</span></button>)}{items.length > (view === 'month' ? 4 : 5) && <button className="more-events" onClick={() => selectDate(date)}>+{items.length - (view === 'month' ? 4 : 5)}件</button>}{items.length === 0 && view !== 'month' && <span className="free-day">余白のある日</span>}</div>
                </div>
              })}
            </div>
            <div className="calendar-legend"><span><i className="work-dot" />仕事</span><span><i className="personal-dot" />プライベート</span><span><i className="outing-dot" />お出かけ</span><span className="local-label">このブラウザに保存</span></div>
            <div className="day-agenda">
              <div className="agenda-heading"><h3>{fullDate.format(selectedDate)}</h3><button className="text-button" onClick={newEvent}><Icon name="plus" size={15} />予定を追加</button></div>
              {dayEvents.length === 0 && <p className="empty-agenda">予定はありません。自由な一日を、どう過ごしますか？</p>}
              {dayEvents.map((event) => <button className={`agenda-event ${event.category} ${event.category === 'outing' ? `tone-${storyTone(event.storyId)}` : ''}`} key={event.id} onClick={() => setEditor(event)}><span className="agenda-time">{clock(event.start)}<small>{clock(event.end)}</small></span><i /><span><strong>{event.title}</strong><small>{event.storyId ? `${stories.find((story) => story.id === event.storyId)?.sponsored ? 'PR · ' : ''}雑誌から見つけたお出かけ` : event.category === 'work' ? '仕事' : 'プライベート'}</small></span><span className="edit-hint">編集 ›</span></button>)}
              <div className="free-time-banner"><Icon name="sparkle" size={22} /><div><strong>{slots.length ? `${slots.length}つの空き時間が見つかりました` : 'この日は予定がいっぱいです'}</strong><p>{slots.length ? '45分以上の余白から、おすすめをお届け。' : '別の日を選んで、次の寄り道を探しましょう。'}</p></div></div>
              {slots.some((item) => fits(stories[3], item)) && <button className="native-ad" onClick={() => setArticle(stories[3])}><img src={image(stories[3])} alt="" /><span><small>PR · Calendar Native Ads</small><strong>45分の余白に、緑の寄り道。</strong><span>記事を読んでから、予定に追加できます。</span></span><Icon name="arrow" size={18} /></button>}
            </div>
          </section>
          <aside className="recommendation-panel" aria-label="空き時間へのおすすめ">
            <div className="section-heading"><div><p className="eyebrow">JUST FOR YOUR FREE TIME</p><h2><Icon name="sparkle" size={20} />余白に、ひとつ提案。</h2></div></div>
            <p className="recommendation-intro">{selectedDate.getDay() === 5 && slot && slot.start >= 1080 ? '仕事終わりに、ちょっと寄り道しませんか？' : slot && slot.start >= 1080 ? '今日の終わりに、自分だけのごほうびを。' : '次の予定まで、好きなことをひとつ。'}</p>
            <div className="slot-picker" aria-label="提案する空き時間">{slots.map((item) => <button key={item.start} aria-pressed={slot?.start === item.start} onClick={() => setSlotChoice(item.start)}><Icon name="clock" size={13} />{clock(item.start)}–{clock(item.end)}</button>)}</div>
            {recommended ? <StoryCard key={`${slotKey}-${recommended.id}`} story={recommended} favorite={favorites.includes(recommended.id)} onFavorite={() => favorite(recommended)} onOpen={() => setArticle(recommended)} onAdd={() => addStory(recommended)} onSkip={() => skipStory(recommended)} /> : <div className="recommendation-empty"><Icon name="discover" size={32} /><h3>{slot ? 'この時間の提案は、ここまで。' : '新しい余白を探しましょう。'}</h3><p>{slot ? '別の空き時間や日付も試してみてください。' : '予定の編集や日付の移動で、おすすめが変わります。'}</p>{slot && (skipped[slotKey]?.length ?? 0) > 0 && <button className="secondary" onClick={() => setSkipped((current) => ({ ...current, [slotKey]: [] }))}>もう一度見る</button>}</div>}
            <p className="swipe-hint">← パス <span>ドラッグ / スワイプ</span> 予定に追加 →</p>
            <div className="editor-note"><span>FROM THE EDITORS</span><p>何もしない時間も、<br />何かに出会う時間も。<br />あなたの余白は、あなたのもの。</p><button className="text-button" onClick={() => navigatePage('discover')}>ほかの記事を見つける <Icon name="arrow" size={16} /></button></div>
          </aside>
        </div>
      </>}

      {(page === 'discover' || page === 'favorites') && <section className="collection">
        <div className="collection-toolbar"><div className="filter-tabs" aria-label="記事カテゴリー">{['すべて', 'グルメ', 'カルチャー', '自然'].map((label) => <button key={label} aria-pressed={filter === label} onClick={() => setFilter(label)}>{label}</button>)}</div><span>{page === 'favorites' ? `${favorites.length}件の保存` : `${stories.length}の小さな寄り道`}</span></div>
        <div className="collection-date"><Icon name="calendar" size={18} /><label>予定の追加先 <input type="date" value={selected} min="1900-01-01" max="2100-12-31" onChange={(e) => { if (e.target.value) selectDate(e.target.value) }} /></label><button className="text-button" onClick={openCalendar}>カレンダーを見る <Icon name="arrow" size={15} /></button></div>
        <div className="story-grid">{filteredStories.map((story) => <StoryCard key={story.id} story={story} compact favorite={favorites.includes(story.id)} onFavorite={() => favorite(story)} onOpen={() => setArticle(story)} />)}</div>
        {stories.filter((story) => page !== 'favorites' || favorites.includes(story.id)).length === 0 && <div className="collection-empty"><Icon name="heart" size={36} /><h2>心が動いたら、ハートを。</h2><p>お気に入りの記事が、ここに並びます。</p><button className="primary" onClick={() => { navigatePage('discover'); setFilter('すべて') }}>記事を見つける</button></div>}
        {page === 'favorites' && favorites.length > 0 && filteredStories.length === 0 && <p className="collection-empty">このカテゴリーにはまだ保存がありません。</p>}
      </section>}
      {page === 'plans' && <section className="plan-page"><div className="plan-banner"><img src={image(stories[1])} alt="一日プランの始まりに立ち寄るカフェ" /><div><p className="eyebrow">THE SLOW CITY GUIDE</p><h2>コーヒーから始まる、<br />感性を満たす休日。</h2><p>清澄白河・蔵前・恵比寿 / 4つの寄り道</p></div></div><div className="plan-layout"><div className="plan-timeline">{dayPlan.map((stop, index) => { const story = stories.find((item) => item.id === stop.storyId)!; return <button className={`plan-stop tone-${storyTone(story.id)}`} key={story.id} onClick={() => { selectDate(planDate); setArticle(story) }}><span className="plan-time">{clock(stop.start)}<small>{String(index + 1).padStart(2, '0')}</small></span><img src={image(story)} alt={story.spot} /><span className="plan-stop-copy"><small>{story.magazine} {story.sponsored ? '· PR' : ''}</small><strong>{story.spot}</strong><span>{story.area} · {story.duration}分</span><span>{story.subtitle}</span></span><Icon name="arrow" size={18} /></button> })}</div><aside className="plan-booking"><p className="eyebrow">YOUR NEXT DAY OFF</p><h3>次の休日に、いかがですか？</h3><label>お出かけする日<input type="date" value={planDate} min="1900-01-01" max="2100-12-31" onChange={(e) => { if (e.target.value) { setPlanDate(e.target.value); setPlanError('') } }} /></label><p>11:00–19:00 / 4スポット<br />移動・休憩の余白を含むモデルプランです。<br />PR記事を2件含みます。</p>{planError && <p className="form-error" role="alert">{planError}</p>}<button className="primary" onClick={addPlan}><Icon name="plus" size={18} />まとめて予定に追加</button><small>既存の予定と重なる場合は追加しません。<br />各スポットを押すと記事を読めます。<br />スポットはすべて架空です。</small></aside></div></section>}
      <footer><span className="footer-brand">Mag Life.</span><p>予定と、雑誌と、まだ知らない毎日。</p><small>DEMO · 雑誌・記事・スポット・広告主はすべて架空です。予約・実店舗への送客は行いません。<br />所要時間は移動を含む目安です。位置情報・実際の営業時間との連携はありません。</small></footer>
    </main>
    <div className="toast" role="status" aria-live="polite">{toast && <><Icon name="check" size={17} />{toast}</>}</div>
    {editor && <EventForm key={editor.id} event={editor} events={events} close={() => setEditor(null)} onSave={(event) => { persist([...events.filter((item) => item.id !== event.id), event]); selectDate(event.date); setEditor(null); setToast('予定を保存しました') }} onDelete={() => { persist(events.filter((event) => event.id !== editor.id)); setEditor(null); setToast('予定を削除しました') }} />}
    {article && <Modal label={article.title.replace('\n', '')} wide close={() => setArticle(null)}><article className="article-detail"><div className="article-cover"><img src={image(article)} alt={article.spot} />{article.sponsored && <span className="pr-badge">PR · {article.sponsored}</span>}</div><div className="article-body"><p className="magazine-label">{article.magazine} <span>{article.issue}</span></p><p className="eyebrow">{article.label}</p><h2>{article.title}</h2><p className="article-subtitle">{article.subtitle}</p>{article.sponsored && <p className="article-disclosure">PR · {article.spot} 提供の架空のタイアップ記事です。</p>}<div className="article-prose">{article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><section className="spot-info"><p className="eyebrow">SPOT INFORMATION</p><h3>{article.spot}</h3><dl><div><dt>エリア</dt><dd>{article.address}</dd></div><div><dt>営業時間</dt><dd>{article.hours}（デモ設定）</dd></div><div><dt>所要時間</dt><dd>{article.duration}分（移動を含む目安）</dd></div><div><dt>予算</dt><dd>{article.price}</dd></div></dl><p>この記事・雑誌名・スポットはオリジナルの架空コンテンツです。</p></section><div className="article-booking"><label>お出かけする日<input type="date" value={selected} min="1900-01-01" max="2100-12-31" onChange={(e) => { if (e.target.value) selectDate(e.target.value) }} /></label><p>{scheduledStory(article) ? 'この日のカレンダーに追加済みです' : available(article) ? `${clock(storyStart(article, available(article)!))}–${clock(storyStart(article, available(article)!) + article.duration)} の空き時間に追加できます` : 'この日に合う空き時間がありません。別の日を選んでください。'}</p><div><button className="primary" disabled={!available(article) || scheduledStory(article)} onClick={() => addStory(article)}><Icon name={scheduledStory(article) ? 'check' : 'plus'} size={18} />{scheduledStory(article) ? '追加済み' : '予定に追加'}</button><button className="secondary" aria-pressed={favorites.includes(article.id)} onClick={() => favorite(article)}><Icon name="heart" size={18} />{favorites.includes(article.id) ? '保存済み' : 'お気に入り'}</button></div></div></div></article></Modal>}
  </div>
}
