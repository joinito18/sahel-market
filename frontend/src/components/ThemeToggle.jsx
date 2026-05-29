import { useState, useEffect } from 'react'

const THEMES = {
  sahel: {
    label: 'Sahel Vert',
    dot: '#2D6A4F',
    bg: '#F5F4EF',
    preview: ['#F5F4EF', '#2D6A4F', '#111111'],
  },
  terracotta: {
    label: 'Terracotta',
    dot: '#C2542A',
    bg: '#FEFAF6',
    preview: ['#FEFAF6', '#C2542A', '#1C1208'],
  },
}

export default function ThemeToggle() {
  const [open, setOpen]   = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('sm-theme') || 'sahel')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('sm-theme', theme)
  }, [theme])

  const current = THEMES[theme]
  const other   = theme === 'sahel' ? 'terracotta' : 'sahel'

  return (
    <div style={{ position: 'fixed', bottom: 80, right: 16, zIndex: 9999 }}>

      {/* Panel ouvert */}
      {open && (
        <div style={{
          position: 'absolute', bottom: 52, right: 0,
          background: '#fff', borderRadius: 16,
          border: '1px solid #E8E7E2',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          padding: 16, width: 220,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#ADADAD', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
            Comparer les designs
          </p>
          {Object.entries(THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => { setTheme(key); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: theme === key ? '#F5F4EF' : 'transparent',
                outline: theme === key ? `2px solid ${t.dot}` : 'none',
                transition: 'all .15s',
              }}
            >
              {/* Miniature palette */}
              <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                {t.preview.map((c, i) => (
                  <div key={i} style={{ width: 14, height: 14, borderRadius: 4, background: c, border: '1px solid rgba(0,0,0,0.06)' }} />
                ))}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#111', marginBottom: 1 }}>{t.label}</p>
                {theme === key && (
                  <p style={{ fontSize: 10, color: t.dot, fontWeight: 600 }}>Actif</p>
                )}
              </div>
            </button>
          ))}

          <div style={{ borderTop: '1px solid #F0EFE9', paddingTop: 8, marginTop: 4 }}>
            <p style={{ fontSize: 10, color: '#ADADAD', lineHeight: 1.5, textAlign: 'center' }}>
              Cliquez pour basculer en temps réel
            </p>
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
          border: `2px solid ${current.dot}`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 3, padding: 0,
          transition: 'transform .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {/* Les deux demi-cercles représentant les deux thèmes */}
        <div style={{ position: 'relative', width: 22, height: 22, borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', background: THEMES.sahel.dot }} />
          <div style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', background: THEMES.terracotta.dot }} />
        </div>
      </button>
    </div>
  )
}
