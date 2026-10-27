import type { CalendarEvent } from '../events'

export type EditorialCategory = '男性ライフスタイル' | '旅行' | '女性美容' | 'アウトドア' | '働く女性ファッション' | 'グルメ'
export type CopyPlacement = 'Ticker' | 'Whisper' | 'Recommendation'
export type TimeOfDay = 'morning' | 'day' | 'evening' | 'any'
export type DayType = 'weekday' | 'weekend' | 'any'

export type EditorialCopy = {
  id: string
  magazineId: string
  category: EditorialCategory
  text: string
  tone: string
  timeOfDay: TimeOfDay
  dayType: DayType
  minFreeMinutes: number
  relatedEventTypes: CalendarEvent['category'][]
  season: string[]
  placement: CopyPlacement
  recommendationId?: string
  priority: number
}

export const editorialMagazines = [
  { id: 'homme-days', category: '男性ライフスタイル', name: 'HOMME DAYS', tone: '知的でカルチャーに詳しい。趣味の入口をさりげなく手渡す。' },
  { id: 'roame-days', category: '旅行', name: 'ROAMÉ DAYS', tone: '好奇心旺盛。知らない街や景色との出会いを楽しむ。' },
  { id: 'mellow-skin', category: '女性美容', name: 'MELLOW SKIN', tone: '親しみやすく前向き。気分が上がる小さな美容を提案する。' },
  { id: 'fern-far', category: 'アウトドア', name: 'FERN & FAR', tone: '自然体で開放的。季節と身体の声に耳を澄ませる。' },
  { id: 'shift-silk', category: '働く女性ファッション', name: 'SHIFT & SILK', tone: '洗練されていて、仕事も自分の時間も大切にする。' },
  { id: 'saji-table', category: 'グルメ', name: 'SAJI / TABLE', tone: '食への好奇心が強く、おいしい寄り道を見つける。' },
] as const

