import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Package, Eye, TrendingUp, ShoppingBag } from 'lucide-react'
import api from '../../services/api.js'

export default function ProducerDashboard() {
  const { data } = useQuery({
    queryKey: ['dashboard', 'producer'],
    queryFn:  () => api.get('/dashboard/producer/'),
  })
  const stats = data?.data

  const statCards = [
    { icon: Package,   label: 'Mes produits',   value: stats?.products_count ?? '—' },
    { icon: Eye,       label: 'Vues totales',    value: stats?.total_views ?? '—' },
    { icon: TrendingUp,label: 'Revenus (FCFA)',  value: stats?.revenue ? Number(stats.revenue).toLocaleString() : '—' },
    { icon: ShoppingBag,label: 'Commandes',      value: stats?.orders_count ?? '—' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-display font-semibold text-sahel-dark mb-6">Mon tableau de bord</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="w-10 h-10 rounded-xl bg-sahel-light flex items-center justify-center mb-3">
                <Icon size={18} className="text-sahel-primary" />
              </div>
              <p className="text-2xl font-bold text-sahel-dark">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {stats?.products?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-display font-semibold text-sahel-dark mb-4">Vues par produit</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.products.slice(0, 8)}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="views" fill="#C8732A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {stats?.products?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-display font-semibold text-sahel-dark">Mes produits</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {stats.products.map(p => (
                <div key={p.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-sahel-dark">{p.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Stock : {p.stock} · {p.views} vues</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    p.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {p.is_available ? 'Disponible' : 'Indisponible'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}