import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Users, Package } from 'lucide-react'
import api from '../../services/api.js'
import toast from 'react-hot-toast'

export default function AgentDashboard() {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const { data: producersData } = useQuery({
    queryKey: ['agents', 'producers'],
    queryFn:  () => api.get('/agents/producers/'),
  })
  const producers = producersData?.data || []

  const addMutation = useMutation({
    mutationFn: (data) => api.post('/agents/producers/', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['agents', 'producers'])
      toast.success(`Producteur ajouté ! Mot de passe temporaire : ${res.data.temporary_password}`)
      reset()
      setShowForm(false)
    },
    onError: () => toast.error('Erreur lors de l\'ajout'),
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-semibold text-sahel-dark">Tableau de bord Agent</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-sahel-primary text-white text-sm font-medium rounded-xl hover:bg-sahel-primary/90 transition-colors"
          >
            <Plus size={16} />
            Ajouter un producteur
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-sahel-dark mb-4">Nouveau producteur</h2>
            <form onSubmit={handleSubmit(d => addMutation.mutate(d))} className="grid grid-cols-2 gap-4">
              {[
                { name: 'nom',       label: 'Nom',       placeholder: 'Aliou' },
                { name: 'prenom',    label: 'Prénom',    placeholder: 'Mahamat' },
                { name: 'email',     label: 'Email',     placeholder: 'producteur@exemple.com' },
                { name: 'telephone', label: 'Téléphone', placeholder: '+237 6XX XXX XXX' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                  <input {...register(f.name, { required: true })} placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sahel-primary/30" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
                <input {...register('adresse', { required: true })} placeholder="Maroua, Cameroun"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sahel-primary/30" />
              </div>
              <div className="col-span-2 flex gap-3">
                <button type="submit" disabled={isSubmitting}
                  className="px-6 py-2.5 bg-sahel-primary text-white text-sm font-medium rounded-xl hover:bg-sahel-primary/90 disabled:opacity-60 transition-colors">
                  {isSubmitting ? 'Ajout...' : 'Ajouter'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Users size={18} className="text-sahel-secondary" />
            <h2 className="font-display font-semibold text-sahel-dark">Mes producteurs ({producers.length})</h2>
          </div>
          {producers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users size={36} strokeWidth={1} className="mx-auto mb-2" />
              <p className="text-sm">Aucun producteur ajouté pour l'instant</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {producers.map(p => (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 rounded-full bg-sahel-light flex items-center justify-center font-bold text-sahel-primary text-sm flex-shrink-0">
                    {p.first_name?.[0] || p.username[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sahel-dark">{p.first_name} {p.last_name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.email} · {p.phone}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-medium">Actif</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}