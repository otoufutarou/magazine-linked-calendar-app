import type { FreeSlot } from './events.ts'

export type Story = {
  id: string
  title: string
  subtitle: string
  magazine: string
  issue: string
  area: string
  duration: number
  period: 'day' | 'evening' | 'any'
  image: string
  label: string
  reason: string
  paragraphs: string[]
  spot: string
  address: string
  hours: string
  price: string
  sponsored?: 'Sponsored Recommendation' | 'Calendar Native Ads' | 'Editorial Sponsored Story'
  category?: 'グルメ' | 'カルチャー' | '自然' | 'ビューティー' | 'ファッション'
}

export const stories: Story[] = [
  {
    id: 'wine', title: '一日の終わりに、\n小さなワインの旅を。',
    subtitle: '路地裏のカウンターで見つける、自分だけの一杯。',
    magazine: 'HOMME DAYS', issue: 'Vol. 12 / 夜の寄り道', area: '代々木上原', duration: 90, period: 'evening',
    image: 'wine.jpg', label: 'FOOD & WINE', reason: '仕事終わりの90分に。静かなカウンターで、気持ちをゆっくり切り替えられます。',
    paragraphs: [
      '駅から少し歩くと、窓からこぼれるやわらかな灯りが見えてくる。架空のワインバー「余韻」は、一日を急いで終わらせたくない人のための小さな場所だ。',
      'カウンターに腰かけ、今日の気分をひと言。果実の香りが広がる一杯と、季節の野菜の小皿が運ばれてくる。ワインに詳しくなくてもいい。「今日は少し軽やかに」、それだけで十分。',
      'スマートフォンを鞄にしまって、グラスの向こうを眺めてみる。いつもの帰り道に90分の余白をつくるだけで、明日を迎える気分が少し変わるかもしれない。',
    ],
    spot: '余韻 / YOIN', address: '東京都渋谷区・代々木上原エリア（架空）', hours: '17:00–22:00', price: '目安 ¥2,500〜',
  },
  {
    id: 'coffee', title: 'コーヒーと本。\nそれだけでいい午後。',
    subtitle: 'ページをめくる音が似合う、街角のブックカフェ。',
    magazine: 'ROAMÉ DAYS', issue: 'Vol. 08 / 街の余白', area: '清澄白河', duration: 60, period: 'day',
    image: 'coffee.jpg', label: 'COFFEE & BOOKS', reason: '60分の空き時間にちょうどいい、本とコーヒーの小休止。ひとりでも気軽に過ごせます。',
    paragraphs: [
      'にぎやかな通りを一本曲がると、深呼吸したくなる空間がある。ブックカフェ「栞のある日」は、本を選ぶ時間そのものを楽しめる、架空の喫茶店。',
      '窓辺には、街の風景を集めた写真集や短いエッセイ。浅煎りのコーヒーを片手に、気になったページを開いてみる。最後まで読まなくたっていい。',
      '次の予定までの一時間。何かを達成するためではなく、自分のペースを取り戻すために使ってみよう。帰るころには、街の景色も違って見えそうだ。',
    ],
    spot: '栞のある日', address: '東京都江東区・清澄白河エリア（架空）', hours: '09:00–18:00', price: '目安 ¥800〜',
    sponsored: 'Sponsored Recommendation',
  },
  {
    id: 'art', title: 'まだ知らない色に、\n会いにいく。',
    subtitle: '小さなギャラリーから始まる、週末のアート散歩。',
    magazine: 'SHIFT & SILK', issue: 'Vol. 21 / 感性の散歩道', area: '蔵前', duration: 120, period: 'day',
    image: 'art.jpg', label: 'ART & CULTURE', reason: 'まとまった2時間の余白に。展示と街歩きを組み合わせて、いつもと違う刺激を。',
    paragraphs: [
      '白い壁に、一枚の絵。何を描いているのか、すぐにはわからない。それでもなぜか、目が離せない。架空のギャラリー「間」は、そんな出会いを大切にしている。',
      'ここでは作品の正解を探さなくていい。色や質感、光の落ち方。その日、自分の心に引っかかったものを、ひとつだけ持ち帰ろう。',
      '展示を見たあとは、近くの川沿いをゆっくり散歩。二時間あれば、遠くへ行かなくても小さな旅ができる。',
    ],
    spot: 'ギャラリー 間', address: '東京都台東区・蔵前エリア（架空）', hours: '10:00–18:00', price: '目安 ¥1,000',
    sponsored: 'Editorial Sponsored Story',
  },
  {
    id: 'garden', title: '緑のなかで、\nひと息つこう。',
    subtitle: '都会のリズムを忘れる、小さな庭の散歩時間。',
    magazine: 'FERN & FAR', issue: 'Vol. 13 / 深呼吸する休日', area: '代官山', duration: 45, period: 'day',
    image: 'garden.jpg', label: 'GREEN & WALK', reason: '45分から楽しめる短い散歩。予定の合間に、緑のなかでリフレッシュできます。',
    paragraphs: [
      '遠出をしなくても、季節はすぐそばにある。架空の庭園「木漏れ日の庭」には、忙しい日にも立ち寄れる散歩道が続く。',
      '木々のあいだから差す光、足元の葉のかたち。普段なら見過ごしてしまう小さな変化に、今日は少しだけ足を止めてみる。',
      'ベンチで深呼吸したら、またいつもの一日へ。ほんの45分でも、自分の時間を取り戻せる。',
    ],
    spot: '木漏れ日の庭', address: '東京都渋谷区・代官山エリア（架空）', hours: '09:00–18:00', price: '入園無料',
    sponsored: 'Calendar Native Ads',
  },
  {
    id: 'dinner', title: 'いつもの夜に、\n旅するテーブル。',
    subtitle: '季節の一皿から、まだ知らない街を想う。',
    magazine: 'SAJI / TABLE', issue: 'Vol. 09 / 食卓の向こう', area: '恵比寿', duration: 60, period: 'evening',
    image: 'dinner.jpg', label: 'FOOD & PEOPLE', reason: '夜の60分に、一皿から始まる気軽な寄り道。ひとりの夕食にもおすすめです。',
    paragraphs: [
      '大きな旅の計画がなくても、夕食から気分を変えられる。架空のビストロ「旅の食卓」は、季節の食材を主役にした小さなレストラン。',
      'メニューは短く、会話はゆっくり。その日の野菜のスープや、香ばしく焼けたパンが、慌ただしかった気持ちをほどいてくれる。',
      '一時間の食事が、今日のいちばん好きな時間になる。そんな夜を、帰り道にひとつ増やしてみよう。',
    ],
    spot: '旅の食卓', address: '東京都渋谷区・恵比寿エリア（架空）', hours: '17:00–22:00', price: '目安 ¥1,800〜',
  },
  {
    id: 'shop', title: '暮らしに迎える、\n小さなとっておき。',
    subtitle: '作り手の気配を感じる、生活道具のセレクトショップ。',
    magazine: 'SHIFT & SILK', issue: 'Vol. 22 / 日々の道具', area: '蔵前', duration: 60, period: 'day',
    image: 'art.jpg', label: 'DESIGN & SHOPPING', category: 'カルチャー',
    reason: '展示のあとの60分に。長く使いたくなる道具を、ゆっくり探せます。',
    paragraphs: ['器の重さを手で確かめる。布の手触りを楽しむ。架空の生活道具店「日々の棚」は、買い物を急がないためのお店だ。', '棚に並ぶのは、毎日の食卓や部屋にすっとなじむ道具たち。色や形の違いを見比べるうちに、自分の好きなものの輪郭が見えてくる。', '何も買わなくてもいい。次の暮らしのヒントをひとつ見つける、そんな寄り道にしよう。'],
    spot: '日々の棚', address: '東京都台東区・蔵前エリア（架空）', hours: '10:00–18:00', price: '見学無料 / 商品代別',
  },
  {
    id: 'bakery', title: '焼きたての香りを、\n今日のしるしに。',
    subtitle: '午後にもうれしい、街のベーカリー。',
    magazine: 'SAJI / TABLE', issue: 'Vol. 14 / パンのある風景', area: '清澄白河', duration: 45, period: 'day',
    image: 'coffee.jpg', label: 'BAKERY & COFFEE',
    reason: '45分の休憩に、焼きたてパンとコーヒーを。次の予定までの気分転換にぴったり。',
    paragraphs: ['扉を開けると、香ばしい空気に包まれる。架空のベーカリー「麦の午後」は、通りがかりについ足を止めたくなるお店。', '小さな丸パンと季節のスープ。窓辺の席で味わうだけで、忙しい一日にもちゃんと区切りができる。', '帰り際には明日の朝のパンもひとつ。今日の寄り道が、明日の楽しみになる。'],
    spot: '麦の午後', address: '東京都江東区・清澄白河エリア（架空）', hours: '09:00–18:00', price: '目安 ¥700〜',
  },
  {
    id: 'photo', title: '一枚の写真から、\n遠くへ。',
    subtitle: '静かな写真展で、視点を少し変えてみる。',
    magazine: 'ROAMÉ DAYS', issue: 'Vol. 10 / 光の記録', area: '蔵前', duration: 60, period: 'day',
    image: 'art.jpg', label: 'PHOTOGRAPHY', category: 'カルチャー',
    reason: '一時間で回れる小さな写真展。天気を気にせず、自分のペースで楽しめます。',
    paragraphs: ['いつかの海、見知らぬ窓辺。架空の展示室「光の箱」には、ありふれた風景を新しく見せる写真が並ぶ。', '気になる一枚の前で立ち止まり、写っていない時間を想像してみる。同じ写真でも、見る日の気分によって違う物語が浮かぶ。', '帰り道では、いつもの街角にも目を向けて。自分だけの一枚を見つけたくなるかもしれない。'],
    spot: '光の箱 写真室', address: '東京都台東区・蔵前エリア（架空）', hours: '09:00–18:00', price: '目安 ¥600',
  },
  {
    id: 'tea', title: '湯気の向こうに、\n静けさを見つける。',
    subtitle: '一杯ずつ淹れる、日本茶の小さな茶房。',
    magazine: 'SAJI / TABLE', issue: 'Vol. 15 / お茶の時間', area: '代々木上原', duration: 45, period: 'day',
    image: 'coffee.jpg', label: 'TEA & SWEETS',
    reason: '短い空き時間でも、落ち着いた席でひと休み。お茶とお菓子の45分です。',
    paragraphs: ['お湯を注ぐ音を聞きながら、ひと呼吸。架空の茶房「葉音」では、日本茶の香りを少しずつ楽しめる。', '深い緑の一杯に、季節のお菓子を添えて。急ぐ必要のない数十分が、一日をほどよく整えてくれる。', '知らなかったお茶の名前を覚えて帰る。それだけでも、今日には小さな発見があった。'],
    spot: '茶房 葉音', address: '東京都渋谷区・代々木上原エリア（架空）', hours: '09:00–18:00', price: '目安 ¥1,000',
    sponsored: 'Sponsored Recommendation',
  },
  {
    id: 'river', title: '川の流れに、\n歩幅を合わせて。',
    subtitle: '水辺を歩く、近場の小旅行。',
    magazine: 'FERN & FAR', issue: 'Vol. 23 / 水辺の休日', area: '清澄白河', duration: 60, period: 'day',
    image: 'garden.jpg', label: 'RIVERSIDE WALK', category: '自然',
    reason: '60分の軽い散歩コース。仕事の合間や休日の午後に、空を広く感じられます。',
    paragraphs: ['水面のきらめきに、足を止める。架空の散歩コース「水辺の小径」は、ゆっくり歩いて一時間ほどの道のり。', '川沿いのベンチでは、何もしない時間を楽しもう。風の向きや雲の動きに気づくと、頭の中にも余白が生まれる。', '歩きやすい靴と飲み物があれば準備完了。雨の日は無理せず、晴れた日の楽しみにとっておこう。'],
    spot: '水辺の小径', address: '東京都江東区・清澄白河エリア（架空）', hours: '09:00–18:00', price: '無料',
  },
  {
    id: 'jazz', title: '夜をほどく、\nレコードの音。',
    subtitle: '音楽とノンアルコールの一杯を楽しむラウンジ。',
    magazine: 'HOMME DAYS', issue: 'Vol. 11 / 夜を聴く', area: '恵比寿', duration: 90, period: 'evening',
    image: 'wine.jpg', label: 'MUSIC & LOUNGE', category: 'カルチャー',
    reason: '夜の90分に、レコードと静かな時間を。お酒を飲まない日にも楽しめます。',
    paragraphs: ['針を落とす小さな音から、夜が始まる。架空のミュージックラウンジ「波紋」は、大きな音を求めない音楽好きのための場所。', '季節の果実のノンアルコールドリンクを片手に、知らない曲を聴いてみる。いつものプレイリストの外にも、好きな音はきっとある。', '会話が途切れても気にならない、そんな九十分。帰り道には、新しいメロディーがひとつ増えている。'],
    spot: '波紋 レコードラウンジ', address: '東京都渋谷区・恵比寿エリア（架空）', hours: '17:00–22:00', price: '目安 ¥1,500〜',
    sponsored: 'Editorial Sponsored Story',
  },
  {
    id: 'dessert', title: '甘いひと口で、\n今日を締めくくる。',
    subtitle: '夜のパフェが待つ、小さなデザートカフェ。',
    magazine: 'SAJI / TABLE', issue: 'Vol. 16 / 夜の甘いもの', area: '代官山', duration: 45, period: 'evening',
    image: 'dinner.jpg', label: 'NIGHT DESSERT',
    reason: '帰宅前の45分に。短い夜の余白でも、季節のデザートをゆっくり味わえます。',
    paragraphs: ['一日を終える前に、甘い寄り道を。架空のデザートカフェ「月と匙」は、夜にも扉を開ける小さなお店。', '果物の酸味とクリームのやわらかさ。グラスの中の層をひと口ずつ味わうと、急いでいた気持ちもゆるんでいく。', '自分へのごほうびに、理由はいらない。今日を気持ちよく終えられたら、それで十分だ。'],
    spot: '月と匙', address: '東京都渋谷区・代官山エリア（架空）', hours: '17:00–22:00', price: '目安 ¥1,400',
  },
  {
    id: 'craft', title: '手を動かすと、\n心も動きだす。',
    subtitle: 'はじめての人にもやさしい、紙のアトリエ。',
    magazine: 'SHIFT & SILK', issue: 'Vol. 24 / つくる休日', area: '蔵前', duration: 90, period: 'day',
    image: 'art.jpg', label: 'CRAFT & DESIGN', category: 'カルチャー',
    reason: '90分のまとまった余白に、小さなものづくり。道具はデモ設定上すべて用意されています。',
    paragraphs: ['色の違う紙を並べてみる。それだけで少し楽しい。架空のアトリエ「紙日和」では、一冊の小さなノートをつくる体験を提案している。', '表紙を選び、糸を通して、端を整える。思い通りにならないところも含めて、自分の手でつくる時間を味わおう。', '完成したノートの最初のページには、次に行きたい場所を。新しい時間のきっかけになるかもしれない。'],
    spot: '紙日和 アトリエ', address: '東京都台東区・蔵前エリア（架空）', hours: '09:00–18:00', price: '目安 ¥2,000',
    sponsored: 'Calendar Native Ads',
  },
  {
    id: 'flowers', title: '一輪だけでも、\n部屋は変わる。',
    subtitle: '季節を選ぶ、花屋さんへの寄り道。',
    magazine: 'FERN & FAR', issue: 'Vol. 17 / 花のある日々', area: '代官山', duration: 45, period: 'day',
    image: 'garden.jpg', label: 'FLOWERS & LIVING', category: '自然',
    reason: '45分で楽しめる季節の花選び。帰宅後の部屋にも、外出の楽しさが続きます。',
    paragraphs: ['ガラスの花瓶に、季節の色が揺れている。架空の花店「一輪舎」は、大きな花束だけでなく一輪の買い物も歓迎するお店。', '好きな色から選んでも、名前を知らない花を選んでもいい。花を眺める時間は、自分の気分を確かめる時間でもある。', '持ち帰ったら、いつも目に入る場所へ。小さな寄り道が、家で過ごす時間まで明るくしてくれる。'],
    spot: '一輪舎', address: '東京都渋谷区・代官山エリア（架空）', hours: '09:00–18:00', price: '目安 ¥500〜',
  },
  {
    id: 'bistro', title: 'カウンターから、\n始まる週末。',
    subtitle: '気取らない一皿と、ゆっくり流れる夜。',
    magazine: 'SAJI / TABLE', issue: 'Vol. 12 / 週末の食卓', area: '代々木上原', duration: 120, period: 'evening',
    image: 'dinner.jpg', label: 'WEEKEND DINING',
    reason: '夜に2時間の余裕がある日に。食事と会話を急がず楽しめる、少し長めの寄り道です。',
    paragraphs: ['椅子を引くと、一週間の肩の力が抜けていく。架空のビストロ「金曜の窓」は、週末をゆっくり迎えたい人のための食卓。', '旬の野菜の前菜から始めて、焼きたてのメインへ。料理の合間に窓の外を眺める時間も、このお店の楽しみのひとつだ。', '今日は予定を詰めこまない。二時間を自分のために使うことが、いちばんのごちそうになる。'],
    spot: '金曜の窓', address: '東京都渋谷区・代々木上原エリア（架空）', hours: '17:00–22:00', price: '目安 ¥3,500〜',
  },
]

