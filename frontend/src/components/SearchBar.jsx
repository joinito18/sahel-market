import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setFilters } from '../store/productSlice.js'
import { useNavigate } from 'react-router-dom'

export default function SearchBar({ placeholder = 'Rechercher un produit...' }) {
  const [query, setQuery] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(setFilters({ search: query }))
    navigate('/products')
  }

  return (
    <form onSubmit={handleSubmit} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: 14, pointerEvents: 'none' }} />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '12px 40px 12px 42px',
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
          fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif',
          color: '#111827', boxSizing: 'border-box',
        }}
      />
      {query && (
        <button
          type="button"
          onClick={() => { setQuery(''); dispatch(setFilters({ search: '' })) }}
          style={{
            position: 'absolute', right: 14, background: 'none',
            border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center',
          }}
        >
          <X size={16} color="#9ca3af" />
        </button>
      )}
    </form>
  )
}
