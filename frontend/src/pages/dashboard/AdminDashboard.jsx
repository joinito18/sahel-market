import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Users, ShoppingBag, TrendingUp, AlertTriangle, Package, Store } from 'lucide-react'
import api from '../../services/api.js'

export default function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ['dashboard', 'global'],
    queryFn:  () => api.get('/dashboard/global/'),
  })
  const stats = data?.data

  const cards = [
    { icon: TrendingUp,    label: 'Ventes totales',       value: stats?.total_sales ? `${Number(stats.total_sales).toLocaleString()} FCFA` : '—', color: 'text-sahel-primary' },
    { icon: TrendingUp,    label: 'Ventes ce mois',       value: stats?.monthly_sales ? `${Number(stats.monthly_sales).toLocaleString()} FCFA` : '—', color: 'text-sahel-secondary' },
    { icon: Users,         label: 'Clients actifs',       value: stats?.active_clients ?? '—', color: 'text-blue-600' },
    { icon: Store,         label: 'Producteurs',          value: stats?.total_producers ?? '—', color: 'text-sahel-secondary' },
    { icon: Package,       label: 'Produits',             value: stats?.total_products ?? '—', color: 'text-purple-600' },
    { icon: ShoppingBag,   label: 'Commandes en attente', value: stats?.pending_orders ?? '—', color: 'text-orange-500' },
    { icon: AlertTriangle, label: 'Litiges',              value: stats?.disputes ?? '—', color: 'text-red-500' },
    { icon: Users,         label: 'Utilisateurs total',   value: stats?.total_users ?? '—', color: 'text-gray-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-display font-semibold text-sahel-dark mb-6">Tableau de bord Admin</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center mb-3`}>
                <Icon size={16} className={color} />
              </div>
              <p className="text-xl font-bold text-sahel-dark">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-display font-semibold text-sahel-dark mb-4">Aperçu des ventes</h2>
          <p className="text-sm text-gray-400 text-center py-12">
            Graphique disponible après intégration des données de vente historiques
          </p>
        </div>
      </div>
    </div>
  )
}