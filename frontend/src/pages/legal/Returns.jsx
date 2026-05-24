import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Phone, Mail } from 'lucide-react'

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 10,
                   paddingBottom: 8, borderBottom: '2px solid #f97316', display: 'inline-block' }}>
        {title}
      </h2>
      <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  )
}

export default function Returns() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>

      <div style={{ background: '#1a1a1a', padding: '48px 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ color: '#f97316', fontSize: 11, fontWeight: 700,
                       textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Informations légales
          </p>
          <h1 style={{ color: '#ffffff', fontSize: 32, fontWeight: 900,
                       letterSpacing: '-0.02em', marginBottom: 8 }}>
            Politique de retour
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            Dernière mise à jour : mai 2025
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 60px' }}>

        {/* Badge délai */}
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12,
          padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 48, height: 48, background: '#16a34a', borderRadius: 12, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>7J</span>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: '#15803d', fontSize: 14 }}>Retour sous 7 jours</p>
            <p style={{ color: '#166534', fontSize: 13 }}>
              Vous disposez de 7 jours calendaires après réception pour nous signaler tout problème.
            </p>
          </div>
        </div>

        <Section title="1. Conditions de retour acceptées">
          <p style={{ marginBottom: 10 }}>Un retour est accepté dans les cas suivants :</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Le produit reçu est endommagé ou défectueux à la réception',
              'Le produit ne correspond pas à la description ou aux photos publiées',
              'Vous avez reçu le mauvais article (erreur de commande)',
              'Le produit présente un vice caché non visible sur les photos',
            ].map(item => (
              <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="2. Produits non retournables">
          <p style={{ marginBottom: 10 }}>Les retours ne sont pas acceptés pour :</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Produits personnalisés ou fabriqués sur mesure à votre demande',
              'Articles ayant été utilisés, lavés ou altérés après réception',
              'Produits consommables (produits de soin, alimentaires artisanaux)',
              'Retour demandé au-delà du délai de 7 jours',
              'Produits dont l\'emballage d\'origine a été détruit',
            ].map(item => (
              <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <XCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="3. Procédure de retour">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                n: '1', title: 'Contactez-nous',
                desc: 'Envoyez un e-mail à sahelmarket@gmail.com ou appelez le +237 680 757 871 avec votre numéro de commande et des photos du problème.',
              },
              {
                n: '2', title: 'Validation',
                desc: 'Notre équipe examine votre demande sous 24 à 48 heures et vous confirme si le retour est éligible.',
              },
              {
                n: '3', title: 'Renvoi du produit',
                desc: 'Emballez soigneusement l\'article et remettez-le à notre agent de collecte ou déposez-le au point de collecte indiqué. Les frais de retour sont pris en charge par Sahel Market si le retour est de notre fait.',
              },
              {
                n: '4', title: 'Remboursement ou échange',
                desc: 'Une fois le produit reçu et vérifié, vous êtes remboursé sous 5 à 7 jours ouvrés sur votre mobile money, ou un échange est organisé selon votre préférence.',
              },
            ].map(({ n, title, desc }) => (
              <div key={n} style={{ display: 'flex', gap: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: '#f97316',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: '#fff', fontWeight: 900, fontSize: 14,
                }}>
                  {n}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: '#111827', marginBottom: 4 }}>{title}</p>
                  <p style={{ color: '#6b7280' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="4. Remboursements">
          <p>
            Les remboursements sont effectués via le même canal de paiement utilisé lors de la
            commande : Orange Money ou MTN Mobile Money. Le délai est de <strong>5 à
            7 jours ouvrés</strong> après réception et vérification du retour.
          </p>
          <p style={{ marginTop: 8 }}>
            En cas de commande annulée avant expédition, le remboursement est traité sous <strong>48 heures</strong>.
          </p>
        </Section>

        {/* Contact */}
        <div style={{
          background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12,
          padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontWeight: 700, color: '#92400e', fontSize: 14, marginBottom: 4 }}>
              Besoin d'aide pour un retour ?
            </p>
            <p style={{ color: '#b45309', fontSize: 13 }}>
              Notre équipe vous répond sous 24h, du lundi au samedi.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="tel:+237680757871"
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                background: '#f97316', color: '#fff', borderRadius: 8, textDecoration: 'none',
                fontSize: 13, fontWeight: 700,
              }}>
              <Phone size={14} /> Appeler
            </a>
            <a href="mailto:sahelmarket@gmail.com"
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                border: '2px solid #f97316', color: '#f97316', borderRadius: 8,
                textDecoration: 'none', fontSize: 13, fontWeight: 700, background: '#fff',
              }}>
              <Mail size={14} /> E-mail
            </a>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24, marginTop: 32,
                       display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/legal/delivery" style={{ color: '#f97316', fontSize: 13, textDecoration: 'none' }}>
            Livraison & frais →
          </Link>
          <Link to="/legal/faq" style={{ color: '#f97316', fontSize: 13, textDecoration: 'none' }}>
            FAQ →
          </Link>
        </div>
      </div>
    </div>
  )
}
