import { useForm } from 'react-hook-form'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { orderService } from '../services/order.service.js'
import { clearCart } from '../store/cartSlice.js'
import toast from 'react-hot-toast'

export default function Checkout() {
  const { items, total } = useSelector(s => s.cart)
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      const res = await orderService.checkout({
        delivery_address: data.address,
        delivery_fee: 1500,
      })
      if (res.data.payment_url) {
        dispatch(clearCart())
        window.location.href = res.data.payment_url
      } else {
        dispatch(clearCart())
        navigate(`/orders/${res.data.order.id}`)
        toast.success('Commande créée !')
      }
    } catch {
      toast.error('Erreur lors de la commande')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-display font-semibold text-sahel-dark mb-6">Finaliser la commande</h1>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <h2 className="font-semibold text-sahel-dark mb-4">Adresse de livraison</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse complète</label>
              <textarea
                {...register('address', { required: true })}
                rows={3}
                placeholder="Quartier, ville, région..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sahel-primary/30 resize-none"
              />
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Sous-total ({items.length} article{items.length > 1 ? 's' : ''})</span>
                <span>{total.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Frais de livraison</span>
                <span>1 500 FCFA</span>
              </div>
              <div className="flex justify-between font-bold text-sahel-dark text-base pt-2 border-t border-gray-100">
                <span>Total à payer</span>
                <span>{(total + 1500).toLocaleString()} FCFA</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-sahel-primary text-white font-semibold rounded-xl hover:bg-sahel-primary/90 transition-colors disabled:opacity-60 text-sm"
            >
              {isSubmitting ? 'Traitement...' : 'Payer avec CinetPay'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}