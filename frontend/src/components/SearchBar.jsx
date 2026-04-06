import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setFilters } from '../store/productSlice.js'
import { useNavigate } from 'react-router-dom'

export default function SearchBar({ placeholder = 'Rechercher un produit...' }) {
  const [query, setQuery] = useState('')
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(setFilters({ search: query }))
    navigate('/products')
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <Search size={18} className="absolute left-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sahel-primary/30 focus:border-sahel-primary transition-all"
      />
      {query && (
        <button
          type="button"
          onClick={() => { setQuery(''); dispatch(setFilters({ search: '' })) }}
          className="absolute right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      )}
    </form>
  )
}