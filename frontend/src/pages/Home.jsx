import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, ChevronLeft, Shield, Truck, Award, Users, MapPin, Package, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { productService } from '../services/product.service.js'
import { imgUrl } from '../utils/media.js'
import ProductCard from '../components/ProductCard.jsx'
import { getRecentlyViewed } from '../utils/recentlyViewed.js'

/* ── Section header éditorial ─────────────────────────────────── */
function SectionHeader({ title, sub, to }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
      <div>
        {sub && <p className="label-caps" style={{ marginBottom: 10 }}>{sub}</p>}
        <h2 className="serif-xl">{title}</h2>
      </div>
      {to && (
        <Link to={to} className="label-caps" style={{ color: 'var(--ink)', textDecoration: 'none', whiteSpace: 'nowrap', paddingBottom: 3 }}>
          Voir tout →
        </Link>
      )}
    </div>
  )
}

/* ── Skeleton card ────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div>
      <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 12, marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 8, width: '55%', borderRadius: 4, marginBottom: 5 }} />
      <div className="skeleton" style={{ height: 11, width: '80%', borderRadius: 4, marginBottom: 5 }} />
      <div className="skeleton" style={{ height: 11, width: '40%', borderRadius: 4 }} />
    </div>
  )
}

/* ── Carousel horizontal ──────────────────────────────────────── */
function Carousel({ products, loading, count = 6 }) {
  const ref  = useRef(null)
  const [canL, setCanL] = useState(false)
  const [canR, setCanR] = useState(true)
  const check = useCallback(() => {
    const el = ref.current; if (!el) return
    setCanL(el.scrollLeft > 8)
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }, [])
  useEffect(() => {
    const el = ref.current; if (!el) return
    el.addEventListener('scroll', check); check()
    return () => el.removeEventListener('scroll', check)
  }, [products, check])
  const scroll = dir => ref.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })

  return (
    <div style={{ position: 'relative' }}>
      {canL && (
        <button onClick={() => scroll(-1)}
          style={{
            position: 'absolute', left: -12, top: '35%', zIndex: 2,
            width: 32, height: 32, borderRadius: '50%', background: '#fff',
            border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <ChevronLeft size={15} color="var(--ink)" />
        </button>
      )}
      {canR && (
        <button onClick={() => scroll(1)}
          style={{
            position: 'absolute', right: -12, top: '35%', zIndex: 2,
            width: 32, height: 32, borderRadius: '50%', background: '#fff',
            border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <ChevronRight size={15} color="var(--ink)" />
        </button>
      )}
      <div
        ref={ref}
        className="scrollbar-hide"
        style={{ display: 'flex', gap: 'var(--grid-gap)', overflowX: 'auto', paddingBottom: 4 }}
      >
        {loading
          ? Array.from({ length: count }).map((_, i) => (
              <div key={i} style={{ flexShrink: 0, width: 148 }}><SkeletonCard /></div>
            ))
          : products.map((p, i) => (
              <div key={p.id} style={{ flexShrink: 0, width: 148 }}>
                <ProductCard product={p} index={i} />
              </div>
            ))
        }
      </div>
    </div>
  )
}

/* ── Section par catégorie ────────────────────────────────────── */
function CatSection({ category }) {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'cat', category.id],
    queryFn:  () => productService.getAll({ category: category.id, ordering: '-views_count', page_size: 10 }),
  })
  const products = data?.data?.results ?? []
  if (!isLoading && products.length === 0) return null
  const src = imgUrl(category.image)

  return (
    <div className="s-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, overflow: 'hidden',
            background: 'var(--surface-2)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {src
              ? <img src={src} alt={category.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Package size={15} color="var(--border-2)" />}
          </div>
          <span className="serif-md">{category.name}</span>
        </div>
        <Link to={`/products?category=${category.id}`} className="label-caps" style={{ color: 'var(--ink)', textDecoration: 'none' }}>
          Tout voir →
        </Link>
      </div>
      <Carousel products={products} loading={isLoading} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate()

  const { data: catsData }    = useQuery({ queryKey: ['categories'], queryFn: () => productService.getCategories() })
  const { data: statsData }   = useQuery({ queryKey: ['stats'],      queryFn: () => productService.getStats(), staleTime: 300000 })
  const { data: featData,  isLoading: loadFeat } = useQuery({ queryKey: ['feat'], queryFn: () => productService.getAll({ ordering: '-views_count', page_size: 10 }) })
  const { data: newData,   isLoading: loadNew  } = useQuery({ queryKey: ['new'],  queryFn: () => productService.getAll({ ordering: '-created_at',  page_size: 10 }) })

  const categories  = Array.isArray(catsData?.data) ? catsData.data : (catsData?.data?.results ?? [])
  const stats       = statsData?.data ?? {}
  const featured    = featData?.data?.results ?? []
  const newProducts = newData?.data?.results  ?? []

  // ── Diaporama hero ────────────────────────────────────────────
  const recentlyViewed = useMemo(() => getRecentlyViewed(), [])

  const heroImages = useMemo(() => {
    const imgs = [
      ...featured.slice(0, 6).map(p => imgUrl(p.main_image)),
      ...categories.slice(0, 4).map(c => imgUrl(c.image)),
    ].filter(Boolean)
    return [...new Set(imgs)]
  }, [featured, categories])

  const [heroIdx, setHeroIdx] = useState(0)
  useEffect(() => {
    if (heroImages.length <= 1) return
    const t = setInterval(() => setHeroIdx(i => (i + 1) % heroImages.length), 5000)
    return () => clearInterval(t)
  }, [heroImages.length])

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ══════════════════════════════════════════════════════════
          HERO — IMAGE PLEIN FOND + GRAIN
      ══════════════════════════════════════════════════════════ */}
      {(() => {
        return (
          <div style={{ position: 'relative', minHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Diaporama — toutes les images empilées, fondu + Ken Burns */}
            {heroImages.length === 0 && (
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1008 50%, #0d0d0d 100%)' }} />
            )}
            {heroImages.map((src, i) => (
              <img key={src} src={src} alt=""
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center',
                  filter: 'brightness(0.38) saturate(0.8)',
                  opacity: i === heroIdx ? 1 : 0,
                  transform: i === heroIdx ? 'scale(1.06)' : 'scale(1)',
                  transition: 'opacity 1.5s ease, transform 6s ease',
                }}
              />
            ))}

            {/* Overlay gradient directionnel */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.25) 100%)',
            }} />
            {/* Vignette latérale */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
            }} />
            {/* Texture grain */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.18,
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'repeat',
            }} />

            {/* Contenu centré */}
            <div style={{
              position: 'relative', flex: 1,
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              maxWidth: 860, margin: '0 auto', width: '100%',
              padding: 'clamp(80px,10vw,140px) clamp(20px,4vw,48px) clamp(32px,5vw,56px)',
              textAlign: 'center',
            }}>
              <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.22,1,0.36,1] }}>

                {/* Badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    Artisanat camerounais · Fait à la main
                  </span>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
                </div>

                <h1 className="display-1" style={{ color: '#FFFFFF', marginBottom: 20 }}>
                  L'artisanat<br />
                  <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>du Sahel</em>,<br />
                  livré chez vous
                </h1>

                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(13px,2vw,16px)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 36px' }}>
                  Sacs en cuir, bijoux, vêtements tissés — directement des mains de nos artisans du Nord Cameroun.
                </p>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Link to="/products" className="btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    Découvrir <ArrowRight size={14} />
                  </Link>
                  <Link to="/register" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '13px 24px', borderRadius: 100,
                    fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
                    color: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(255,255,255,0.2)',
                    textDecoration: 'none', transition: 'border-color .15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                  >
                    Devenir vendeur
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Dots indicateurs de slide */}
            {heroImages.length > 1 && (
              <div style={{ position: 'absolute', bottom: 72, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 2 }}>
                {heroImages.map((_, i) => (
                  <button key={i} onClick={() => setHeroIdx(i)}
                    style={{
                      width: i === heroIdx ? 20 : 6, height: 6,
                      borderRadius: 3, border: 'none', cursor: 'pointer', padding: 0,
                      background: i === heroIdx ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
                      transition: 'width .35s ease, background .35s ease',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Catégories — scroll horizontal en bas du hero */}
            {categories.length > 0 && (
              <div style={{ position: 'relative', borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.3)' }}>
                <div
                  className="scrollbar-hide"
                  style={{ display: 'flex', overflowX: 'auto', gap: 0, maxWidth: 1280, margin: '0 auto' }}
                >
                  {categories.map(cat => {
                    const src = imgUrl(cat.image)
                    return (
                      <Link key={cat.id} to={`/products?category=${cat.id}`}
                        style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 18px', textDecoration: 'none', transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, overflow: 'hidden',
                          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {src
                            ? <img src={src} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <Package size={14} color="rgba(255,255,255,0.3)" />}
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.55)', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {cat.name}
                        </span>
                      </Link>
                    )
                  })}
                  <Link to="/products"
                    style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 18px', textDecoration: 'none', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, border: '1px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>Tout voir</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* ══════════════════════════════════════════════════════════
          BARRE GARANTIES
      ══════════════════════════════════════════════════════════ */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
          <div className="scrollbar-hide" style={{ display: 'flex', overflowX: 'auto', borderRight: 'none' }}>
            {[
              { Icon: Shield, label: 'Paiement sécurisé' },
              { Icon: Truck,  label: 'Livraison suivie'  },
              { Icon: Award,  label: 'Artisans certifiés'},
              { Icon: Users,  label: 'Support local'     },
            ].map(({ Icon, label }) => (
              <div key={label} style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRight: '1px solid var(--border)',
              }}>
                <Icon size={14} color="var(--ink)" />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TENDANCES
      ══════════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,32px)' }}>
        <div className="s-gap s-card">
          <SectionHeader title="Tendances du moment" sub="Les plus consultés" to="/products?ordering=-views_count" />
          <div className="product-grid-home">
            {loadFeat
              ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
              : featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
            }
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          CHIFFRES IMPACT — bande pleine largeur
      ══════════════════════════════════════════════════════════ */}
      {stats.artisans !== undefined && (
        <div className="s-gap" style={{ background: '#111111', width: '100%' }}>
          <div style={{
            maxWidth: 1280, margin: '0 auto',
            padding: 'clamp(40px,5vw,72px) clamp(16px,4vw,40px)',
          }}>
            <div className="impact-grid">
              {[
                { v: stats.artisans,       label: 'Artisans',  sub: 'actifs sur la plateforme'  },
                { v: stats.produits,       label: 'Créations', sub: 'faites à la main'           },
                { v: stats.commandes || 0, label: 'Commandes', sub: 'livrées avec succès'        },
                { v: stats.regions,        label: 'Régions',   sub: 'couvertes au Cameroun'      },
              ].map(({ v, label, sub }, i, arr) => (
                <div key={label} style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', textAlign: 'center',
                  padding: 'clamp(20px,3vw,32px) clamp(16px,2vw,24px)',
                  borderRight: i < arr.length - 1
                    ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(2.4rem,5vw,4rem)',
                    fontWeight: 700, color: '#fff',
                    lineHeight: 1, marginBottom: 10,
                    letterSpacing: '-0.025em',
                  }}>
                    {Number(v).toLocaleString('fr-FR')}
                    <span style={{ color: 'var(--accent)', fontSize: '0.45em', verticalAlign: 'super' }}>+</span>
                  </p>
                  <p style={{
                    fontSize: 11, fontWeight: 700, color: '#fff',
                    textTransform: 'uppercase', letterSpacing: '0.12em',
                    marginBottom: 6,
                  }}>
                    {label}
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.4 }}>
                    {sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          NOUVELLES CRÉATIONS
      ══════════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,32px)' }}>
        <div className="s-gap s-card">
          <SectionHeader title="Nouvelles créations" sub="Tout juste ajoutées" to="/products?ordering=-created_at" />
          <Carousel products={newProducts} loading={loadNew} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          RÉCEMMENT CONSULTÉS
      ══════════════════════════════════════════════════════════ */}
      {recentlyViewed.length >= 2 && (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,32px)' }}>
          <div className="s-gap s-card">
            <SectionHeader title="Récemment consultés" sub="Vos produits vus" />
            <Carousel products={recentlyViewed} loading={false} />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTIONS PAR CATÉGORIE
      ══════════════════════════════════════════════════════════ */}
      <div className="s-gap" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 'var(--section-gap)' }}>
        {categories.map(cat => (
          <CatSection key={cat.id} category={cat} />
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          CTA ARTISAN
      ══════════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,32px)' }}>
        <div className="s-gap" style={{
          background: '#111111', borderRadius: 20,
          padding: 'clamp(36px,6vw,72px) 24px', textAlign: 'center',
          marginBottom: 'clamp(32px,5vw,64px)',
        }}>
          <p className="label-caps" style={{ color: '#ADADAD', marginBottom: 16 }}>Pour les artisans</p>
          <h2 className="display-2" style={{ color: '#fff', marginBottom: 16 }}>
            Vendez vos créations<br />
            <em style={{ color: 'var(--accent)' }}>partout au Cameroun</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, maxWidth: 420, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Inscription gratuite. Un agent vous accompagne sur le terrain. Vos produits en ligne en moins de 48h.
          </p>
          <div className="cta-actions">
            <Link to="/register" className="btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Créer mon compte gratuit <ArrowRight size={14} />
            </Link>
            <Link to="/how-it-works" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '13px 24px', borderRadius: 100, fontSize: 13, fontWeight: 700,
              color: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(255,255,255,0.18)',
              textDecoration: 'none',
            }}>
              Comment ça marche ?
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          CONFIANCE — TÉMOIGNAGES + PARTENAIRES
      ══════════════════════════════════════════════════════════ */}
      <div style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(40px,6vw,72px) clamp(16px,4vw,32px)' }}>

          {/* En-tête */}
          <div style={{ textAlign: 'center', marginBottom: 'clamp(32px,5vw,52px)' }}>
            <p className="label-caps" style={{ marginBottom: 12 }}>Ce qu'ils disent de nous</p>
            <h2 className="serif-xl">Des artisans qui nous font confiance</h2>
          </div>

          {/* Témoignages */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, marginBottom: 'clamp(40px,5vw,60px)' }}>
            {[
              {
                quote: "Avant Sahel Market, je vendais uniquement au marché de Maroua. Aujourd'hui j'ai des clients à Douala et Yaoundé que je n'aurais jamais pu atteindre seul.",
                name: 'Fatima Adamou',
                role: 'Artisane broderie',
                city: 'Maroua',
                since: 'Membre depuis 2023',
                color: '#c2785a',
              },
              {
                quote: "L'agent qui m'a accompagné a pris les photos de mes sacs en cuir et créé ma boutique en moins d'une journée. Mes premières commandes sont arrivées la semaine suivante.",
                name: 'Ibrahim Moussa',
                role: 'Maroquinier',
                city: 'Garoua',
                since: 'Membre depuis 2023',
                color: '#2D6A4F',
              },
              {
                quote: "Le paiement par Orange Money me convient parfaitement. Je reçois l'argent directement sur mon téléphone dès que la commande est livrée. Très fiable.",
                name: 'Aïcha Koné',
                role: 'Tisseuse de pagnes',
                city: 'Ngaoundéré',
                since: 'Membre depuis 2024',
                color: '#7c5c3a',
              },
            ].map(({ quote, name, role, city, since, color }) => (
              <div key={name} style={{
                background: '#fff',
                borderRadius: 16,
                border: '1px solid var(--border)',
                padding: 'clamp(20px,2.5vw,28px)',
                display: 'flex', flexDirection: 'column', gap: 20,
              }}>
                {/* Étoiles */}
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="#F59E0B">
                      <path d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.885l-3.09 1.625.59-3.44L2 4.635l3.455-.505L7 1z"/>
                    </svg>
                  ))}
                </div>

                {/* Citation */}
                <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--ink-2)', fontStyle: 'italic', flex: 1 }}>
                  « {quote} »
                </p>

                {/* Auteur */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: 14,
                  }}>
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3 }}>{name}</p>
                    <p style={{ fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.4 }}>{role} · {city}</p>
                    <p style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, marginTop: 2 }}>{since}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Séparateur */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 'clamp(28px,4vw,40px)' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <p className="label-caps">Nos partenaires</p>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Partenaires — bande horizontale */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
            {[
              { name: 'Orange Cameroun', role: 'Paiement mobile',           color: '#FF6600', dot: '#FF6600' },
              { name: 'MTN Cameroun',    role: 'Mobile Money MoMo',         color: '#C8960A', dot: '#FFCC00' },
              { name: 'GIZ',             role: 'Coopération au développement', color: '#2D7D46', dot: '#2D7D46' },
              { name: 'MINCOMMERCE',     role: 'Ministère du Commerce',     color: '#1E3A8A', dot: '#1E3A8A' },
            ].map(({ name, role, color, dot }) => (
              <div key={name} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 18px',
                borderRadius: 100,
                background: '#fff',
                border: '1px solid var(--border)',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{name}</p>
                  <p style={{ fontSize: 10, color: 'var(--ink-3)', lineHeight: 1 }}>{role}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  )
}
