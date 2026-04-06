import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useRef } from 'react'
import { Camera } from 'lucide-react'
import { authService } from '../services/auth.service.js'
import { updateUser } from '../store/authSlice.js'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user }   = useSelector(s => s.auth)
  const dispatch   = useDispatch()
  const fileRef    = useRef()
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  useEffect(() => { if (user) reset(user) }, [user])

  const onSubmit = async (data) => {
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => { if (v) fd.append(k, v) })
    try {
      const res = await authService.updateMe(fd)
      dispatch(updateUser(res.data))
      toast.success('Profil mis à jour')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-2xl font-display font-semibold text-sahel-dark mb-6">Mon profil</h1>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-sahel-light border-2 border-sahel-primary/20">
                {user?.avatar
                  ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-sahel-primary">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                }
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-sahel-primary rounded-full flex items-center justify-center shadow-md"
              >
                <Camera size={13} className="text-white" />
              </button>
              <input type="file" ref={fileRef} className="hidden" accept="image/*"
                onChange={e => {
                  const file = e.target.files[0]
                  if (file) {
                    const fd = new FormData()
                    fd.append('avatar', file)
                    authService.updateMe(fd).then(res => dispatch(updateUser(res.data)))
                  }
                }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: 'username', label: 'Nom d\'utilisateur', type: 'text' },
              { name: 'email',    label: 'Email',               type: 'email' },
              { name: 'phone',    label: 'Téléphone',           type: 'tel' },
              { name: 'whatsapp', label: 'WhatsApp',            type: 'tel' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                <input type={f.type} {...register(f.name)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sahel-primary/30 focus:border-sahel-primary transition-all" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
              <textarea {...register('address')} rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sahel-primary/30 resize-none" />
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full py-3.5 bg-sahel-primary text-white font-semibold rounded-xl hover:bg-sahel-primary/90 transition-colors disabled:opacity-60 text-sm">
              {isSubmitting ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}