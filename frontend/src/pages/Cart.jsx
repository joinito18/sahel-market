import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag } from 'lucide-react'
import { removeItem, updateQuantity } from '../store/cartSlice.js'

export default function Cart() {
  const dispatch = useDispatch()
  const { items, total } = useSelector(s => s.cart)

  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-400">
      <ShoppingBag size={64} strokeWidth={1} />
      <p className="text-lg font-medium">Votre panier est vide</p>
      <Link to="/products" className="px-6 py-2 bg-sahel-primary text-white text-sm rounded-lg">Voir le catalogue</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-display font-semibold text-sahel-dark mb-6">Mon panier</h1>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
          {items.map((item, idx) => (
            <div key={item.id} className={`flex gap-4 p-5 ${idx < items.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-sahel-light flex-shrink-0">
                {item.main_image
                  ? <img src={item.main_image} alt={item.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">Photo</div>
                }
              </div>
              <div className="flex-1">
                <p className="font-medium text-sahel-dark">{item.name}</p>
                <p className="text-sahel-primary font-bold mt-1">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))} className="px-3 py-1 hover:bg-gray-50 text-lg leading-none">-</button>
                    <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))} className="px-3 py-1 hover:bg-gray-50 text-lg leading-none">+</button>
                  </div>
                  <button onClick={() => dispatch(removeItem(item.id))} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Sous-total</span>
            <span>{total.toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between font-bold text-sahel-dark text-lg mt-3 pt-3 border-t border-gray-100">
            <span>Total</span>
            <span>{total.toLocaleString()} FCFA</span>
          </div>
          <Link to="/checkout" className="block w-full py-3.5 bg-sahel-primary text-white text-center font-semibold rounded-xl hover:bg-sahel-primary/90 transition-colors mt-4">
            Passer la commande
          </Link>
        </div>
      </div>
    </div>
  )
}