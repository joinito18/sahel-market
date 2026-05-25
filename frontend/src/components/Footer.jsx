import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter, ArrowRight } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="md:block" style={{ background: '#1a1a1a', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Newsletter ─────────────────────────────────────────── */}
      <div style={{ background: '#232f3e', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <p style={{ color: '#f97316', fontSize: 11, fontWeight: 700,
                           textTransform: 'uppercase', letterSpacing: '0.1em' }}
                 className="mb-1">
                Newsletter
              </p>
              <p style={{ color: '#ffffff', fontWeight: 700, fontSize: 15 }}>
                Nouvelles collections & offres exclusives
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                Recevez les créations de nos artisans directement dans votre boîte mail.
              </p>
            </div>
            <form onSubmit={e => e.preventDefault()}
                  className="flex gap-2 w-full sm:w-auto flex-shrink-0">
              <input type="email" placeholder="votre@email.com"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', fontSize: 13, padding: '10px 16px',
                  borderRadius: 8, outline: 'none', width: 240,
                  fontFamily: 'Inter, sans-serif',
                }}
                className="flex-1 sm:flex-none" />
              <button type="submit"
                style={{
                  background: '#f97316', color: '#fff', fontWeight: 700,
                  fontSize: 13, padding: '10px 20px', borderRadius: 8,
                  border: 'none', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                }}>
                S'abonner <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Corps principal ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Logo + description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 mb-5">
              <div style={{
                width: 42, height: 42, background: '#f97316', borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>S</span>
              </div>
              <div>
                <p style={{ color: '#fff', fontWeight: 900, fontSize: 18, lineHeight: 1 }}>
                  Sahel<span style={{ color: '#f97316' }}>Market</span>
                </p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10,
                             textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 3 }}>
                  🇨🇲 Made in Cameroun
                </p>
              </div>
            </Link>

            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.7 }}
               className="mb-6">
              La première plateforme dédiée à l'artisanat authentique du Sahel.
              Nous connectons artisans et acheteurs partout au Cameroun.
            </p>

            {/* Réseaux sociaux */}
            <div className="flex items-center gap-2 mb-6">
              {[
                { Icon: Facebook,  label: 'Facebook'  },
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Twitter,   label: 'Twitter'   },
                { Icon: Youtube,   label: 'YouTube'   },
              ].map(({ Icon, label }) => (
                <button key={label} title={label}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all .2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.borderColor = '#f97316' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}>
                  <Icon size={15} color="rgba(255,255,255,0.5)" />
                </button>
              ))}
            </div>

            {/* Paiements */}
            <div>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10,
                           textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                Paiements acceptés
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['Orange Money', 'MTN Mobile Money'].map(p => (
                  <span key={p} style={{
                    fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.45)',
                  }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700,
                         textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
              Navigation
            </p>
            <ul className="space-y-3">
              {[
                { to: '/',             label: 'Accueil'           },
                { to: '/products',     label: 'Catalogue produits' },
                { to: '/how-it-works', label: 'Comment ça marche' },
                { to: '/roadmap',      label: 'Notre roadmap'     },
                { to: '/register',     label: 'Devenir artisan'   },
                { to: '/orders',       label: 'Suivi de commande' },
                { to: '/profile',      label: 'Mon compte'        },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13,
                                          textDecoration: 'none', transition: 'color .15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f97316'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700,
                         textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
              Informations légales
            </p>
            <ul className="space-y-3">
              {[
                { to: '/legal/terms',    label: "Conditions d'utilisation"     },
                { to: '/legal/privacy',  label: 'Confidentialité'              },
                { to: '/legal/returns',  label: 'Politique de retour'          },
                { to: '/legal/delivery', label: 'Livraison & frais'            },
                { to: '/legal/faq',      label: 'FAQ'                          },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13,
                                          textDecoration: 'none', transition: 'color .15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f97316'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700,
                         textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
              Contact
            </p>
            <ul className="space-y-4">
              {[
                { Icon: Mail,   val: 'sahelmarket@gmail.com', href: 'mailto:sahelmarket@gmail.com' },
                { Icon: Phone,  val: '+237 680 757 871',      href: 'tel:+237680757871'            },
                { Icon: MapPin, val: 'Maroua, Cameroun',      href: null                           },
              ].map(({ Icon, val, href }) => (
                <li key={val} className="flex items-center gap-3">
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(249,115,22,0.12)',
                    border: '1px solid rgba(249,115,22,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={14} color="#f97316" />
                  </div>
                  {href
                    ? <a href={href} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13,
                                               textDecoration: 'none' }}>
                        {val}
                      </a>
                    : <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{val}</span>
                  }
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Bas de page ─────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {/* pb-20 sur mobile = 80px pour dépasser la BottomNav fixe (60px) */}
        <div className="max-w-7xl mx-auto px-6 pt-4 pb-20 md:pb-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
              © {year} Sahel Market · Tous droits réservés
            </p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
              Fait avec ❤️ au Cameroun 🇨🇲
            </p>
          </div>
        </div>
      </div>

    </footer>
  )
}
