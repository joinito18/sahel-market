import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import { productService } from '../services/product.service.js'
import ProductCard from '../components/ProductCard.jsx'

export default function Wishlist() {
  const { ids } = useSelector(s => s.wishlist)

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn:  () => productService.getWishlist(),
    staleTime: 60_000,
  })

  const products = Array.isArray(data?.data) ? data.data
    : Array.isArray(data?.data?.results) ? data.data.results : []

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Heart size={24} className="text-red-500 fill-red-500" />
        <h1 className="text-2xl font-bold text-gray-800">Mes favoris</h1>
        {products.length > 0 && (
          <span className="ml-1 text-sm text-gray-400 font-normal">
            ({products.length} produit{products.length > 1 ? 's' : ''})
          </span>
        )}
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <Heart size={48} className="text-gray-200" />
          <h2 className="text-lg font-semibold text-gray-600">
            Votre liste de favoris est vide
          </h2>
          <p className="text-gray-400 text-sm max-w-xs">
            Cliquez sur le cœur ❤️ d'un produit pour l'ajouter à vos favoris.
          </p>
          <Link
            to="/products"
            className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-orange-500
                       text-white font-bold rounded-xl hover:bg-orange-600 transition-colors text-sm"
          >
            <ShoppingBag size={16} />
            Découvrir les produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </main>
  )
}
