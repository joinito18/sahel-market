import { Link } from 'react-router-dom'
import { MapPin, Clock, Truck, Phone } from 'lucide-react'

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 10,
                   paddingBottom: 8, borderBottom: '2px solid #2D6A4F', display: 'inline-block' }}>
        {title}
      </h2>
      <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  )
}

const ZONES = [
  {
    zone: 'Zone 1 — Maroua & Extrême-Nord',
    villes: 'Maroua, Mora, Kousséri, Yagoua, Mokolo',
    delai: '24 – 48 h',
    frais: '500 – 1 000 FCFA',
    color: '#16a34a',
  },
  {
    zone: 'Zone 2 — Grand Nord',
    villes: 'Garoua, Ngaoundéré, Ngaoundal, Meïganga',
    delai: '2 – 3 jours',
    frais: '1 500 – 2 000 FCFA',
    color: '#2563eb',
  },
  {
    zone: 'Zone 3 — Centre & Littoral',
    villes: 'Yaoundé, Douala, Obala, Edéa',
    delai: '3 – 5 jours',
    frais: '2 500 – 3 500 FCFA',
    color: '#2D6A4F',
  },
  {
    zone: 'Zone 4 — Autres régions',
    villes: 'Bafoussam, Bamenda, Bertoua, Ebolowa et environs',
    delai: '4 – 6 jours',
    frais: '3 000 – 4 500 FCFA',
    color: '#7c3aed',
  },
]

export default function Delivery() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>

      <div style={{ background: '#1a1a1a', padding: '48px 0' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ color: '#2D6A4F', fontSize: 11, fontWeight: 700,
                       textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Informations pratiques
          </p>
          <h1 style={{ color: '#ffffff', fontSize: 32, fontWeight: 900,
                       letterSpacing: '-0.02em', marginBottom: 8 }}>
            Livraison & frais
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            Dernière mise à jour : mai 2025
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 60px' }}>

        {/* Offre 1ère commande */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f, #1a2a3a)', borderRadius: 12,
          padding: '20px 24px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 48, height: 48, background: '#3b82f6', borderRadius: 12, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Truck size={22} color="#fff" />
          </div>
          <div>
            <p style={{ color: '#93c5fd', fontSize: 11, fontWeight: 700,
                         textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              Offre découverte
            </p>
            <p style={{ color: '#ffffff', fontWeight: 800, fontSize: 15 }}>
              Livraison gratuite sur votre 1ère commande
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>
              Utilisez le code <span style={{ color: '#2D6A4F', fontWeight: 700 }}>SAHEL1</span> — valable pour les nouveaux clients
            </p>
          </div>
        </div>

        <Section title="1. Zones et tarifs de livraison">
          <p style={{ marginBottom: 16 }}>
            Sahel Market livre dans toutes les régions du Cameroun. Les tarifs varient selon la distance.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ZONES.map(({ zone, villes, delai, frais, color }) => (
              <div key={zone} style={{
                background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb',
                overflow: 'hidden', display: 'flex',
              }}>
                <div style={{ width: 5, background: color, flexShrink: 0 }} />
                <div style={{ padding: '14px 18px', flex: 1,
                               display: 'grid', gridTemplateColumns: '1fr auto auto',
                               gap: '4px 20px', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 700, color: '#111827', fontSize: 13 }}>{zone}</p>
                    <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>{villes}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase',
                                 letterSpacing: '0.05em', marginBottom: 2 }}>Délai</p>
                    <p style={{ fontWeight: 700, color: '#111827', fontSize: 13 }}>{delai}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase',
                                 letterSpacing: '0.05em', marginBottom: 2 }}>Frais</p>
                    <p style={{ fontWeight: 700, color: color, fontSize: 13 }}>{frais}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: '#9ca3af' }}>
            * Les frais exacts sont calculés à la validation de la commande selon le poids et le lieu de livraison précis.
          </p>
        </Section>

        <Section title="2. Modes de livraison">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              {
                icon: Truck, color: '#2563eb',
                title: 'Livraison à domicile',
                desc: 'Un livreur Sahel Market ou un transporteur partenaire apporte votre commande directement à l\'adresse indiquée. Disponible dans toutes les zones.',
              },
              {
                icon: MapPin, color: '#16a34a',
                title: 'Point de retrait',
                desc: 'Récupérez votre commande à un point de retrait partenaire près de chez vous (boutiques alliées, agences). Option souvent moins chère et plus rapide.',
              },
              {
                icon: Clock, color: '#2D6A4F',
                title: 'Livraison express (Maroua)',
                desc: 'Livraison le jour même en moins de 4h pour les commandes passées avant 12h à Maroua. Supplément de 500 FCFA.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: color, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color="#fff" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: '#111827', marginBottom: 4 }}>{title}</p>
                  <p style={{ color: '#6b7280' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="3. Suivi de commande">
          <p>
            Dès l'expédition de votre commande, vous recevez un SMS ou e-mail de confirmation.
            Vous pouvez suivre votre livraison en temps réel depuis votre espace <strong>"Mes commandes"</strong>
            sur la plateforme. Chaque étape (confirmée, préparée, expédiée, livrée) est notifiée automatiquement.
          </p>
        </Section>

        <Section title="4. Cas particuliers">
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>En cas d'absence lors de la livraison, un second passage est organisé sans frais supplémentaires.</li>
            <li>Pour les zones reculées, un point de retrait alternatif peut vous être proposé.</li>
            <li>Les commandes volumineuses (artisanat encombrant) font l'objet d'un devis de transport personnalisé.</li>
            <li>La livraison à l'international n'est pas encore disponible — elle est en cours de développement.</li>
          </ul>
        </Section>

        {/* Contact */}
        <div style={{
          background: '#eff8f3', border: '1px solid #add8bc', borderRadius: 12,
          padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontWeight: 700, color: '#92400e', fontSize: 14, marginBottom: 4 }}>
              Une question sur la livraison ?
            </p>
            <p style={{ color: '#b45309', fontSize: 13 }}>Nous vous répondons sous 24h.</p>
          </div>
          <a href="tel:+237680757871"
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px',
              background: '#2D6A4F', color: '#fff', borderRadius: 10, textDecoration: 'none',
              fontSize: 13, fontWeight: 700,
            }}>
            <Phone size={14} /> +237 680 757 871
          </a>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24, marginTop: 32,
                       display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/legal/returns" style={{ color: '#2D6A4F', fontSize: 13, textDecoration: 'none' }}>
            Politique de retour →
          </Link>
          <Link to="/legal/faq" style={{ color: '#2D6A4F', fontSize: 13, textDecoration: 'none' }}>
            FAQ →
          </Link>
        </div>
      </div>
    </div>
  )
}
