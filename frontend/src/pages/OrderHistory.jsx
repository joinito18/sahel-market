import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Package, MapPin } from 'lucide-react'
import { orderService } from '../services/order.service.js'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const STATUS_LABELS = {
  pending:    { label: 'En attente',    color: 'bg-yellow-100 text-yellow-700' },
  paid:       { label: 'Payé',          color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'En traitement', color: 'bg-purple-100 text-purple-700' },
  shipped:    { label: 'Expédié',       color: 'bg-orange-100 text-orange-700' },
  delivered:  { label: 'Livré',         color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Annulé',        color: 'bg-red-100 text-red-700' },
}

export default function OrderHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn:  () => orderService.getOrders(),
  })

  const orders = data?.data?.results || []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-display font-semibold text-sahel-dark mb-6">Mes commandes</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={48} strokeWidth={1} className="mx-auto mb-3" />
            <p>Aucune commande pour l'instant</p>
            <Link to="/products" className="mt-4 inline-block text-sm text-sahel-primary hover:underline">
              Commencer mes achats
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const s = STATUS_LABELS[order.status] || STATUS_LABELS.pending
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sahel-dark">Commande #{order.id}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {format(new Date(order.created_at), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${s.color}`}>
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <MapPin size={11} />
                    <span className="truncate">{order.delivery_address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sahel-primary">
                      {Number(order.total_amount).toLocaleString()} FCFA
                    </span>
                    <div className="flex gap-2">
                      {order.status === 'shipped' && (
                        <Link to={`/orders/${order.id}/track`}
                          className="text-xs px-3 py-1.5 bg-sahel-secondary/10 text-sahel-secondary rounded-lg hover:bg-sahel-secondary/20 transition-colors font-medium">
                          Suivre
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}