stories.push(
  {
    id: 'beauty', title: 'わたしを整える、\n45分の美容時間。',
    subtitle: '香りと色を試す、自分のためのビューティーラボ。',
    magazine: 'LUMIÈRE ME', issue: 'Vol. 03 / わたしの透明感', area: '表参道', duration: 45, period: 'any',
    image: 'beauty.svg', label: 'BEAUTY & SELF CARE', category: 'ビューティー',
    reason: '仕事帰りにも、休日にも。45分の余白で、気になる香りとスキンケアをゆっくり試して。',
    paragraphs: ['架空のビューティーラボ「光のアトリエ」は、自分のペースで美容を楽しむための空間。香りや質感を比べながら、今日の気分に合うものを探そう。', '鏡の前で深呼吸。手の甲にひとしずく、植物の香りを広げてみる。いつものケアを見直すきっかけは、こんな短い体験から始まる。', '誰かの正解ではなく、自分の心地よさを選ぶ。帰り道には、小さなセルフケアのヒントをひとつ。'],
    spot: '光のアトリエ', address: '東京都渋谷区・表参道エリア（架空）', hours: '09:00–22:00', price: '体験無料 / 商品代別',
  },
  {
    id: 'style', title: '明日のわたしに、\n似合う一着。',
    subtitle: '働く日常を軽やかにする、ワードローブの新定番。',
    magazine: 'SHIFT & SILK', issue: 'Vol. 25 / 働く日のスタイル', area: '代官山', duration: 60, period: 'day',
    image: 'art.jpg', label: 'FASHION & WORK', category: 'ファッション',
    reason: '昼休みや休日の60分に。着心地から選ぶ、働く女性のためのスタイル探し。',
    paragraphs: ['架空のセレクトルーム「余白のクローゼット」で、働く日の装いを見直そう。きちんと見えて、心地よい。そんな服を自分の目で確かめる時間。', '肩まわりの軽さ、布の落ち方、ポケットの位置。小さなディテールを確かめていくと、忙しい一日を支えてくれる服の条件が見えてくる。', '手持ちの一着との組み合わせを想像するだけでもいい。新しい自分の定番を、ゆっくり見つけよう。'],
    spot: '余白のクローゼット', address: '東京都渋谷区・代官山エリア（架空）', hours: '09:00–18:00', price: '入店無料 / 商品代別',
  },
)

