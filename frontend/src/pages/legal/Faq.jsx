import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    cat: 'Achats & commandes',
    color: '#2D6A4F',
    items: [
      {
        q: 'Comment passer une commande ?',
        a: 'Parcourez le catalogue, ajoutez les articles à votre panier, puis validez votre commande. Vous recevrez une confirmation par e-mail ou SMS. Un agent Sahel Market prendra contact avec vous pour organiser le paiement et la livraison.',
      },
      {
        q: 'Quels moyens de paiement sont acceptés ?',
        a: 'Nous acceptons Orange Money et MTN Mobile Money. Aucune carte bancaire internationale n\'est nécessaire. Le paiement se fait directement depuis votre téléphone mobile en FCFA.',
      },
      {
        q: 'Puis-je modifier ou annuler ma commande ?',
        a: 'Vous pouvez annuler une commande dans les 2 heures suivant sa validation, tant qu\'elle n\'a pas encore été préparée par l\'artisan. Contactez-nous par téléphone ou e-mail le plus rapidement possible.',
      },
      {
        q: 'Comment suivre ma commande ?',
        a: 'Depuis votre espace "Mes commandes", vous pouvez suivre le statut en temps réel : confirmée, en préparation, expédiée, livrée. Vous recevez également des notifications à chaque étape.',
      },
      {
        q: 'Les prix sont-ils négociables ?',
        a: 'Les prix affichés sont fixés par les artisans et reflètent le juste prix du travail artisanal. Sahel Market encourage le respect de ces prix pour garantir une rémunération équitable aux artisans.',
      },
    ],
  },
  {
    cat: 'Livraison',
    color: '#2563eb',
    items: [
      {
        q: 'Dans quelles villes livrez-vous ?',
        a: 'Nous livrons dans toutes les grandes villes du Cameroun : Maroua, Garoua, Ngaoundéré, Yaoundé, Douala, Bafoussam, Bertoua, Ebolowa et leurs environs. La couverture s\'étend progressivement.',
      },
      {
        q: 'Quels sont les délais de livraison ?',
        a: 'Maroua et Extrême-Nord : 24 à 48h. Villes du Grand Nord (Garoua, Ngaoundéré) : 2 à 3 jours. Yaoundé et Douala : 3 à 5 jours. Ces délais peuvent varier selon la disponibilité de l\'artisan.',
      },
      {
        q: 'Combien coûte la livraison ?',
        a: 'Les frais varient selon la distance : 500 à 1 000 FCFA en ville, 1 500 à 3 000 FCFA entre régions. La livraison est gratuite sur votre première commande avec le code SAHEL1.',
      },
    ],
  },
  {
    cat: 'Retours & remboursements',
    color: '#16a34a',
    items: [
      {
        q: 'Puis-je retourner un produit ?',
        a: 'Oui, sous 7 jours suivant la réception si le produit est défectueux, endommagé ou ne correspond pas à la description. Les produits personnalisés sur mesure ne sont pas remboursables.',
      },
      {
        q: 'Comment initier un retour ?',
        a: 'Contactez notre service client par e-mail (sahelmarket@gmail.com) ou téléphone avec votre numéro de commande et les photos du problème. Un agent vous guidera dans la procédure sous 24h.',
      },
      {
        q: 'Dans quel délai suis-je remboursé ?',
        a: 'Après validation du retour, le remboursement est effectué sous 5 à 7 jours ouvrés via le même moyen de paiement utilisé lors de la commande (Orange Money ou MTN Mobile Money).',
      },
    ],
  },
  {
    cat: 'Espace artisans',
    color: '#7c3aed',
    items: [
      {
        q: 'Comment devenir vendeur sur Sahel Market ?',
        a: 'Remplissez le formulaire d\'inscription en choisissant le profil "Artisan". Un agent Sahel Market vous contacte sous 48h pour valider votre profil, vous accompagner dans la mise en ligne de vos produits et vous expliquer le fonctionnement.',
      },
      {
        q: 'L\'inscription est-elle payante ?',
        a: 'L\'inscription est entièrement gratuite. Sahel Market prélève une commission uniquement sur les ventes réalisées. Aucun abonnement, aucun frais fixe.',
      },
      {
        q: 'Comment suis-je payé pour mes ventes ?',
        a: 'Le paiement est versé sur votre compte Orange Money ou MTN MoMo après confirmation de la livraison, généralement sous 3 à 5 jours ouvrés suivant la vente.',
      },
      {
        q: 'Combien de produits puis-je mettre en ligne ?',
        a: 'Il n\'y a aucune limite. Vous pouvez référencer autant de produits que vous le souhaitez. Nous vous encourageons à ajouter des photos de qualité et des descriptions détaillées pour maximiser vos ventes.',
      },
    ],
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      borderBottom: '1px solid #f3f4f6',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 0', background: 'transparent', border: 'none', cursor: 'pointer',
          textAlign: 'left', gap: 12,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', lineHeight: 1.4 }}>{q}</span>
        <ChevronDown size={16} color="#9ca3af" style={{
          flexShrink: 0, transition: 'transform .2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }} />
      </button>
      {open && (
        <div style={{ paddingBottom: 16, fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>
          {a}
        </div>
      )}
    </div>
  )
}

export default function Faq() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>

      <div style={{ background: '#1a1a1a', padding: '48px 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ color: '#2D6A4F', fontSize: 11, fontWeight: 700,
                       textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Aide & Support
          </p>
          <h1 style={{ color: '#ffffff', fontSize: 32, fontWeight: 900,
                       letterSpacing: '-0.02em', marginBottom: 8 }}>
            Questions fréquentes
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            Tout ce que vous devez savoir sur Sahel Market
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 60px' }}>

        {FAQS.map(({ cat, color, items }) => (
          <div key={cat} style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 4, height: 20, background: color, borderRadius: 2 }} />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{cat}</h2>
            </div>
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '0 20px' }}>
              {items.map(({ q, a }) => <FaqItem key={q} q={q} a={a} />)}
            </div>
          </div>
        ))}

        {/* Contact */}
        <div style={{
          background: '#eff8f3', border: '1px solid #add8bc', borderRadius: 12,
          padding: '24px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>
            Vous n'avez pas trouvé la réponse ?
          </p>
          <p style={{ fontSize: 13, color: '#b45309', marginBottom: 16 }}>
            Notre équipe est disponible du lundi au samedi, 8h – 18h (heure de Maroua)
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:+237680757871"
              style={{
                padding: '10px 20px', background: '#2D6A4F', color: '#fff', borderRadius: 10,
                textDecoration: 'none', fontSize: 13, fontWeight: 700,
              }}>
              +237 680 757 871
            </a>
            <a href="mailto:sahelmarket@gmail.com"
              style={{
                padding: '10px 20px', border: '2px solid #2D6A4F', color: '#2D6A4F',
                borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700,
                background: '#fff',
              }}>
              sahelmarket@gmail.com
            </a>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24, marginTop: 32,
                       display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/how-it-works" style={{ color: '#2D6A4F', fontSize: 13, textDecoration: 'none' }}>
            Comment ça marche →
          </Link>
          <Link to="/legal/terms" style={{ color: '#2D6A4F', fontSize: 13, textDecoration: 'none' }}>
            Conditions d'utilisation →
          </Link>
        </div>
      </div>
    </div>
  )
}
