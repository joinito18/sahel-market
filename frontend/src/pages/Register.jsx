import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, forwardRef } from 'react'  // ← forwardRef ajouté
import {
  User, Mail, Lock, Phone, MapPin,
  Store, ShoppingBag, ArrowRight, ArrowLeft,
  Upload, Video, X, Check, Eye, EyeOff,
  FileText, Camera
} from 'lucide-react'
import { setCredentials } from '../store/authSlice.js'
import { authService } from '../services/auth.service.js'
import api from '../services/api.js'
import toast from 'react-hot-toast'

// ─── Schémas validation ────────────────────────────────────────────
const clientSchema = z.object({
  username:  z.string().min(3, 'Minimum 3 caractères'),
  email:     z.string().email('Email invalide'),
  phone:     z.string().min(9, 'Numéro invalide'),
  password:  z.string().min(8, 'Minimum 8 caractères'),
  password2: z.string(),
}).refine(d => d.password === d.password2, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password2'],
})

const producerSchema = z.object({
  username:         z.string().min(3, 'Minimum 3 caractères'),
  email:            z.string().email('Email invalide'),
  phone:            z.string().min(9, 'Numéro invalide'),
  address:          z.string().min(5, 'Adresse requise'),
  password:         z.string().min(8, 'Minimum 8 caractères'),
  password2:        z.string(),
  speciality:       z.string().min(2, 'Spécialité requise'),
  years_experience: z.string().optional(),
  bio:              z.string().optional(),
}).refine(d => d.password === d.password2, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password2'],
})

// ─── Champ générique ───────────────────────────────────────────────
function Field({ label, error, children, required = true, hint }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {!required && (
          <span className="ml-1.5 text-xs font-normal text-gray-400">(facultatif)</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-400 mt-1">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <X size={10} /> {error}
        </p>
      )}
    </div>
  )
}

