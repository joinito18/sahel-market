import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { orderService } from '../services/order.service.js'
import DeliveryTracker from '../components/DeliveryTracker.jsx'

export default function TrackOrder() {
  const { id } = useParams()
  const { data } = useQuery({
    queryKey: ['order', id],
    queryFn:  () => orderService.getOrder(id),
  })
  const order = data?.data

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-display font-semibold text-sahel-dark mb-6">
          Suivi — Commande #{id}
        </h1>
        {order && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-sahel-primary">
                {Number(order.total_amount).toLocaleString()} FCFA
              </span>
            </div>
          </div>
        )}
        <DeliveryTracker orderId={id} />
      </div>
    </div>
  )
}