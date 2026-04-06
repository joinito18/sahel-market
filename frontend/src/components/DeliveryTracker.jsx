import { useEffect, useRef, useState } from 'react'
import { MapPin, Wifi, WifiOff } from 'lucide-react'

export default function DeliveryTracker({ orderId }) {
  const [position, setPosition]   = useState(null)
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/delivery/${orderId}/`)
    wsRef.current = ws

    ws.onopen  = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setPosition({ lat: data.latitude, lng: data.longitude })
    }

    return () => ws.close()
  }, [orderId])

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-sahel-dark">Suivi en temps réel</h3>
        <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${connected ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
          {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {connected ? 'Connecté' : 'Déconnecté'}
        </div>
      </div>

      <div className="bg-sahel-light rounded-xl h-48 flex items-center justify-center">
        {position ? (
          <div className="text-center">
            <MapPin size={32} className="text-sahel-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-sahel-dark">Livreur en route</p>
            <p className="text-xs text-gray-500 mt-1">
              {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <MapPin size={32} className="mx-auto mb-2" strokeWidth={1} />
            <p className="text-sm">En attente de la position...</p>
          </div>
        )}
      </div>
    </div>
  )
}