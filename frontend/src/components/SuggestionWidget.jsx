import { useState } from 'react'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquarePlus, X, Send, ChevronDown } from 'lucide-react'
import api from '../services/api.js'
import toast from 'react-hot-toast'

export default function SuggestionWidget() {
  const { isAuthenticated } = useSelector(s => s.auth)
  const [open,    setOpen]    = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)

  if (!isAuthenticated) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) {
      toast.error('Remplissez le sujet et le message')
      return
    }
    setSending(true)
    try {
      await api.post('/auth/suggestions/', { subject, message })
      setSent(true)
      toast.success('Suggestion envoyée ! Merci 🙏')
      setTimeout(() => {
        setSent(false)
        setOpen(false)
        setSubject('')
        setMessage('')
      }, 2500)
    } catch {
      toast.error('Erreur lors de l\'envoi')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed bottom-24 left-5 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-80 bg-white rounded-3xl shadow-2xl shadow-gray-200/80
                       border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4
                            border-b border-gray-100"
                 style={{ background: 'linear-gradient(135deg, #1a2e1f, #2D6A4F)' }}>
              <div className="flex items-center gap-2.5">
                <MessageSquarePlus size={18} className="text-orange-400" />
                <div>
                  <p className="text-white font-bold text-sm leading-none">
                    Une idée ? Partagez-la
                  </p>
                  <p className="text-white/50 text-[10px] mt-0.5">
                    Votre avis améliore la plateforme
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-xl
                           flex items-center justify-center transition-colors">
                <X size={14} className="text-white/70" />
              </button>
            </div>

            {/* Corps */}
            {sent ? (
              <div className="px-5 py-8 text-center">
                <div className="text-4xl mb-3">🙏</div>
                <p className="font-bold text-gray-800 mb-1">Merci pour votre suggestion !</p>
                <p className="text-sm text-gray-400">
                  Nous l'étudierons avec attention.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Sujet
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Ex: Ajouter un mode sombre..."
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200
                               rounded-xl outline-none focus:border-orange-400
                               focus:ring-2 focus:ring-orange-100 transition-all
                               placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Décrivez votre suggestion en détail..."
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200
                               rounded-xl outline-none focus:border-orange-400
                               focus:ring-2 focus:ring-orange-100 resize-none
                               transition-all placeholder-gray-400"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 text-right">
                    {message.length} caractères
                  </p>
                </div>
                <button type="submit" disabled={sending}
                  className="w-full flex items-center justify-center gap-2 py-3
                             bg-orange-500 hover:bg-orange-600 text-white font-bold
                             rounded-2xl transition-colors disabled:opacity-60 text-sm">
                  {sending
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent
                                      rounded-full animate-spin" />
                    : <><Send size={14} /> Envoyer ma suggestion</>
                  }
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton flottant */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(v => !v)}
        className="w-12 h-12 rounded-2xl flex items-center justify-center
                   shadow-lg transition-all"
        style={{ background: 'linear-gradient(135deg, #1a2e1f, #2D6A4F)' }}
        title="Faire une suggestion"
      >
        {open
          ? <ChevronDown size={20} className="text-white" />
          : <MessageSquarePlus size={20} className="text-white" />
        }
      </motion.button>
    </div>
  )
}