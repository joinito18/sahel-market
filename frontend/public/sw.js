const CACHE = 'sahel-market-v1'

const STATIC = [
  '/',
  '/products',
  '/how-it-works',
  '/manifest.json',
  '/icon.svg',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const { request } = e
  const url = new URL(request.url)

  // Ne pas intercepter les appels API, media ou WebSocket
  if (url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/media') ||
      url.pathname.startsWith('/ws') ||
      request.method !== 'GET') {
    return
  }

  // Stratégie Network-first pour les pages, Cache-first pour assets statiques
  if (request.destination === 'document') {
    e.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(request, clone))
          return res
        })
        .catch(() => caches.match(request).then(r => r || caches.match('/')))
    )
  } else {
    e.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(res => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE).then(c => c.put(request, clone))
          }
          return res
        })
      })
    )
  }
})
