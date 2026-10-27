export type MagazineEvent = {
  id: string
  title: string
  releaseDate: string
  note?: string
}

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function createDemoEvents(today: Date): MagazineEvent[] {
  const releaseDate = (day: number) =>
    dateKey(new Date(today.getFullYear(), today.getMonth(), day))

  return [
    { id: 'demo-1', title: '暮らしの余白 第11号', releaseDate: releaseDate(3), note: '小さな部屋を心地よく整える特集。※架空の雑誌です。' },
    { id: 'demo-2', title: '旅する喫茶 第8号', releaseDate: releaseDate(8), note: '週末に訪れたい、街角の喫茶店。' },
    { id: 'demo-3', title: '星空スケッチ 第12号', releaseDate: releaseDate(15), note: '夜空の観察と星の描き方を楽しむ一冊。' },
    { id: 'demo-4', title: '紙とことば 第5号', releaseDate: releaseDate(15), note: '手紙とノートのある日々。' },
    { id: 'demo-5', title: 'みどりの窓辺 第3号', releaseDate: releaseDate(22), note: 'はじめての室内ガーデニング。' },
    { id: 'demo-6', title: '週末アトリエ 第9号', releaseDate: releaseDate(27) },
  ]
}