const copyTexts: Record<EditorialCategory, string[]> = {
  男性ライフスタイル: [
    '仕事帰り、レコードの針が落ちる音を聴きに行こう。',
    'いつもの帰り道を、今日は古本屋のある通りへ。',
    '次の休日は、気になっていたサウナで頭を空っぽに。',
    '一時間だけ、知らない作家の写真集をめくってみる。',
    '予定の合間に、道具の美しい文具店をのぞいてみない？',
    '今夜は少し遠回りして、静かなジャズに耳を預けよう。',
    'コーヒー片手に、街の建築を眺める午後はいかが。',
    '気になる一冊を探しに、帰り道の書店へ寄り道を。',
    '週末の朝、いつもより少し早く市場を歩いてみよう。',
    '次の空き時間は、小さなギャラリーで目を休めて。',
    '今日はお気に入りの靴で、知らない路地を歩こう。',
    '仕事の区切りに、香りのいいコーヒーを一杯。',
    '一駅ぶん歩けば、まだ知らない店に出会えるかも。',
    '夜の余白に、スパイスの効いた一皿を探しに行こう。',
    '古い映画館で、スクリーンの余韻を持ち帰る夜。',
    '道具を直す時間もいい。街の小さな工房を訪ねて。',
    '今日は通知を閉じて、レコードショップをじっくりと。',
    '晴れた午後なら、公園のベンチで短い読書を。',
    '次の休日、知らない駅で降りて喫茶店を探そう。',
    '仕事終わりに一杯。新しいノンアルコールも面白そう。',
    '小さな展示をひとつ見るだけで、街の表情が変わる。',
    '予定の前に、好きな香りのハンドクリームを選ぼう。',
    '今日は何を買うでもなく、道具店の棚を眺めてみる。',
    '静かな夜に、少しだけ上質なチーズを持ち帰ろう。',
    '何も決めない午後こそ、好きな音を探すチャンス。',
  ],
  旅行: [
    'この二時間、知らない街の小さな駅まで出かけてみる？',
    'いつもの景色を離れて、川沿いの遊歩道を歩こう。',
    '次の休みは、近場の温泉街で日帰り旅の気分を。',
    '予定のない午後、地図を開いて一駅先へ。',
    '旅先のような朝ごはんを、知らないカフェで。',
    '窓の外を眺めながら、次の小旅行を考えてみよう。',
    '週末の空き時間に、港町を歩くつもりで遠回りを。',
    'まだ降りたことのない駅に、今日の目的地を預けて。',
    '午後の光がきれいな道を選んで、写真散歩へ。',
    '旅の本を一冊。次に行きたい場所を見つけよう。',
    'いつもの街にも、裏道を一本入れば小さな発見。',
    '今度の休日は、季節の景色を見に少し遠くへ。',
    '知らない商店街で、土地の味をひとつ探してみる。',
    '帰り道を変えるだけの、ちいさな旅を今日に。',
    '空き時間に、旅の写真展で遠くの風を感じよう。',
    '日帰り切符を手にした気分で、川の向こうへ。',
    '予定の前に、駅の反対側を散策してみない？',
    '朝の余白に、焼きたてパンを探す街歩き。',
    '知らない街の喫茶店で、旅人のようにひと休み。',
    '海を見に行く計画を、今日のカレンダーに書き足そう。',
    '夕暮れまで少しあるなら、展望台へ寄り道を。',
    '休日の午後、地元の小さな博物館を訪ねてみよう。',
    '一時間の空きに、次の旅の行き先を想像する。',
    '季節の花を目当てに、少し先の公園まで歩こう。',
    '知らない景色に会いに、いつもと違う出口から。',
  ],
  女性美容: [
    '次のデート、いつもと違う香りをまとってみない？',
    '仕事の合間に、肌がほっとするミストをひと吹き。',
    '気になっていたリップを試しに、帰り道のコスメ店へ。',
    '今日は自分のために、少しだけ丁寧なスキンケアを。',
    '空き時間にネイルカラーを選ぶ。指先から気分転換。',
    '週末の朝、好きな香りでゆっくり支度してみよう。',
    '新しい季節の色を、いつものメイクにひとつだけ。',
    '予定の前に、肌をいたわるカフェ時間はいかが。',
    '美容院の帰り道は、いつもより街を歩きたくなる。',
    '気になる美容アイテム、今日は手に取って試してみる？',
    '一日の終わりに、湯船とお気に入りのバスソルトを。',
    '午後の一時間、肌と気持ちを整える小さな休憩を。',
    '次のお出かけに向けて、似合う色を探しに行こう。',
    '予定が詰まった日は、リップひとつで気分を切り替えて。',
    '知らないブランドの香りを試す寄り道も楽しそう。',
    '休日の午後に、セルフケアの時間を予定してみよう。',
    'いつものメイクに、少しだけ遊び心を足してみる。',
    '仕事帰り、ハンドケアで今日の疲れをほどこう。',
    '美容の本をめくりながら、カフェでひと息。',
    '今日は頑張りすぎず、心地よい肌ざわりを選ぼう。',
    '季節の変わり目に、スキンケアを見直す時間を。',
    '鏡の前で新しい色を試す。似合う発見は楽しい。',
    '次の休日は、花の香りがする街を歩いてみたい。',
    '気持ちを上げたい午後に、小さなご褒美コスメを。',
    '今日の予定のあとに、自分を甘やかす時間をひとつ。',
  ],
  アウトドア: [
    '週末の予定が空いているなら、緑の中へ出かけよう。',
    '午後の一時間、木陰のベンチで深呼吸を。',
    '今日は一駅ぶん歩いて、街の風を感じてみない？',
    '休日の朝、近くの公園でピクニックの下見を。',
    '次の休みは、初心者向けのハイキングに挑戦しよう。',
    '雲がきれいな午後。空の広い場所まで歩いてみよう。',
    '仕事の合間に外へ出て、光を浴びる小休止を。',
    '川辺の散歩なら、考えごとも少し軽くなるかも。',
    '季節の草花を探しに、いつもと違う公園へ。',
    '週末の余白に、外で飲むコーヒーを用意しよう。',
    '今日は遠出しなくても、緑道を歩けば小さな冒険。',
    '気持ちのいい朝、ベーカリーから公園へ寄り道を。',
    '夕方の風に誘われて、川沿いをゆっくり歩こう。',
    '自然の中で過ごす休日を、カレンダーにひとつ。',
    '空き時間に園芸店へ。育ててみたい緑を選ぼう。',
    '晴れた日に備えて、歩きやすい道を調べてみない？',
    '木漏れ日の下で本を読む、贅沢な午後もいい。',
    '季節のイベントを探しに、屋外マーケットへ。',
    '一時間だけでも、外の空気は気分を変えてくれる。',
    '次の休日は、少し早起きして森の入口まで。',
    '街の屋上庭園で、遠くの景色を眺める休憩を。',
    'お昼を持って出かけよう。公園のベンチが特等席。',
    '雨上がりの道を歩いて、季節の匂いを見つけよう。',
    '予定の前に、花壇のある道を遠回りしてみる。',
    '身体を動かしたい日は、軽い散歩から始めよう。',
  ],
  働く女性ファッション: [
    '会議のあとに、気分を切り替える一枚を探しに。',
    'いつもの通勤服に、季節の色をひとつ足そう。',
    '仕事帰り、長く使えるバッグをゆっくり見てみない？',
    '予定の合間に、心地よい靴を試す時間を。',
    '頑張った日の帰り道は、好きな服の店へ寄り道。',
    '休日の午後、仕事と違う自分のスタイルを探そう。',
    '大切な予定の前に、アクセサリーを選ぶ余白を。',
    'クローゼットを整えて、明日の朝に余裕をつくろう。',
    '今日は着心地を優先。肌にやさしい素材を選びたい。',
    '新しい季節のジャケットを、街で試してみよう。',
    '仕事の節目に、気持ちが上がる小物をひとつ。',
    'ランチのあと、近くのセレクトショップをのぞいて。',
    '予定がない休日こそ、似合う色を見つけるチャンス。',
    '通勤の帰りに、明日の自分を助ける一着を。',
    'バッグの中身を整えるだけでも、気分は軽くなる。',
    '次の会食に向けて、肩の力が抜ける装いを考えよう。',
    '忙しい日ほど、好きなアクセサリーを味方に。',
    '仕事終わりの一時間、自分らしい服を探す散歩へ。',
    '今日は少しだけ早く切り上げて、街のウィンドウを。',
    '新しい靴で歩く予定を、週末にひとつ作ろう。',
    '会議続きの午後に、姿勢が伸びる服を見に行こう。',
    'お気に入りの服を着て、寄り道の写真を一枚。',
    '季節の変わり目、手持ちの服を組み合わせ直そう。',
    '仕事の顔から自分の顔へ。帰り道に小さな切り替えを。',
    '明日の予定に似合う色を、今夜選んでみない？',
  ],
  グルメ: [
    '午後3時。いつものコーヒーを、知らないお店で。',
    '仕事帰り、ちょっといい一杯を探しに行こう。',
    '今日はちょっと贅沢なランチにしてみない？',
    '焼きたての香りを目印に、街のベーカリーへ。',
    '季節の果物を使ったデザートで、午後にひと息。',
    '次の空き時間、気になっていたカレーを食べに。',
    '週末の朝は、評判の架空ベーカリーでゆっくり。',
    'いつもの帰り道に、知らないワインバーをひとつ。',
    '一時間の余白に、丁寧に淹れたお茶と甘いもの。',
    '今夜は旬の野菜を味わう、小さな寄り道を。',
    'ランチのあとに、路地裏の喫茶店を探してみよう。',
    '誰かを誘うなら、気軽なカウンターのお店はいかが。',
    '今日は自分のために、好きなケーキを選ぼう。',
    '知らないスパイスの香りを、食卓に迎えてみない？',
    '休日の午後、果物のパフェを目当てに街歩き。',
    '一日の締めくくりに、温かいスープを味わおう。',
    '仕事の合間に、おいしいサンドイッチを探しに。',
    '友人との予定の前に、新しい紅茶を試してみよう。',
    '旬の食材を使う料理教室、次の休日にどう？',
    '今日は少し遠回りして、評判の架空の餃子店へ。',
    '夕暮れの街で、季節のタルトを持ち帰ろう。',
    'いつものコーヒーに、小さな焼き菓子を添えて。',
    '休日の夜は、ゆっくり味わう一皿を予定に。',
    '気になるチーズを選びに、デリの棚をのぞいて。',
    '食べたことのない一品を、今日の冒険にしよう。',
  ],
}

