import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setFilters } from '../store/productSlice.js'
import { useNavigate } from 'react-router-dom'
import { productService } from '../services/product.service.js'
import { imgUrl } from '../utils/media.js'

export default function SearchBar({ placeholder = 'Rechercher un produit...' }) {
  const [query,       setQuery]       = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [open,        setOpen]        = useState(false)
  const [loading,     setLoading]     = useState(false)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const wrapRef   = useRef(null)
  const timerRef  = useRef(null)

  /* Fermer si clic en dehors */
  useEffect(() => {
    const handler = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* Debounce — requête après 300 ms */
  useEffect(() => {
    clearTimeout(timerRef.current)
    if (query.trim().length < 2) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    timerRef.current = setTimeout(async () => {
      try {
        const res = await productService.getAll({ search: query, page_size: 6 })
        const results = res.data?.results ?? res.data ?? []
        setSuggestions(results)
        setOpen(results.length > 0)
      } catch { setSuggestions([]) }
      finally  { setLoading(false) }
    }, 300)
    return () => clearTimeout(timerRef.current)
  }, [query])

  const handleSubmit = e => {
    e.preventDefault()
    setOpen(false)
    dispatch(setFilters({ search: query }))
    navigate('/products')
  }

  const handleSelect = product => {
    setOpen(false)
    setQuery('')
    navigate(`/products/${product.id}`)
  }

  const clear = () => { setQuery(''); setSuggestions([]); setOpen(false); dispatch(setFilters({ search: '' })) }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <form onSubmit={handleSubmit} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 13, pointerEvents: 'none' }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          style={{ width: '100%', padding: '11px 36px 11px 38px', background: '#fff',
            border: '1px solid #e5e7eb', borderRadius: open ? '12px 12px 0 0' : 12,
            fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif',
            color: '#111827', boxSizing: 'border-box', transition: 'border-radius .15s' }}
        />
        {(query || loading) && (
          <button type="button" onClick={clear}
            style={{ position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <X size={15} color="#9ca3af" />
          </button>
        )}
      </form>

      {/* Dropdown suggestions */}
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: '#fff', border: '1px solid #e5e7eb', borderTop: 'none',
          borderRadius: '0 0 12px 12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          overflow: 'hidden' }}>
          {suggestions.map((p, i) => {
            const src = imgUrl(p.main_image)
            return (
              <button key={p.id} onClick={() => handleSelect(p)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer',
                  borderBottom: i < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                  textAlign: 'left', transition: 'background .12s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 }}>
                  {src && <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{Number(p.price).toLocaleString('fr-FR')} FCFA</p>
                </div>
              </button>
            )
          })}
          <button onClick={handleSubmit}
            style={{ width: '100%', padding: '10px 14px', border: 'none', background: '#f9fafb',
              fontSize: 12, fontWeight: 700, color: '#f97316', cursor: 'pointer', textAlign: 'center' }}>
            Voir tous les résultats pour "{query}" →
          </button>
        </div>
      )}
    </div>
  )
}
