import { useEffect, useRef, useState } from 'react'
import { MapPin, Wifi, WifiOff } from 'lucide-react'

const OR = '#2D6A4F'

export default function DeliveryTracker({ orderId }) {
  const [position,  setPosition]  = useState(null)
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)

  useEffect(() => {
    const wsBase = import.meta.env.VITE_WS_URL ?? `ws://${location.host}`
    const ws = new WebSocket(`${wsBase}/ws/delivery/${orderId}/`)
    wsRef.current = ws

    ws.onopen    = () => setConnected(true)
    ws.onclose   = () => setConnected(false)
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setPosition({ lat: data.latitude, lng: data.longitude })
    }

    return () => ws.close()
  }, [orderId])

  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb',
      borderRadius: 16, padding: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Suivi en temps réel</p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, padding: '4px 10px', borderRadius: 20,
          background: connected ? '#f0fdf4' : '#f3f4f6',
          color: connected ? '#16a34a' : '#9ca3af',
        }}>
          {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {connected ? 'Connecté' : 'Déconnecté'}
        </div>
      </div>

      <div style={{
        background: '#f9fafb', borderRadius: 12, height: 192,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px dashed #e5e7eb',
      }}>
        {position ? (
          <div style={{ textAlign: 'center' }}>
            <MapPin size={32} color={OR} style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Livreur en route</p>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, fontFamily: 'monospace' }}>
              {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <MapPin size={32} color="#d1d5db" strokeWidth={1} style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: 13, color: '#9ca3af' }}>En attente de la position du livreur…</p>
          </div>
        )}
      </div>
    </div>
  )
}