const categories = Object.keys(copyTexts) as EditorialCategory[]
const eventTypes: Record<EditorialCategory, CalendarEvent['category'][]> = {
  男性ライフスタイル: ['work', 'hobby', 'personal'],
  旅行: ['travel', 'outing', 'outdoor'],
  女性美容: ['beauty', 'date', 'personal'],
  アウトドア: ['outdoor', 'outing', 'travel'],
  働く女性ファッション: ['work', 'date', 'personal'],
  グルメ: ['gourmet', 'date', 'work'],
}
const timeOfDay: TimeOfDay[] = ['morning', 'day', 'evening', 'any']
const placements: CopyPlacement[] = ['Ticker', 'Whisper', 'Recommendation']
const seasons = ['春', '夏', '秋', '冬']

export const editorialCopies: EditorialCopy[] = categories.flatMap((category) => {
  const magazine = editorialMagazines.find((item) => item.category === category)!
  return copyTexts[category].map((text, index) => ({
    id: `${magazine.id}-${String(index + 1).padStart(2, '0')}`,
    magazineId: magazine.id,
    category,
    text,
    tone: magazine.tone,
    timeOfDay: timeOfDay[index % timeOfDay.length],
    dayType: index % 5 === 0 ? 'weekend' : index % 5 === 1 ? 'weekday' : 'any',
    minFreeMinutes: [0, 45, 60, 90, 120][index % 5],
    relatedEventTypes: eventTypes[category],
    season: index % 4 === 3 ? [seasons[Math.floor(index / 4) % seasons.length]] : [],
    placement: placements[index % placements.length],
    recommendationId: index % 3 === 2 ? ['coffee', 'art', 'garden', 'beauty', 'style', 'dinner'][categories.indexOf(category)] : undefined,
    priority: 1 + (index % 4),
  }))
})

