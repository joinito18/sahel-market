import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import {
  X, CheckCircle2, Package, BarChart2, MessageCircle,
  Camera, Star, ArrowRight, Sparkles,
} from 'lucide-react'
import api from '../services/api.js'

const OR = '#2D6A4F'

const STEPS = [
  {
    id: 'welcome',
    title: 'Bienvenue sur Sahel Market !',
    sub: 'Votre espace artisan est prêt. Laissez-nous vous faire une visite guidée en 3 minutes.',
    icon: Sparkles,
    iconColor: OR,
    iconBg: 'rgba(249,115,22,0.12)',
    content: null,
  },
  {
    id: 'profile',
    title: 'Soignez votre profil',
    sub: 'Un profil complet génère 3× plus de ventes. Ajoutez votre bio et spécialité.',
    icon: Camera,
    iconColor: '#3b82f6',
    iconBg: 'rgba(59,130,246,0.12)',
    content: 'profile',
  },
  {
    id: 'product',
    title: 'Votre premier produit',
    sub: 'Publiez votre premier article pour commencer à vendre. Photos, prix, description — c\'est tout.',
    icon: Package,
    iconColor: '#22c55e',
    iconBg: 'rgba(34,197,94,0.12)',
    content: 'product',
  },
  {
    id: 'features',
    title: 'Tout ce que vous pouvez faire',
    sub: 'Découvrez les outils à votre disposition.',
    icon: BarChart2,
    iconColor: '#8b5cf6',
    iconBg: 'rgba(139,92,246,0.12)',
    content: 'features',
  },
  {
    id: 'done',
    title: 'Vous êtes prêt !',
    sub: 'Votre boutique est active. Commencez à vendre dès maintenant.',
    icon: CheckCircle2,
    iconColor: '#22c55e',
    iconBg: 'rgba(34,197,94,0.12)',
    content: null,
  },
]

function ProfileStep({ onNext }) {
  const qc = useQueryClient()
  const [bio, setBio] = useState('')
  const [speciality, setSpeciality] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      if (bio)        fd.append('bio', bio)
      if (speciality) fd.append('speciality', speciality)
      return api.patch('/auth/producer-profile/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['producer-profile'] }); onNext() },
    onError: onNext,
  })

  const inp = {
    width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
    borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff',
    fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', color: '#111827',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
          Votre spécialité
        </label>
        <input style={inp} value={speciality} onChange={e => setSpeciality(e.target.value)}
          placeholder="Ex : Vannerie, Broderie, Bijoux en bronze…" />
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
          Votre bio (optionnel)
        </label>
        <textarea style={{ ...inp, resize: 'vertical', minHeight: 80 }}
          value={bio} onChange={e => setBio(e.target.value)}
          placeholder="Parlez de vous, votre atelier, votre région…" />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button onClick={onNext} style={{
          flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid #d1d5db',
          background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: 13, cursor: 'pointer',
        }}>
          Passer cette étape
        </button>
        <button onClick={() => mutate()} disabled={isPending} style={{
          flex: 2, padding: '11px 0', borderRadius: 10, border: 'none',
          background: OR, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        }}>
          {isPending ? 'Enregistrement…' : 'Sauvegarder →'}
        </button>
      </div>
    </div>
  )
}

