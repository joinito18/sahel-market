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
  email:    z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

export default function Login() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      const res = await authService.login(data)
      dispatch(setCredentials(res.data))
      toast.success('Bienvenue !')
      const role = res.data.user.role
      const redirects = { admin: '/dashboard/admin', agent: '/dashboard/agent', producer: '/dashboard/producer' }
      navigate(redirects[role] || '/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Identifiants incorrects')
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sahel-dark to-sahel-secondary items-center justify-center p-12">
        <div className="text-white text-center">
          <h1 className="text-5xl font-display font-bold mb-4">Sahel<br /><span className="text-sahel-accent">Market</span></h1>
          <p className="text-gray-300 text-lg max-w-xs">L'artisanat du Nord Cameroun à portée de clic</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <h2 className="text-3xl font-display font-semibold text-sahel-dark mb-2">Connexion</h2>
          <p className="text-gray-500 text-sm mb-8">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-sahel-primary font-medium hover:underline">S'inscrire</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                {...register('email')}
                placeholder="vous@exemple.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sahel-primary/30 focus:border-sahel-primary transition-all"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sahel-primary/30 focus:border-sahel-primary transition-all"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-sahel-primary text-white font-semibold rounded-xl hover:bg-sahel-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}