import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { to: '/',             label: 'Accueil'           },
  { to: '/products',     label: 'Catalogue'          },
  { to: '/how-it-works', label: 'Comment ça marche' },
  { to: '/register',     label: 'Devenir artisan'    },
  { to: '/roadmap',      label: 'Notre roadmap'      },
]

const LEGAL = [
  { to: '/legal/terms',    label: "Conditions"       },
  { to: '/legal/privacy',  label: 'Confidentialité'  },
  { to: '/legal/returns',  label: 'Retours'          },
  { to: '/legal/delivery', label: 'Livraison'        },
  { to: '/legal/faq',      label: 'FAQ'              },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [sent,  setSent]  = useState(false)

  const handleNewsletter = e => {
    e.preventDefault()
    if (!email.trim()) return
    setSent(true)
  }

  return (
    <footer style={{ background: '#0d0d0d' }}>

      {/* ══════════════════════════════════════════════════════════
          CORPS — 3 colonnes
      ══════════════════════════════════════════════════════════ */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)',
                    padding: 'clamp(48px,6vw,88px) 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto',
                      padding: '0 clamp(16px,4vw,40px)' }}>
          <div className="footer-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1fr 1.4fr',
            gap: 'clamp(40px,6vw,88px)',
          }}>

            {/* ── Colonne 1 : Marque + contact + social ─────── */}
            <div>
              <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 18 }}>
                <span style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 28, fontWeight: 700, color: '#fff',
                  letterSpacing: '-0.02em',
                }}>
                  Sahel<em>Market</em>
                </span>
              </Link>

              <p style={{
                color: 'rgba(255,255,255,0.38)', fontSize: 14,
                lineHeight: 1.8, maxWidth: 310, marginBottom: 28,
              }}>
                La plateforme de référence pour l'artisanat du Nord-Cameroun.
                Chaque achat soutient directement un artisan local.
              </p>

              {/* Contact */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px',
                           display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { Icon: Mail,   val: 'sahelmarket@gmail.com', href: 'mailto:sahelmarket@gmail.com' },
                  { Icon: Phone,  val: '+237 680 757 871',       href: 'tel:+237680757871'            },
                  { Icon: MapPin, val: 'Maroua, Cameroun',       href: null                           },
                ].map(({ Icon, val, href }) => (
                  <li key={val} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon size={13} color="rgba(45,106,79,0.8)" strokeWidth={1.8} style={{ flexShrink: 0 }} />
                    {href
                      ? <a href={href}
                          style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13,
                                   textDecoration: 'none', transition: 'color .15s' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}>
                          {val}
                        </a>
                      : <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13 }}>{val}</span>
                    }
                  </li>
                ))}
              </ul>

              {/* Réseaux sociaux */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ Icon: Facebook, label: 'Facebook' }, { Icon: Instagram, label: 'Instagram' }]
                  .map(({ Icon, label }) => (
                  <button key={label} title={label}
                    style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all .2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background   = '#2D6A4F'
                      e.currentTarget.style.borderColor  = '#2D6A4F'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background   = 'rgba(255,255,255,0.05)'
                      e.currentTarget.style.borderColor  = 'rgba(255,255,255,0.08)'
                    }}>
                    <Icon size={14} color="rgba(255,255,255,0.55)" />
                  </button>
                ))}
              </div>
            </div>

            {/* ── Colonne 2 : Navigation + Légal ───────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}
                 className="footer-links-grid">
              {[
                { heading: 'Navigation', items: NAV   },
                { heading: 'Légal',      items: LEGAL },
              ].map(({ heading, items }) => (
                <div key={heading}>
                  <p style={{
                    color: 'rgba(255,255,255,0.18)', fontSize: 10, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 18,
                  }}>
                    {heading}
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0,
                               display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {items.map(({ to, label }) => (
                      <li key={to}>
                        <Link to={to}
                          style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13,
                                   textDecoration: 'none', transition: 'color .15s' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}>
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* ── Colonne 3 : Newsletter ────────────────────── */}
            <div>
              <p style={{
                color: 'rgba(255,255,255,0.18)', fontSize: 10, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 16,
              }}>
                Newsletter
              </p>

              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.5rem, 2.2vw, 2rem)',
                fontWeight: 700, color: '#fff',
                lineHeight: 1.1, letterSpacing: '-0.01em',
                marginBottom: 14,
              }}>
                L'artisanat dans<br />
                <em style={{ color: '#7ec9a0' }}>votre boîte mail</em>
              </h3>

              <p style={{
                color: 'rgba(255,255,255,0.35)', fontSize: 13,
                lineHeight: 1.75, marginBottom: 22,
              }}>
                Portraits d'artisans, nouvelles collections et coulisses du Sahel — chaque semaine.
              </p>

              {!sent ? (
                <form onSubmit={handleNewsletter}
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: 13,
                      padding: '13px 16px', borderRadius: 10,
                      outline: 'none', width: '100%',
                      fontFamily: 'Inter, sans-serif',
                      boxSizing: 'border-box', transition: 'border-color .2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(45,106,79,0.7)'}
                    onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <button type="submit"
                    style={{
                      background: '#2D6A4F', color: '#fff',
                      fontWeight: 700, fontSize: 13,
                      padding: '13px', borderRadius: 10,
                      border: 'none', cursor: 'pointer',
                      letterSpacing: '0.04em',
                      transition: 'background .2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#215638'}
                    onMouseLeave={e => e.currentTarget.style.background = '#2D6A4F'}>
                    S'abonner →
                  </button>
                </form>
              ) : (
                <div style={{
                  background: 'rgba(45,106,79,0.12)',
                  border: '1px solid rgba(45,106,79,0.25)',
                  borderRadius: 10, padding: '16px 18px',
                }}>
                  <p style={{ color: '#7ec9a0', fontSize: 13, fontWeight: 600 }}>
                    ✓ Merci ! À bientôt dans votre boîte mail.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Bas de page ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: '0 auto',
                    padding: 'clamp(16px,2vw,22px) clamp(16px,4vw,40px)',
                    paddingBottom: 'max(22px, calc(80px + env(safe-area-inset-bottom, 0px)))' }}
           className="footer-bottom-pad">
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center',
          justifyContent: 'space-between', gap: 10,
        }}>
          <p style={{ color: 'rgba(255,255,255,0.12)', fontSize: 12 }}>
            © {year} Sahel Market · Tous droits réservés
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {['Orange Money', 'MTN MoMo'].map(p => (
              <span key={p} style={{
                fontSize: 10, fontWeight: 700,
                padding: '4px 10px', borderRadius: 5,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.18)',
              }}>
                {p}
              </span>
            ))}
          </div>

          <p style={{ color: 'rgba(255,255,255,0.12)', fontSize: 12 }}>
            Fait avec ❤️ au Cameroun 🇨🇲
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 44px !important;
          }
          .footer-bottom-pad {
            padding-bottom: max(88px, calc(80px + env(safe-area-inset-bottom, 0px))) !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (min-width: 768px) {
          .footer-bottom-pad {
            padding-bottom: 22px !important;
          }
        }
      `}</style>

    </footer>
  )
}
