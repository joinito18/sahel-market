import { Link } from 'react-router-dom'

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

export default function Terms() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>

      {/* Header */}
      <div style={{ background: '#1a1a1a', padding: '48px 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ color: '#f97316', fontSize: 11, fontWeight: 700,
                       textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Informations légales
          </p>
          <h1 style={{ color: '#ffffff', fontSize: 32, fontWeight: 900,
                       letterSpacing: '-0.02em', marginBottom: 8 }}>
            Conditions d'utilisation
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            Dernière mise à jour : mai 2025 · Applicable au Cameroun
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 60px' }}>

        {/* Intro */}
        <div style={{
          background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12,
          padding: '16px 20px', marginBottom: 32, fontSize: 13, color: '#92400e', lineHeight: 1.6,
        }}>
          En accédant à la plateforme Sahel Market (accessible via <strong>sahelmarket.cm</strong>),
          vous acceptez sans réserve les présentes conditions d'utilisation. Veuillez les lire
          attentivement avant toute utilisation du service.
        </div>

        <Section title="1. Présentation du service">
          <p>
            Sahel Market est une place de marché en ligne dédiée à l'artisanat camerounais. La
            plateforme met en relation des artisans producteurs et des acheteurs particuliers ou
            professionnels sur l'ensemble du territoire camerounais.
          </p>
          <p style={{ marginTop: 8 }}>
            Le service est édité par Sahel Market, basé à Maroua (Région de l'Extrême-Nord,
            Cameroun). Contact : <a href="mailto:sahelmarket@gmail.com" style={{ color: '#f97316' }}>sahelmarket@gmail.com</a> · +237 680 757 871.
          </p>
        </Section>

        <Section title="2. Inscription et compte utilisateur">
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>L'inscription est gratuite et ouverte à toute personne physique âgée de 18 ans ou plus.</li>
            <li>Vous vous engagez à fournir des informations exactes, complètes et à jour.</li>
            <li>Votre mot de passe est confidentiel. Sahel Market ne vous demandera jamais votre mot de passe.</li>
            <li>Tout compte peut être suspendu en cas de violation des présentes conditions.</li>
          </ul>
        </Section>

        <Section title="3. Obligations des artisans vendeurs">
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Les produits mis en vente doivent être fabriqués ou transformés localement au Cameroun.</li>
            <li>Les descriptions, photos et prix doivent être exacts et à jour.</li>
            <li>L'artisan s'engage à honorer toute commande validée dans les délais annoncés.</li>
            <li>La vente de produits contrefaits, illicites ou dangereux est strictement interdite.</li>
            <li>Sahel Market prélève une commission sur chaque vente réalisée (taux communiqué lors de l'inscription).</li>
          </ul>
        </Section>

        <Section title="4. Obligations des acheteurs">
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>L'acheteur s'engage à payer le prix affiché au moment de la commande.</li>
            <li>Toute commande passée constitue un engagement d'achat ferme.</li>
            <li>L'acheteur accepte les conditions de livraison et de retour décrites sur la plateforme.</li>
            <li>L'utilisation du service à des fins frauduleuses est prohibée et passible de poursuites.</li>
          </ul>
        </Section>

        <Section title="5. Paiements">
          <p>
            Les paiements sont traités via les opérateurs mobiles locaux : <strong>Orange Money</strong>{' '}
            et <strong>MTN Mobile Money</strong>. Sahel Market ne stocke aucune donnée bancaire
            ou financière. Le paiement est sécurisé par les opérateurs partenaires.
          </p>
          <p style={{ marginTop: 8 }}>
            En cas d'échec de paiement, la commande est automatiquement annulée. Le remboursement
            en cas de litige est traité conformément à notre politique de retour.
          </p>
        </Section>

        <Section title="6. Propriété intellectuelle">
          <p>
            Tous les contenus de la plateforme (logo, design, textes, code) sont la propriété
            exclusive de Sahel Market et protégés par le droit camerounais de la propriété
            intellectuelle. Les photos de produits restent la propriété de l'artisan qui les a
            téléversées.
          </p>
        </Section>

        <Section title="7. Limitation de responsabilité">
          <p>
            Sahel Market agit en qualité d'intermédiaire technique. La responsabilité de la qualité
            des produits incombe aux artisans vendeurs. Sahel Market ne peut être tenu responsable
            des dommages indirects résultant de l'utilisation de la plateforme.
          </p>
        </Section>

        <Section title="8. Droit applicable">
          <p>
            Les présentes conditions sont régies par le droit camerounais. Tout litige sera soumis
            à la juridiction compétente de Maroua, Cameroun, sauf accord amiable préalable.
          </p>
        </Section>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24, marginTop: 8,
                       display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/legal/privacy" style={{ color: '#f97316', fontSize: 13, textDecoration: 'none' }}>
            Politique de confidentialité →
          </Link>
          <Link to="/legal/returns" style={{ color: '#f97316', fontSize: 13, textDecoration: 'none' }}>
            Politique de retour →
          </Link>
          <Link to="/legal/faq" style={{ color: '#f97316', fontSize: 13, textDecoration: 'none' }}>
            FAQ →
          </Link>
        </div>
      </div>
    </div>
  )
}