function ProductStep({ onNext }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ name: '', price: '', stock: '', description: '' })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      images.forEach(img => fd.append('images', img))
      return api.post('/products/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dashboard', 'producer'] }); onNext() },
    onError: onNext,
  })

  const handleFiles = (files) => {
    const arr = Array.from(files)
    setImages(prev => [...prev, ...arr])
    arr.forEach(f => {
      const r = new FileReader()
      r.onload = e => setPreviews(p => [...p, e.target.result])
      r.readAsDataURL(f)
    })
  }

  const inp = {
    width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
    borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff',
    fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', color: '#111827',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <input style={inp} placeholder="Nom du produit *" value={form.name}
        onChange={e => set('name', e.target.value)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <input style={inp} type="number" placeholder="Prix (FCFA) *" value={form.price}
          onChange={e => set('price', e.target.value)} />
        <input style={inp} type="number" placeholder="Stock *" value={form.stock}
          onChange={e => set('stock', e.target.value)} />
      </div>
      <textarea style={{ ...inp, resize: 'vertical', minHeight: 64 }}
        placeholder="Description (optionnel)" value={form.description}
        onChange={e => set('description', e.target.value)} />

      {/* Upload photo */}
      <div
        onClick={() => document.getElementById('ob-file').click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        style={{
          border: '2px dashed #d1d5db', borderRadius: 10, padding: '14px',
          textAlign: 'center', cursor: 'pointer', background: '#f9fafb',
        }}
      >
        <Camera size={20} color="#9ca3af" style={{ margin: '0 auto 6px' }} />
        <p style={{ fontSize: 12, color: '#6b7280' }}>Cliquez pour ajouter une photo</p>
        <input id="ob-file" type="file" accept="image/*" multiple style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)} />
      </div>
      {previews.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {previews.map((src, i) => (
            <img key={i} src={src} alt=""
              style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button onClick={onNext} style={{
          flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid #d1d5db',
          background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: 13, cursor: 'pointer',
        }}>
          Plus tard
        </button>
        <button
          onClick={() => mutate()}
          disabled={isPending || !form.name || !form.price || !form.stock}
          style={{
            flex: 2, padding: '11px 0', borderRadius: 10, border: 'none',
            background: (!form.name || !form.price || !form.stock) ? '#d1d5db' : '#22c55e',
            color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}
        >
          {isPending ? 'Publication…' : 'Publier ce produit →'}
        </button>
      </div>
    </div>
  )
}

function FeaturesStep() {
  const FEATURES = [
    { icon: Package,      color: OR,         label: 'Gestion produits',    desc: 'Ajoutez, modifiez, activez/désactivez vos créations' },
    { icon: BarChart2,    color: '#3b82f6',  label: 'Statistiques',        desc: 'Vues, ventes et revenus hebdomadaires en temps réel' },
    { icon: MessageCircle,color: '#22c55e',  label: 'Messagerie',          desc: 'Discutez directement avec vos acheteurs' },
    { icon: Star,         color: '#f59e0b',  label: 'Avis clients',        desc: 'Vos clients laissent des avis vérifiés sur vos produits' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {FEATURES.map(({ icon: Icon, color, label, desc }) => (
        <div key={label} style={{
          background: `${color}0d`, border: `1px solid ${color}22`,
          borderRadius: 12, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${color}18`, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={15} color={color} />
          </div>
          <p style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{label}</p>
          <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>{desc}</p>
        </div>
      ))}
    </div>
  )
}

export default function ProducerOnboarding({ onClose }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast  = step === STEPS.length - 1

  const next = () => {
    if (isLast) { onClose(); return }
    setStep(s => s + 1)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1100, padding: 16,
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        style={{
          background: '#fff', borderRadius: 24, width: '100%', maxWidth: 480,
          maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        }}
      >
        {/* Barre de progression */}
        <div style={{ height: 4, background: '#f3f4f6', borderRadius: '24px 24px 0 0', overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.35 }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${OR}, #fbbf24)` }}
          />
        </div>

        <div style={{ padding: '28px 32px 32px' }}>
          {/* Fermer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button onClick={onClose} style={{
              background: '#f3f4f6', border: 'none', borderRadius: 8,
              width: 32, height: 32, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
            }}>
              <X size={16} color="#6b7280" />
            </button>
          </div>

          {/* Icône + titre */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: current.iconBg, display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <current.icon size={26} color={current.iconColor} />
              </div>

              <h2 style={{ fontWeight: 800, fontSize: 20, color: '#111827', marginBottom: 8, lineHeight: 1.2 }}>
                {current.title}
              </h2>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 24 }}>
                {current.sub}
              </p>

              {/* Contenu spécifique à l'étape */}
              {current.content === 'profile'  && <ProfileStep onNext={next} />}
              {current.content === 'product'  && <ProductStep onNext={next} />}
              {current.content === 'features' && <FeaturesStep />}

              {/* Bouton principal (étapes sans contenu interactif) */}
              {!current.content && (
                <button onClick={next} style={{
                  width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                  background: isLast ? '#22c55e' : OR, color: '#fff',
                  fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {isLast ? 'Accéder à mon tableau de bord' : 'Commencer la visite'}
                  <ArrowRight size={16} />
                </button>
              )}

              {current.content === 'features' && (
                <button onClick={next} style={{
                  width: '100%', marginTop: 20, padding: '13px 0', borderRadius: 12, border: 'none',
                  background: OR, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  Terminer la visite <ArrowRight size={15} />
                </button>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Indicateurs d'étapes */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 28 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                height: 6, borderRadius: 999, transition: 'all .25s',
                width: i === step ? 20 : 6,
                background: i <= step ? OR : '#e5e7eb',
              }} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
