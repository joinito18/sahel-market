import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  CheckCircle2, Circle, Clock, Zap, Globe, Smartphone,
  ShieldCheck, BarChart2, MessageCircle, MapPin, Star,
  Bell, Package, Users, Truck, ArrowRight, Rocket, Lock,
} from 'lucide-react'

const OR = '#f97316'

const PHASES = [
  {
    id: 1,
    status: 'done',
    label: 'Phase 1',
    title: 'Fondations',
    period: 'Q4 2025',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.2)',
    items: [
      { icon: Package,    text: 'Catalogue produits + catégories' },
      { icon: Users,      text: 'Profils artisans & acheteurs' },
      { icon: ShoppingCart, text: 'Panier & processus de commande' },
      { icon: BarChart2,  text: 'Tableaux de bord Admin / Agent / Artisan' },
      { icon: ShieldCheck,text: 'Authentification JWT sécurisée' },
      { icon: Truck,      text: 'Suivi des livraisons' },
    ],
  },
  {
    id: 2,
    status: 'done',
    label: 'Phase 2',
    title: 'Expérience client',
    period: 'Q1 2026',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.2)',
    items: [
      { icon: Star,         text: 'Avis vérifiés "Achat vérifié"' },
      { icon: MessageCircle,text: 'Messagerie acheteur ↔ artisan' },
      { icon: Bell,         text: 'Notifications commandes temps réel' },
      { icon: MapPin,       text: 'Filtres région & prix' },
      { icon: Zap,          text: 'Programme de fidélité (points → réductions)' },
      { icon: Smartphone,   text: 'PWA — application mobile installable' },
    ],
  },
  {
    id: 3,
    status: 'active',
    label: 'Phase 3',
    title: 'Croissance',
    period: 'Q2 2026',
    color: OR,
    bg: 'rgba(249,115,22,0.08)',
    border: 'rgba(249,115,22,0.25)',
    items: [
      { icon: Users,      text: 'Onboarding guidé artisan (wizard interactif)', done: true },
      { icon: Package,    text: 'Gestion stocks avancée + alertes rupture' },
      { icon: Globe,      text: 'Traduction Fulfulde / Haoussa / Anglais' },
      { icon: Truck,      text: 'Intégration API livraison (GPS tracking)' },
      { icon: BarChart2,  text: 'Analytics avancées & rapports exportables' },
      { icon: ShieldCheck,text: 'Paiement Orange Money & MTN MoMo en direct' },
    ],
  },
  {
    id: 4,
    status: 'planned',
    label: 'Phase 4',
    title: 'Scale Cameroun',
    period: 'Q3–Q4 2026',
    color: '#818cf8',
    bg: 'rgba(129,140,248,0.08)',
    border: 'rgba(129,140,248,0.2)',
    items: [
      { icon: Smartphone,   text: 'Application mobile native (React Native)' },
      { icon: Users,        text: 'Programme ambassadeurs & affiliés' },
      { icon: Globe,        text: 'Place de marché B2B (grossistes & exportateurs)' },
      { icon: BarChart2,    text: 'Tableau de bord investisseur en temps réel' },
      { icon: Star,         text: 'Certifications artisanales officielles' },
      { icon: Truck,        text: 'Partenariat logistique national (J+1 en ville)' },
    ],
  },
  {
    id: 5,
    status: 'vision',
    label: 'Phase 5',
    title: 'Vision Sahel',
    period: '2027 →',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.06)',
    border: 'rgba(167,139,250,0.15)',
    items: [
      { icon: Globe,      text: 'Extension régionale — Niger, Mali, Sénégal' },
      { icon: Lock,       text: 'Blockchain — certificats d\'authenticité NFT' },
      { icon: Rocket,     text: 'IA — recommandations & pricing dynamique' },
      { icon: Globe,      text: 'Export diaspora africaine (Europe, USA)' },
      { icon: BarChart2,  text: 'Cotation boursière à l\'horizon 2030' },
    ],
  },
]

const STATUS_META = {
  done:    { label: 'Terminé',       dot: '#22c55e' },
  active:  { label: 'En cours',      dot: OR },
  planned: { label: 'Planifié',      dot: '#818cf8' },
  vision:  { label: 'Vision',        dot: '#a78bfa' },
}

function ShoppingCart(props) {
  return <Package {...props} />
}

