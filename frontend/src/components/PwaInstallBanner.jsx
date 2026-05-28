import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export default function PwaInstallBanner() {
  const [prompt, setPrompt]     = useState(null)
  const [visible, setVisible]   = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('pwa_dismissed')) return

    const handler = e => {
      e.preventDefault()
      setPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setVisible(false)
  }

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem('pwa_dismissed', '1')
  }

  if (!visible || installed) return null

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: 'calc(100% - 32px)', maxWidth: 460,
      background: '#1a1a1a', borderRadius: 16, padding: '14px 16px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', gap: 12,
      border: '1px solid rgba(249,115,22,0.3)',
      animation: 'slideUp .35s ease',
    }}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: 'rgba(249,115,22,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Download size={20} color="#2D6A4F" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>
          Installer Sahel Market
        </p>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 }}>
          Accédez à l'app sans navigateur · fonctionne hors connexion
        </p>
      </div>

      <button
        onClick={handleInstall}
        style={{
          flexShrink: 0, padding: '8px 16px', background: '#2D6A4F',
          color: '#fff', border: 'none', borderRadius: 10,
          fontWeight: 700, fontSize: 12, cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Installer
      </button>

      <button
        onClick={handleDismiss}
        style={{
          flexShrink: 0, width: 28, height: 28, borderRadius: 8,
          background: 'rgba(255,255,255,0.08)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <X size={14} color="rgba(255,255,255,0.5)" />
      </button>
    </div>
  )
}
