import { magazineFor } from './stories.ts'
import type { Story } from './stories.ts'

export const products = [
  { id: 'product-homme', magazine: 'HOMME DAYS', brand: 'YOIN OBJECTS', name: 'Evening ウッディパルファム', description: '次のデートに、いつもと違う香りを。穏やかな木々をイメージした香水。', price: '¥5,800', shape: 'perfume', color: '#f4a8c2' },
  { id: 'product-roame', magazine: 'ROAMÉ DAYS', brand: 'ROAMÉ GOODS', name: 'Weekend トラベルポーチ', description: '旅をもっと快適にする、小さな相棒。身の回りの道具をひとまとめに。', price: '¥3,200', shape: 'bag', color: '#60d3cf' },
  { id: 'product-lumiere', magazine: 'LUMIÈRE ME', brand: 'LUMIÈRE LAB', name: 'ボタニカルセラム', description: '次のデートの前にも。毎日のケアに寄り添う、軽やかなテクスチャー。', price: '¥3,600', shape: 'bottle', color: '#be9bf3' },
  { id: 'product-fern', magazine: 'FERN & FAR', brand: 'FERN EQUIPMENT', name: 'Trail ステンレスボトル', description: '次の休日は、自然の中へ。散歩にもキャンプにも連れていきたい一本。', price: '¥2,800', shape: 'bottle', color: '#62cd95' },
  { id: 'product-shift', magazine: 'SHIFT & SILK', brand: 'SHIFT OBJECTS', name: 'Light デイリートート', description: '忙しい一日を、少し心地よく。仕事の道具をすっきり収める軽いバッグ。', price: '¥6,400', shape: 'bag', color: '#8cb9f5' },
  { id: 'product-saji', magazine: 'SAJI / TABLE', brand: 'SAJI OBJECTS', name: 'Morning ペアカップ', description: '食卓に、小さな楽しみを。コーヒーの香りをゆっくり味わう二つのカップ。', price: '¥2,400', shape: 'cup', color: '#ffb17a' },
] as const

export type Product = typeof products[number]

export function productFor(story: Story): Product {
  return products.find((product) => product.magazine === magazineFor(story).name)!
}
