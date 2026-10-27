import type { Product } from './products'

export function ProductImage({ product }: { product: Product }) {
  return <svg className="product-image" viewBox="0 0 240 160" role="img" aria-label={`${product.name}の架空の商品イラスト`}>
    <rect width="240" height="160" fill="#fff" />
    <ellipse cx="120" cy="142" rx="57" ry="5" fill="#edf0f2" />
    <g fill={product.color} stroke="#30343b" strokeWidth="2.5" strokeLinejoin="round">
      {product.shape === 'bag' ? <><path d="M66 58h108l10 78H56Z" /><path d="M96 62V40a24 24 0 0 1 48 0v22" fill="none" /></>
        : product.shape === 'cup' ? <><path d="M78 52h77v60a22 22 0 0 1-22 22h-33a22 22 0 0 1-22-22Z" /><path d="M155 62h10a20 20 0 0 1 0 40h-10" fill="none" /></>
          : <><rect x="83" y="52" width="74" height="84" rx={product.shape === 'perfume' ? 8 : 22} /><path d="M104 52V25h32v27" /><path d="M99 23h42" /></>}
    </g><rect x="91" y="78" width="58" height="33" rx="2" fill="#fff" /><text x="120" y="97" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9" fill="#30343b">MAG LIFE.</text>
  </svg>
}

export function ProductCards({ items, favorites, onFavorite, onOpen }: { items: readonly Product[]; favorites: string[]; onFavorite: (product: Product) => void; onOpen: (product: Product) => void }) {
  return <section className="product-section"><p className="eyebrow">SPONSORED OBJECTS · PR</p><h3>この時間に、連れていきたい。</h3><div className="product-grid">
    {items.map((product) => <article className="product-card" key={product.id}>
      <button className="product-preview" onClick={() => onOpen(product)} aria-label={`${product.name}の商品詳細`}><span className="product-pr">PR · 広告</span><ProductImage product={product} /></button>
      <div><small>{product.brand}</small><h4>{product.name}</h4><p>{product.description}</p><p>{product.price}</p>
        <button className="text-button" onClick={() => onOpen(product)}>商品詳細を見る →</button>
        <button className="secondary product-save" aria-pressed={favorites.includes(product.id)} onClick={() => onFavorite(product)}>{favorites.includes(product.id) ? '♥ 保存済み' : '♡ お気に入り保存'}</button>
      </div>
    </article>)}
  </div><p className="fiction-note">PR：編集記事とは別の架空の広告商品です。商品・ブランド・価格はデモ用です。購入機能はありません。</p></section>
}