function PhaseCard({ phase, index }) {
  const meta = STATUS_META[phase.status]
  const isDone    = phase.status === 'done'
  const isActive  = phase.status === 'active'
  const isLocked  = phase.status === 'vision'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      style={{
        background: phase.bg, border: `1px solid ${phase.border}`,
        borderRadius: 20, padding: '24px 28px',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Accent line gauche */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 4, background: phase.color, borderRadius: '20px 0 0 20px',
      }} />

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: phase.color,
              background: `${phase.color}18`, borderRadius: 20,
              padding: '3px 10px', border: `1px solid ${phase.color}30`,
            }}>
              {phase.label}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              {phase.period}
            </span>
          </div>
          <h3 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 18, color: '#fff', margin: 0 }}>
            {phase.title}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.dot,
                         boxShadow: isActive ? `0 0 10px ${meta.dot}` : 'none' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: meta.dot }}>
            {meta.label}
          </span>
        </div>
      </div>

      {/* Items */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {phase.items.map(({ icon: Icon, text, done }, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: (isDone || done) ? 'rgba(34,197,94,0.15)' : `${phase.color}12`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {(isDone || done)
                ? <CheckCircle2 size={14} color="#22c55e" />
                : isLocked
                  ? <Lock size={12} color={phase.color} style={{ opacity: 0.6 }} />
                  : <Icon size={13} color={phase.color} />
              }
            </div>
            <span style={{
              fontSize: 13, lineHeight: 1.5,
              color: isLocked ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.8)',
              fontStyle: isLocked ? 'italic' : 'normal',
            }}>
              {text}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

export default function Roadmap() {
  const doneCount  = PHASES.filter(p => p.status === 'done').length
  const totalPhases = PHASES.length
  const pct = Math.round((doneCount / totalPhases) * 100)

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #0d1117 0%, #111a2e 60%, #0d1117 100%)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 40 }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-16 pb-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                 style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)' }}>
              <Rocket size={12} color={OR} />
              <span style={{ fontSize: 11, fontWeight: 700, color: OR,
                              textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Feuille de route publique
              </span>
            </div>

            <h1 style={{ fontWeight: 900, fontSize: 'clamp(28px,5vw,52px)', color: '#fff',
                          letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
              Notre vision pour<br />
              <span style={{ color: OR }}>l'artisanat numérique</span>
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 560, lineHeight: 1.7, marginBottom: 32 }}>
              Sahel Market construit la première infrastructure e-commerce dédiée
              aux artisans du Sahel, phase par phase, avec transparence totale.
            </p>

            {/* Barre progression globale */}
            <div style={{ maxWidth: 480 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                  Progression globale
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: OR }}>{pct}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  style={{ height: '100%', background: `linear-gradient(90deg, ${OR}, #fbbf24)`, borderRadius: 999 }}
                />
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>
                {doneCount} phase{doneCount > 1 ? 's' : ''} terminée{doneCount > 1 ? 's' : ''} sur {totalPhases}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Métriques clés */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[
              { v: '2025',  l: 'Fondée',          sub: 'au Cameroun' },
              { v: '5',     l: 'Phases produit',   sub: 'planifiées' },
              { v: '10+',   l: 'Régions visées',   sub: 'Sahel & Afrique' },
              { v: '2027',  l: 'Expansion',        sub: 'régionale Sahel' },
            ].map(({ v, l, sub }) => (
              <div key={l} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14, padding: '16px 20px', textAlign: 'center',
              }}>
                <p style={{ fontWeight: 900, fontSize: 26, color: '#fff',
                              letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {v}
                </p>
                <p style={{ fontWeight: 700, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{l}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Timeline phases ─────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">

        {/* Légende */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          {Object.entries(STATUS_META).map(([key, { label, dot }]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {PHASES.map((phase, i) => (
            <PhaseCard key={phase.id} phase={phase} index={i} />
          ))}
        </div>
      </div>

      {/* ── CTA investisseurs ───────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pb-20">
        <div style={{
          background: 'linear-gradient(135deg, #1a2a1a 0%, #1a1a2e 100%)',
          border: '1px solid rgba(249,115,22,0.2)',
          borderRadius: 24, padding: '48px 40px', textAlign: 'center',
        }}>
          <Rocket size={36} color={OR} style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontWeight: 900, fontSize: 24, color: '#fff',
                        letterSpacing: '-0.02em', marginBottom: 12 }}>
            Vous croyez en notre vision ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7,
                       maxWidth: 480, margin: '0 auto 32px' }}>
            Sahel Market cherche des partenaires et investisseurs pour accélérer
            le développement de la Phase 3 et au-delà. Prenons contact.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
            <a href="mailto:sahelmarket@gmail.com"
               style={{
                 display: 'inline-flex', alignItems: 'center', gap: 8,
                 padding: '14px 28px', borderRadius: 12,
                 background: OR, color: '#fff', fontWeight: 700,
                 fontSize: 14, textDecoration: 'none',
               }}>
              Contacter l'équipe <ArrowRight size={15} />
            </a>
            <Link to="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 12,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.7)', fontWeight: 600,
                fontSize: 14, textDecoration: 'none',
              }}>
              Découvrir la plateforme
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