export type EditorialContext = {
  date: string
  events: CalendarEvent[]
  freeMinutes?: number
  placement: CopyPlacement
  category?: EditorialCategory
  recommendationId?: string
  savedIds?: string[]
  skippedIds?: string[]
  excludeCopyIds?: string[]
}

const historyKey = 'mag-life-editorial-history-v1'
const lastSelectedByContext = new Map<string, string>()
const selectedForContext = new Map<string, EditorialCopy>()
let memoryHistory: string[] = []

function getHistory(): string[] {
  if (typeof window === 'undefined') return memoryHistory
  try {
    const stored = globalThis.localStorage?.getItem(historyKey)
    if (!stored) return memoryHistory
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) && parsed.every((id) => typeof id === 'string') ? [...new Set([...memoryHistory, ...parsed])] : memoryHistory
  } catch (error) {
    console.error('Mag Life: failed to load editorial history', error)
    return []
  }
}

function remember(id: string) {
  memoryHistory = [...memoryHistory.filter((item) => item !== id), id].slice(-30)
  if (typeof window === 'undefined') return
  try {
    const history = [...getHistory().filter((item) => item !== id), id].slice(-30)
    globalThis.localStorage?.setItem(historyKey, JSON.stringify(history))
  } catch (error) {
    console.error('Mag Life: failed to save editorial history', error)
  }
}

