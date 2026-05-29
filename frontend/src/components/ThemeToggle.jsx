import { useState, useEffect, useRef } from 'react'

const THEMES = [
  {
    id: 'sahel',
    name: 'Sahel Vert',
    tagline: 'Magazine éditorial',
    bg:      '#F5F4EF',
    surface: '#FFFFFF',
    accent:  '#2D6A4F',
    btn:     '#111111',
    radius:  '100px',
    swatch:  ['#F5F4EF', '#2D6A4F', '#111111', '#ADADAD'],
  },
  {
    id: 'maroua',
    name: 'Soleil Maroua',
    tagline: 'Marché vivant',
    bg:      '#FFFDF8',
    surface: '#FFFFFF',
    accent:  '#D94F1A',
    btn:     '#D94F1A',
    radius:  '10px',
    swatch:  ['#FFFDF8', '#D94F1A', '#1A0802', '#C4907C'],
  },
  {
    id: 'indigo',
    name: 'Indigo Peul',
    tagline: 'Craft & artisanat',
    bg:      '#EFF2FA',
    surface: '#FFFFFF',
    accent:  '#1D3F8E',
    btn:     '#1D3F8E',
    radius:  '6px',
    swatch:  ['#EFF2FA', '#1D3F8E', '#0C1A3A', '#8A98B8'],
  },
  {
    id: 'creme',
    name: 'Crème Brûlée',
    tagline: 'Galerie minimaliste',
    bg:      '#FAFAFA',
    surface: '#FFFFFF',
    accent:  '#080706',
    btn:     '#080706',
    radius:  '4px',
    swatch:  ['#FAFAFA', '#080706', '#6B6560', '#B0AAA4'],
  },
]

function MiniPreview({ theme, active }) {
  const br = theme.radius === '100px' ? '100px' : theme.radius === '10px' ? '8px' : theme.radius === '6px' ? '4px' : '2px'
  return (
    <div style={{
      width: '100%', aspectRatio: '4/3',
      background: theme.bg, borderRadius: 8,
      border: active ? `2px solid ${theme.accent}` : '2px solid transparent',
      overflow: 'hidden', position: 'relative',
      boxShadow: active ? `0 0 0 2px ${theme.accent}30` : 'none',
      transition: 'all .2s',
    }}>
      {/* Fausse navbar */}
      <div style={{ height: 18, background: theme.surface, borderBottom: `1px solid ${theme.bg === '#FAFAFA' ? '#E8E5E0' : theme.bg}`, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 4 }}>
        <div style={{ width: 24, height: 5, borderRadius: 3, background: theme.accent, opacity: 0.9 }} />
        <div style={{ flex: 1 }} />
        <div style={{ width: 14, height: 5, borderRadius: br, background: theme.btn }} />
      </div>

      {/* Corps */}
      <div style={{ padding: '6px 6px 4px' }}>
        {/* Hero band */}
        <div style={{ height: 22, background: theme.accent, borderRadius: parseInt(br) > 6 ? 6 : parseInt(br), marginBottom: 5, opacity: 0.15 }} />

        {/* Grille produits 3 colonnes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ background: theme.surface, borderRadius: parseInt(br) > 4 ? 4 : parseInt(br), overflow: 'hidden', border: `1px solid ${theme.bg === '#EFF2FA' ? '#CDD5EC' : '#E8E7E2'}` }}>
              <div style={{ height: 22, background: theme.accent, opacity: 0.12 + i * 0.04 }} />
              <div style={{ padding: 3 }}>
                <div style={{ height: 3, background: theme.btn, borderRadius: 2, marginBottom: 2, opacity: 0.6, width: '80%' }} />
                <div style={{ height: 3, background: theme.accent, borderRadius: 2, width: '50%' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Bouton CTA */}
        <div style={{ marginTop: 5, display: 'flex', justifyContent: 'center' }}>
          <div style={{ height: 8, width: 48, borderRadius: br, background: theme.btn }} />
        </div>
      </div>
    </div>
  )
}

export default function ThemeToggle() {
  const [open, setOpen]   = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('sm-theme') || 'sahel')
  const panelRef          = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('sm-theme', theme)
  }, [theme])

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = THEMES.find(t => t.id === theme) || THEMES[0]

  return (
    <div ref={panelRef} style={{ position: 'fixed', bottom: 80, right: 16, zIndex: 9999 }}>

      {/* Panneau de sélection */}
      {open && (
        <div style={{
          position: 'absolute', bottom: 56, right: 0,
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #E8E7E2',
          boxShadow: '0 16px 48px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.06)',
          padding: '16px',
          width: 296,
        }}>
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#111', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Choisir un design
            </p>
            <p style={{ fontSize: 11, color: '#ADADAD', marginTop: 2 }}>
              Cliquez pour basculer en temps réel
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false) }}
                style={{
                  padding: '10px 10px 10px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  background: theme === t.id ? '#F8F7F4' : 'transparent',
                  textAlign: 'left',
                  transition: 'background .15s',
                }}
              >
                <MiniPreview theme={t} active={theme === t.id} />
                <p style={{ fontSize: 11, fontWeight: 700, color: '#111', marginTop: 6, marginBottom: 1 }}>
                  {t.name}
                  {theme === t.id && (
                    <span style={{ marginLeft: 4, fontSize: 9, background: t.accent, color: '#fff', padding: '1px 5px', borderRadius: 10, verticalAlign: 'middle', fontWeight: 800 }}>
                      ACTIF
                    </span>
                  )}
                </p>
                <p style={{ fontSize: 10, color: '#ADADAD' }}>{t.tagline}</p>

                {/* Swatches */}
                <div style={{ display: 'flex', gap: 3, marginTop: 5 }}>
                  {t.swatch.map((c, i) => (
                    <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c, border: '1px solid rgba(0,0,0,0.08)' }} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Changer de design"
        style={{
          width: 44, height: 44, borderRadius: '50%',
          background: '#fff',
          border: `2px solid ${current.accent}`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform .15s, box-shadow .15s',
          padding: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.16)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';   e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)' }}
      >
        {/* Cercle divisé en 4 pour représenter les 4 thèmes */}
        <div style={{ width: 22, height: 22, borderRadius: '50%', overflow: 'hidden', position: 'relative', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '50%', background: THEMES[0].accent }} />
          <div style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '50%', background: THEMES[1].accent }} />
          <div style={{ position: 'absolute', left: 0, bottom: 0, width: '50%', height: '50%', background: THEMES[2].accent }} />
          <div style={{ position: 'absolute', right: 0, bottom: 0, width: '50%', height: '50%', background: THEMES[3].btn }} />
        </div>
      </button>
    </div>
  )
}
