import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { setCredentials } from '../store/authSlice.js'
import { authService } from '../services/auth.service.js'
import toast from 'react-hot-toast'

const schema = z.object({
  username:  z.string().min(3, 'Minimum 3 caractères'),
  email:     z.string().email('Email invalide'),
  password:  z.string().min(8, 'Minimum 8 caractères'),
  password2: z.string(),
  role:      z.enum(['client', 'producer']),
  phone:     z.string().optional(),
}).refine(d => d.password === d.password2, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password2'],
})

export default function Register() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'client' },
  })

  const role = watch('role')

  const onSubmit = async (data) => {
    try {
      const res = await authService.register(data)
      dispatch(setCredentials(res.data))
      toast.success('Compte créé avec succès !')
      navigate(data.role === 'producer' ? '/dashboard/producer' : '/')
    } catch (err) {
      const errs = err.response?.data
      if (errs) {
        Object.values(errs).flat().forEach(e => toast.error(e))
      } else {
        toast.error('Erreur lors de l\'inscription')
      }
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sahel-dark to-sahel-secondary items-center justify-center p-12">
        <div className="text-white text-center">
          <h1 className="text-5xl font-display font-bold mb-4">Sahel<br /><span className="text-sahel-accent">Market</span></h1>
          <p className="text-gray-300 text-lg max-w-xs">Rejoignez notre communauté d'artisans et d'acheteurs</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <h2 className="text-3xl font-display font-semibold text-sahel-dark mb-2">Créer un compte</h2>
          <p className="text-gray-500 text-sm mb-8">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-sahel-primary font-medium hover:underline">Se connecter</Link>
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'client',   label: 'Acheteur',   desc: 'Je veux acheter' },
              { value: 'producer', label: 'Artisan',    desc: 'Je veux vendre' },
            ].map(opt => (
              <label
                key={opt.value}
                className={`flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  role === opt.value
                    ? 'border-sahel-primary bg-sahel-light'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input type="radio" value={opt.value} {...register('role')} className="sr-only" />
                <span className="font-semibold text-sahel-dark text-sm">{opt.label}</span>
                <span className="text-xs text-gray-500 mt-0.5">{opt.desc}</span>
              </label>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: 'username',  label: 'Nom d\'utilisateur', type: 'text',     placeholder: 'johndoe' },
              { name: 'email',     label: 'Email',               type: 'email',    placeholder: 'vous@exemple.com' },
              { name: 'phone',     label: 'Téléphone',           type: 'tel',      placeholder: '+237 6XX XXX XXX' },
              { name: 'password',  label: 'Mot de passe',        type: 'password', placeholder: 'Minimum 8 caractères' },
              { name: 'password2', label: 'Confirmer le mot de passe', type: 'password', placeholder: '••••••••' },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  {...register(field.name)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sahel-primary/30 focus:border-sahel-primary transition-all"
                />
                {errors[field.name] && <p className="text-red-500 text-xs mt-1">{errors[field.name].message}</p>}
              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-sahel-primary text-white font-semibold rounded-xl hover:bg-sahel-primary/90 transition-colors disabled:opacity-60 text-sm"
            >
              {isSubmitting ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}