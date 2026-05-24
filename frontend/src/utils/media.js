const BASE = import.meta.env.VITE_API_URL ?? ''

export function imgUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${BASE}${path}`
}

export function fcfa(n) {
  return Number(n).toLocaleString('fr-FR') + ' FCFA'
}