export const magazineEditions = [
  { name: 'HOMME DAYS', genre: 'MEN’S LIFESTYLE', line: '自分のスタイルで、生きる。', product: '余韻 レザーキーケース', price: '¥4,800', image: 'wine.jpg' },
  { name: 'ROAMÉ DAYS', genre: 'TRAVEL & CITY', line: '知らない街の、いつもの場所。', product: 'ROAMÉ トラベルポーチ', price: '¥3,200', image: 'coffee.jpg' },
  { name: 'LUMIÈRE ME', genre: 'BEAUTY & SELF CARE', line: 'きれいは、わたしのペースで。', product: 'LUMIÈRE ボタニカルセラム', price: '¥3,600', image: 'beauty.svg' },
  { name: 'FERN & FAR', genre: 'OUTDOOR & NATURE', line: '街を抜けて、深呼吸。', product: 'FERN & FAR ステンレスボトル', price: '¥2,800', image: 'garden.jpg' },
  { name: 'SHIFT & SILK', genre: 'WORKING WOMEN’S STYLE', line: '働く日も、わたしらしく。', product: 'SHIFT & SILK デイリートート', price: '¥6,400', image: 'art.jpg' },
  { name: 'SAJI / TABLE', genre: 'FOOD & GOOD TIMES', line: 'おいしい時間を、日常に。', product: 'SAJI / TABLE ペアカップ', price: '¥2,400', image: 'dinner.jpg' },
]

export function magazineFor(story: Story) {
  return magazineEditions.find((edition) => edition.name === story.magazine) ?? magazineEditions[4]
}

export function storyCategory(story: Story): string {
  return story.category ?? (story.id === 'art' ? 'カルチャー' : story.id === 'garden' ? '自然' : 'グルメ')
}

export function storyTone(id?: string): string {
  const index = stories.findIndex((story) => story.id === id)
  return ['rose', 'amber', 'lilac', 'mint', 'peach', 'sky'][Math.max(0, index) % 6]
}

export const dayPlan = [
  { storyId: 'coffee', start: 660 },
  { storyId: 'art', start: 780 },
  { storyId: 'shop', start: 930 },
  { storyId: 'dinner', start: 1080 },
]

export function fits(story: Story, slot: FreeSlot): boolean {
  const start = Math.max(slot.start, story.period === 'evening' ? 17 * 60 : 9 * 60)
  const closing = story.period === 'day' ? 18 * 60 : 22 * 60
  return start + story.duration <= Math.min(slot.end, closing)
}

export function storyStart(story: Story, slot: FreeSlot): number {
  return Math.max(slot.start, story.period === 'evening' ? 17 * 60 : 9 * 60)
}