function currentSeason(date: string): string {
  const month = Number(date.slice(5, 7))
  return month >= 3 && month <= 5 ? '春' : month >= 6 && month <= 8 ? '夏' : month >= 9 && month <= 11 ? '秋' : '冬'
}

function currentTime(date: string, events: CalendarEvent[]): TimeOfDay {
  const start = events.filter((event) => event.date === date).reduce((value, event) => Math.min(value, event.start), 720)
  return start < 11 * 60 ? 'morning' : start < 17 * 60 ? 'day' : 'evening'
}

export function selectEditorialCopy(context: EditorialContext): EditorialCopy {
  const savedIds = context.savedIds ?? []
  const skippedIds = context.skippedIds ?? []
  const excludeCopyIds = context.excludeCopyIds ?? []
  const contextKey = `${context.date}:${context.placement}:${context.category ?? ''}:${context.recommendationId ?? ''}:${context.freeMinutes ?? 0}:${savedIds.join(',')}:${skippedIds.join(',')}:${excludeCopyIds.join(',')}:${context.events.filter((event) => event.date === context.date).map((event) => `${event.id}:${event.start}:${event.end}:${event.category}`).join('|')}`
  const cached = selectedForContext.get(contextKey)
  if (cached) return cached
  const day = new Date(`${context.date}T00:00:00`).getDay()
  const dayType: DayType = day === 0 || day === 6 ? 'weekend' : 'weekday'
  const events = context.events.filter((event) => event.date === context.date)
  const season = currentSeason(context.date)
  const time = currentTime(context.date, events)
  const history = getHistory()
  const matches = editorialCopies.filter((copy) => copy.placement === context.placement
    && (!context.category || copy.category === context.category)
    && (!copy.recommendationId || !context.recommendationId || copy.recommendationId === context.recommendationId)
    && (copy.dayType === 'any' || copy.dayType === dayType)
    && (copy.timeOfDay === 'any' || copy.timeOfDay === time)
    && (!copy.recommendationId || !skippedIds.includes(copy.recommendationId))
    && !excludeCopyIds.includes(copy.id)
    && copy.minFreeMinutes <= (context.freeMinutes ?? 0)
    && (!copy.season.length || copy.season.includes(season))
    && (!events.length || !copy.relatedEventTypes.length || events.some((event) => copy.relatedEventTypes.includes(event.category))))
  const pool = (matches.length ? matches : editorialCopies.filter((copy) => copy.placement === context.placement && !excludeCopyIds.includes(copy.id)))
  const selectionKey = `${context.date}:${context.placement}:${context.category ?? ''}:${context.recommendationId ?? ''}`
  const previous = lastSelectedByContext.get(selectionKey)
  const fresh = pool.filter((copy) => !history.slice(-18).includes(copy.id) && copy.id !== previous)
  const candidates = fresh.length ? fresh : pool
  const seed = `${context.date}:${context.placement}:${context.category ?? ''}:${context.recommendationId ?? ''}:${events.map((event) => event.id).join(',')}`
  const index = [...seed].reduce((sum, character) => (sum * 31 + character.charCodeAt(0)) >>> 0, 7) % candidates.length
  const ranked = [...candidates].sort((a, b) => {
    const preference = (copy: EditorialCopy) => copy.recommendationId && savedIds.includes(copy.recommendationId) ? 2 : 0
    return preference(b) - preference(a) || b.priority - a.priority
  })
  let selected = ranked[index % ranked.length]
  if (selected.id === previous && ranked.length > 1) selected = ranked[(index + 1) % ranked.length]
  lastSelectedByContext.set(selectionKey, selected.id)
  remember(selected.id)
  selectedForContext.set(contextKey, selected)
  if (selectedForContext.size > 200) selectedForContext.delete(selectedForContext.keys().next().value!)
  return selected
}
