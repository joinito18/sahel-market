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

export default function Privacy() {
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
            Politique de confidentialité
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            Dernière mise à jour : mai 2025 · Loi camerounaise n°2010/012
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 60px' }}>

        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12,
          padding: '16px 20px', marginBottom: 32, fontSize: 13, color: '#15803d', lineHeight: 1.6,
        }}>
          La protection de vos données personnelles est une priorité pour Sahel Market.
          Cette politique décrit comment nous collectons, utilisons et protégeons vos informations.
        </div>

        <Section title="1. Responsable du traitement">
          <p>
            Le responsable du traitement est <strong>Sahel Market</strong>, Maroua, Cameroun.<br />
            Contact : <a href="mailto:sahelmarket@gmail.com" style={{ color: '#f97316' }}>sahelmarket@gmail.com</a> · +237 680 757 871
          </p>
        </Section>

        <Section title="2. Données collectées">
          <p style={{ marginBottom: 8 }}>Nous collectons uniquement les données nécessaires au service :</p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li><strong>Identité</strong> : nom, prénom, nom d'utilisateur</li>
            <li><strong>Contact</strong> : adresse e-mail, numéro de téléphone</li>
            <li><strong>Localisation</strong> : ville, région (pour la livraison)</li>
            <li><strong>Commandes</strong> : historique d'achats, paniers, favoris</li>
            <li><strong>Données techniques</strong> : adresse IP, navigateur, pages consultées</li>
            <li><strong>Médias</strong> : photos de profil et de produits (artisans)</li>
          </ul>
        </Section>

        <Section title="3. Finalités du traitement">
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Gestion des comptes et authentification sécurisée</li>
            <li>Traitement et suivi des commandes</li>
            <li>Communications transactionnelles (confirmations, livraisons)</li>
            <li>Amélioration de la plateforme et statistiques anonymisées</li>
            <li>Prévention de la fraude et sécurité</li>
            <li>Newsletter (avec votre consentement explicite uniquement)</li>
          </ul>
        </Section>

        <Section title="4. Partage des données">
          <p>Vos données ne sont jamais vendues. Elles peuvent être transmises à :</p>
          <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li><strong>Opérateurs de paiement</strong> : Orange Money, MTN Mobile Money</li>
            <li><strong>Partenaires logistiques</strong> : pour l'organisation des livraisons</li>
            <li><strong>Autorités judiciaires</strong> : en cas d'obligation légale uniquement</li>
          </ul>
        </Section>

        <Section title="5. Conservation">
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Compte actif : pendant toute la durée d'utilisation</li>
            <li>Après suppression du compte : 3 ans (obligations légales)</li>
            <li>Données de navigation : 13 mois maximum</li>
          </ul>
        </Section>

        <Section title="6. Vos droits">
          <p style={{ marginBottom: 8 }}>Conformément à la législation camerounaise, vous disposez des droits :</p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li><strong>Accès</strong> : consulter vos données personnelles</li>
            <li><strong>Rectification</strong> : corriger des informations inexactes</li>
            <li><strong>Effacement</strong> : supprimer votre compte et vos données</li>
            <li><strong>Opposition</strong> : refuser l'utilisation à des fins marketing</li>
          </ul>
          <p style={{ marginTop: 10 }}>
            Pour exercer ces droits : <a href="mailto:sahelmarket@gmail.com" style={{ color: '#f97316' }}>sahelmarket@gmail.com</a>
          </p>
        </Section>

        <Section title="7. Sécurité technique">
          <p>
            La plateforme utilise : chiffrement HTTPS sur toutes les communications, hachage des
            mots de passe (bcrypt), tokens JWT à durée limitée, et accès restreint aux bases de
            données par rôles. Aucune donnée de paiement n'est stockée sur nos serveurs.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            Sahel Market utilise uniquement des cookies fonctionnels essentiels (session, panier,
            préférences de langue). Aucun cookie publicitaire ou de traçage tiers n'est utilisé.
          </p>
        </Section>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24, marginTop: 8,
                       display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/legal/terms" style={{ color: '#f97316', fontSize: 13, textDecoration: 'none' }}>
            Conditions d'utilisation →
          </Link>
          <Link to="/legal/faq" style={{ color: '#f97316', fontSize: 13, textDecoration: 'none' }}>
            FAQ →
          </Link>
        </div>
      </div>
    </div>
  )
}