// ─── Input stylisé (CORRIGÉ avec forwardRef) ───────────────────────
const Input = forwardRef(({ icon: Icon, error, type = 'text', ...props }, ref) => {
  const [showPwd, setShowPwd] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="relative">
      {Icon && (
        <Icon size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      )}
      <input
        ref={ref}  // ← AJOUT CRUCIAL
        type={isPassword ? (showPwd ? 'text' : 'password') : type}
        {...props}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${isPassword ? 'pr-10' : 'pr-4'}
                    py-3 text-sm border rounded-xl outline-none transition-all
                    bg-white text-gray-800 placeholder-gray-400
                    ${error
                      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                    }`}
      />
      {isPassword && (
        <button type="button" onClick={() => setShowPwd(v => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400
                     hover:text-gray-600 transition-colors">
          {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  )
})

Input.displayName = 'Input'

// ─── Étape 1 — Choix du rôle ───────────────────────────────────────
function StepRole({ onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Bienvenue sur Sahel Market
        </h2>
        <p className="text-gray-500 text-sm">
          Vous êtes sur la plateforme pour...
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Client */}
        <button onClick={() => onSelect('client')}
          className="group relative flex flex-col items-center gap-4 p-7
                     bg-white border-2 border-gray-200 rounded-3xl
                     hover:border-orange-400 hover:shadow-xl hover:shadow-orange-100/50
                     transition-all duration-200 text-left">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center
                          justify-center group-hover:bg-orange-100 transition-colors
                          border-2 border-orange-100 group-hover:border-orange-200">
            <ShoppingBag size={28} className="text-orange-500" />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900 text-lg mb-1">
              Acheteur
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Je veux découvrir et acheter des produits artisanaux authentiques
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {['Catalogue', 'Panier', 'Livraison', 'Suivi commande'].map(t => (
              <span key={t}
                className="text-[10px] font-semibold px-2 py-0.5 bg-orange-50
                           text-orange-600 rounded-full border border-orange-100">
                {t}
              </span>
            ))}
          </div>
          <ArrowRight size={18}
            className="absolute top-5 right-5 text-gray-300
                       group-hover:text-orange-400 group-hover:translate-x-1
                       transition-all" />
        </button>

        {/* Artisan */}
        <button onClick={() => onSelect('producer')}
          className="group relative flex flex-col items-center gap-4 p-7
                     bg-white border-2 border-gray-200 rounded-3xl
                     hover:border-green-500 hover:shadow-xl hover:shadow-green-100/50
                     transition-all duration-200 text-left">
          <div className="relative">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center
                            justify-center group-hover:bg-green-100 transition-colors
                            border-2 border-green-100 group-hover:border-green-200">
              <Store size={28} className="text-green-600" />
            </div>
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white
                            text-[9px] font-black px-2 py-0.5 rounded-full
                            border-2 border-white shadow">
              3 mois offerts
            </div>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900 text-lg mb-1">
              Artisan
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Je veux vendre mes créations et développer mon activité
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {['Boutique', 'Dashboard', 'Statistiques', 'Support agent'].map(t => (
              <span key={t}
                className="text-[10px] font-semibold px-2 py-0.5 bg-green-50
                           text-green-700 rounded-full border border-green-100">
                {t}
              </span>
            ))}
          </div>
          <ArrowRight size={18}
            className="absolute top-5 right-5 text-gray-300
                       group-hover:text-green-500 group-hover:translate-x-1
                       transition-all" />
        </button>
      </div>

      <p className="text-center text-sm text-gray-400">
        Déjà inscrit ?{' '}
        <Link to="/login" className="text-orange-500 font-semibold hover:underline">
          Se connecter
        </Link>
      </p>
    </motion.div>
  )
}

// ─── Formulaire client (CORRIGÉ) ───────────────────────────────────
function ClientForm({ onBack, onSuccess }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()  // ← CORRIGÉ (était useDispatch)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(clientSchema),
  })

  const onSubmit = async (data) => {
    try {
      const res = await authService.register({ ...data, role: 'client' })
      dispatch(setCredentials(res.data))
      toast.success('Compte créé ! Bienvenue 🎉')
      navigate('/')  // ← CORRIGÉ (était nav)
    } catch (err) {
      const errs = err.response?.data
      if (errs) Object.values(errs).flat().forEach(e => toast.error(e))
      else toast.error('Erreur lors de l\'inscription')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center
                     justify-center hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Créer mon compte
          </h2>
          <p className="text-xs text-gray-500">Acheteur — inscription rapide</p>
        </div>
        <div className="ml-auto w-10 h-10 bg-orange-50 rounded-xl flex items-center
                        justify-center border border-orange-100">
          <ShoppingBag size={20} className="text-orange-500" />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nom d'utilisateur" error={errors.username?.message}>
            <Input icon={User} placeholder="johndoe"
              error={errors.username} {...register('username')} />
          </Field>
          <Field label="Téléphone" error={errors.phone?.message}>
            <Input icon={Phone} placeholder="+237 6XX XXX XXX" type="tel"
              error={errors.phone} {...register('phone')} />
          </Field>
        </div>

        <Field label="Email" error={errors.email?.message}>
          <Input icon={Mail} placeholder="vous@exemple.com" type="email"
            error={errors.email} {...register('email')} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Mot de passe" error={errors.password?.message}
            hint="Minimum 8 caractères">
            <Input icon={Lock} placeholder="••••••••" type="password"
              error={errors.password} {...register('password')} />
          </Field>
          <Field label="Confirmer" error={errors.password2?.message}>
            <Input icon={Lock} placeholder="••••••••" type="password"
              error={errors.password2} {...register('password2')} />
          </Field>
        </div>

        <button type="submit" disabled={isSubmitting}
          className="btn-accent w-full"
          style={{ opacity: isSubmitting ? 0.6 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
          {isSubmitting
            ? <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent
                                rounded-full animate-spin" />
                Création en cours...
              </span>
            : <span className="flex items-center gap-2">
                Créer mon compte <ArrowRight size={16} />
              </span>
          }
        </button>
      </form>
    </motion.div>
  )
}

// ─── Écran succès artisan ─────────────────────────────────────────
function ProducerSuccess({ username }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      {/* Icône succès */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'linear-gradient(135deg, #16a34a, #22c55e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
      }}>
        <Check size={32} color="#fff" strokeWidth={3} />
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111827', marginBottom: 8 }}>
        Inscription réussie !
      </h2>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}>
        Bienvenue {username} ! Votre compte artisan a bien été créé.
      </p>

      {/* Alerte validation */}
      <div style={{
        background: '#fff7ed', border: '1px solid #fed7aa',
        borderRadius: 16, padding: '20px 20px', marginBottom: 24, textAlign: 'left',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: '#f97316',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: 18 }}>⏳</span>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>
              Validation en cours
            </p>
            <p style={{ fontSize: 13, color: '#b45309', lineHeight: 1.6 }}>
              Votre compte est actuellement en attente de validation par l'équipe Sahel Market.
              Ce processus prend généralement <strong>24 à 48 heures</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Étapes suivantes */}
      <div style={{ textAlign: 'left', marginBottom: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          Prochaines étapes
        </p>
        {[
          { icon: '📋', text: 'Notre équipe examine votre profil artisan' },
          { icon: '📱', text: 'Vous recevrez un SMS/email de confirmation' },
          { icon: '🚀', text: 'Votre boutique sera activée et visible' },
        ].map(({ icon, text }) => (
          <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
            <p style={{ fontSize: 13, color: '#374151' }}>{text}</p>
          </div>
        ))}
      </div>

      {/* Bouton dashboard */}
      <button
        onClick={() => navigate('/dashboard/producer')}
        className="btn-accent w-full"
        style={{ marginBottom: 12 }}
      >
        Accéder à mon espace artisan →
      </button>

      {/* Contact */}
      <p style={{ fontSize: 12, color: '#9ca3af' }}>
        Des questions ?{' '}
        <a href="tel:+237680757871"
          style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>
          +237 680 757 871
        </a>
      </p>
    </motion.div>
  )
}

// ─── Formulaire artisan — multi-étapes ────────────────────────────
function ProducerForm({ onBack }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [registered, setRegistered] = useState(false)
  const [registeredUsername, setRegisteredUsername] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [videoPreview, setVideoPreview]  = useState(null)
  const [videoFile, setVideoFile]        = useState(null)
  const [photoFile, setPhotoFile]        = useState(null)
  const videoRef = useRef(null)
  const photoRef = useRef(null)

  const { register, handleSubmit, trigger, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(producerSchema),
  })

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo trop lourde — max 5 Mo')
      return
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleVideo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Vidéo trop lourde — max 50 Mo')
      return
    }
    const url = URL.createObjectURL(file)
    const vid = document.createElement('video')
    vid.src = url
    vid.onloadedmetadata = () => {
      if (vid.duration > 31) {
        toast.error('Vidéo trop longue — maximum 30 secondes')
        return
      }
      setVideoFile(file)
      setVideoPreview(url)
    }
  }

  const nextStep = async () => {
    const fieldsStep1 = ['username', 'email', 'phone', 'address']
    const fieldsStep2 = ['speciality', 'password', 'password2']
    const ok = await trigger(step === 1 ? fieldsStep1 : fieldsStep2)
    if (ok) setStep(s => s + 1)
  }

  const onSubmit = async (data) => {
    try {
      const res = await authService.register({ ...data, role: 'producer' })
      dispatch(setCredentials(res.data))

      // Upload photo si présente
      if (photoFile) {
        const fd = new FormData()
        fd.append('avatar', photoFile)
        try { await api.patch('/auth/me/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }) }
        catch {}
      }

      // Upload profil artisan (vidéo, bio, spécialité)
      if (videoFile || data.bio || data.speciality || data.years_experience) {
        const fd = new FormData()
        if (videoFile) fd.append('workshop_video', videoFile)
        if (data.bio) fd.append('bio', data.bio)
        if (data.speciality) fd.append('speciality', data.speciality)
        if (data.years_experience) fd.append('years_experience', data.years_experience)
        try { await api.patch('/auth/producer-profile/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }) }
        catch {}
      }

      setRegisteredUsername(data.username)
      setRegistered(true)
    } catch (err) {
      const errs = err.response?.data
      if (errs) Object.values(errs).flat().forEach(e => toast.error(String(e)))
      else toast.error('Erreur lors de l\'inscription')
    }
  }

  const stepLabels = ['Identité', 'Boutique', 'Présentation']

  if (registered) return <ProducerSuccess username={registeredUsername} />

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={step === 1 ? onBack : () => setStep(s => s - 1)}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center
                     justify-center hover:bg-gray-50 transition-colors flex-shrink-0">
          <ArrowLeft size={16} className="text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 leading-none">
            Compte artisan
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Étape {step} sur {stepLabels.length} — {stepLabels[step - 1]}
          </p>
        </div>
        <div className="ml-auto w-10 h-10 bg-green-50 rounded-xl flex items-center
                        justify-center border border-green-100 flex-shrink-0">
          <Store size={20} className="text-green-600" />
        </div>
      </div>

      {/* Barre de progression */}
      <div className="flex gap-1.5 mb-7">
        {stepLabels.map((label, i) => (
          <div key={i} className="flex-1">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${
              i + 1 <= step ? 'bg-green-500' : 'bg-gray-200'
            }`} />
            <p className={`text-[10px] mt-1 font-semibold text-center transition-colors ${
              i + 1 === step ? 'text-green-600' : 'text-gray-400'
            }`}>{label}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* ── Étape 1 : Identité ──────────────────────────────── */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4">

              {/* Photo de profil */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl
                              border border-gray-100">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white
                                border-2 border-gray-200 flex-shrink-0 shadow-sm">
                  {photoPreview
                    ? <img src={photoPreview} alt="Photo"
                           className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <Camera size={24} className="text-gray-300" />
                      </div>
                  }
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Photo de profil
                    <span className="ml-1.5 text-xs font-normal text-gray-400">(facultatif)</span>
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    Format carré recommandé — JPG ou PNG — max 5 Mo
                  </p>
                  <button type="button"
                    onClick={() => photoRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-semibold
                               text-orange-500 hover:text-orange-600 transition-colors
                               border border-orange-200 hover:border-orange-300
                               bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg">
                    <Upload size={12} />
                    {photoPreview ? 'Changer la photo' : 'Ajouter une photo'}
                  </button>
                  <input ref={photoRef} type="file" accept="image/*"
                    className="hidden" onChange={handlePhoto} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nom d'utilisateur" error={errors.username?.message}>
                  <Input icon={User} placeholder="votre_nom"
                    error={errors.username} {...register('username')} />
                </Field>
                <Field label="Téléphone" error={errors.phone?.message}>
                  <Input icon={Phone} placeholder="+237 6XX XXX XXX" type="tel"
                    error={errors.phone} {...register('phone')} />
                </Field>
              </div>

              <Field label="Email" error={errors.email?.message}>
                <Input icon={Mail} placeholder="vous@exemple.com" type="email"
                  error={errors.email} {...register('email')} />
              </Field>

              <Field label="Adresse / Localisation" error={errors.address?.message}>
                <Input icon={MapPin} placeholder="Quartier, Ville"
                  error={errors.address} {...register('address')} />
              </Field>

              <button type="button" onClick={nextStep}
                className="btn-accent w-full">
                Étape suivante <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ── Étape 2 : Boutique ──────────────────────────────── */}
          {step === 2 && (
            <motion.div key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4">

              <Field label="Votre spécialité artisanale" error={errors.speciality?.message}
                hint="Ex: Maroquinerie, Poterie, Bijouterie, Tissage...">
                <Input icon={Store} placeholder="Maroquinerie traditionnelle"
                  error={errors.speciality} {...register('speciality')} />
              </Field>

              <Field label="Années d'expérience" error={errors.years_experience?.message}
                required={false}>
                <Input icon={FileText} placeholder="5" type="number"
                  error={errors.years_experience} {...register('years_experience')} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Mot de passe" error={errors.password?.message}
                  hint="Minimum 8 caractères">
                  <Input icon={Lock} placeholder="••••••••" type="password"
                    error={errors.password} {...register('password')} />
                </Field>
                <Field label="Confirmer" error={errors.password2?.message}>
                  <Input icon={Lock} placeholder="••••••••" type="password"
                    error={errors.password2} {...register('password2')} />
                </Field>
              </div>

              <button type="button" onClick={nextStep}
                className="btn-accent w-full">
                Étape suivante <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ── Étape 3 : Présentation (facultative) ────────────── */}
          {step === 3 && (
            <motion.div key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5">

              <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                <p className="text-sm font-semibold text-green-800 mb-0.5">
                  Étape facultative
                </p>
                <p className="text-xs text-green-600 leading-relaxed">
                  Enrichissez votre profil pour inspirer confiance aux acheteurs.
                  Vous pourrez compléter ces informations plus tard depuis votre tableau de bord.
                </p>
              </div>

              {/* Bio */}
              <Field label="Présentez-vous" required={false}
                hint="Parlez de votre parcours, votre passion, vos techniques...">
                <textarea
                  {...register('bio')}
                  rows={3}
                  placeholder="Je suis artisan maroquinier depuis 15 ans à Maroua. Je fabrique des sacs et ceintures en cuir tanné selon les techniques traditionnelles..."
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl
                             outline-none focus:border-orange-400 focus:ring-2
                             focus:ring-orange-100 resize-none placeholder-gray-400
                             transition-all"
                />
              </Field>

              {/* Vidéo atelier */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Vidéo de fabrication
                  <span className="ml-1.5 text-xs font-normal text-gray-400">(facultatif — 30 sec max)</span>
                </label>

                {!videoPreview ? (
                  <button type="button"
                    onClick={() => videoRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-3
                               py-8 border-2 border-dashed border-gray-200
                               hover:border-orange-300 hover:bg-orange-50/50
                               rounded-2xl transition-all group">
                    <div className="w-12 h-12 bg-gray-100 group-hover:bg-orange-100
                                    rounded-2xl flex items-center justify-center
                                    transition-colors">
                      <Video size={22} className="text-gray-400 group-hover:text-orange-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-600
                                    group-hover:text-orange-600 transition-colors">
                        Ajouter une vidéo
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        MP4, MOV — max 50 Mo — 30 secondes maximum
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-orange-500
                                     border border-orange-200 bg-white px-3 py-1 rounded-lg">
                      Choisir un fichier
                    </span>
                  </button>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border
                                  border-gray-200 bg-black">
                    <video src={videoPreview}
                      controls className="w-full max-h-48 object-contain" />
                    <button type="button"
                      onClick={() => { setVideoPreview(null); setVideoFile(null) }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60
                                 backdrop-blur-sm rounded-full flex items-center
                                 justify-center hover:bg-red-500 transition-colors">
                      <X size={13} className="text-white" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm
                                    text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Vidéo chargée ✓
                    </div>
                  </div>
                )}

                <input ref={videoRef} type="file"
                  accept="video/mp4,video/mov,video/quicktime,video/*"
                  className="hidden" onChange={handleVideo} />
              </div>

              {/* Bouton final */}
              <button type="submit" disabled={isSubmitting}
                className="btn-accent w-full"
                style={{ opacity: isSubmitting ? 0.6 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                {isSubmitting
                  ? <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent
                                      rounded-full animate-spin" />
                      Création en cours...
                    </span>
                  : <span className="flex items-center gap-2">
                      <Check size={16} /> Créer mon compte artisan
                    </span>
                }
              </button>

              <p className="text-center text-xs text-gray-400">
                En vous inscrivant, vous acceptez nos{' '}
                <Link to="/legal/terms" className="text-orange-500 hover:underline">
                  conditions d'utilisation
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  )
}

// ─── Page Register principale ──────────────────────────────────────
export default function Register() {
  const [role, setRole] = useState(null)

  return (
    <div className="min-h-screen flex">

      {/* Panneau gauche — visuel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: '#111111' }}>

        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8732A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #C8732A, transparent)' }} />

        <div className="relative z-10 flex flex-col justify-center px-14 py-12">
          <Link to="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center
                            justify-center shadow-lg shadow-orange-900/40">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="text-2xl font-black text-white">
              Sahel<span className="text-orange-500">Market</span>
            </span>
          </Link>

          <h1 className="text-4xl font-bold text-white leading-snug mb-4">
            Rejoignez la communauté<br />
            <span className="text-orange-400">des artisans du Sahel</span>
          </h1>

          <p className="text-white/60 text-base leading-relaxed mb-10 max-w-sm">
            "Un produit, une histoire, un artisan"
          </p>

          {/* Avantages */}
          <div className="space-y-4">
            {[
              { icon: '🎁', text: '3 mois d\'accompagnement offerts' },
              { icon: '🔒', text: 'Paiements sécurisés en FCFA'     },
              { icon: '📦', text: 'Livraison suivie partout au pays' },
              { icon: '📊', text: 'Tableau de bord en temps réel'   },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center
                                justify-center flex-shrink-0 text-base">
                  {icon}
                </div>
                <p className="text-white/70 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center
                      px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {!role && (
              <motion.div key="role">
                <StepRole onSelect={setRole} />
              </motion.div>
            )}
            {role === 'client' && (
              <motion.div key="client">
                <ClientForm onBack={() => setRole(null)} />
              </motion.div>
            )}
            {role === 'producer' && (
              <motion.div key="producer">
                <ProducerForm onBack={() => setRole(null)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}