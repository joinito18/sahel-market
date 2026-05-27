const KEY = 'sahel_recently_viewed'
const MAX = 8

export function addRecentlyViewed(product) {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '[]')
    const filtered = stored.filter(p => p.id !== product.id)
    const updated = [
      { id: product.id, name: product.name, price: product.price,
        main_image: product.main_image, producer_name: product.producer_name,
        stock: product.stock },
      ...filtered,
    ].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(updated))
  } catch {}
}

export function getRecentlyViewed() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') }
  catch { return [] }
}
