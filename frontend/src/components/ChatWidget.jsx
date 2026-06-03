import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import api from '../services/api.js'

const WELCOME = "Bonjour ! Je suis **Sahel**, votre assistante IA 🌿\nJe peux vous aider à trouver des produits artisanaux, répondre à vos questions sur les commandes ou vous parler des savoir-faire locaux. Comment puis-je vous aider ?"

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

export default function ChatWidget() {
  const { user } = useSelector(s => s.auth)
  const [open, setOpen]       = useState(false)
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: WELCOME },
  ])
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function autoResize(el) {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 96) + 'px'
  }

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    try {
      const apiMessages = history
        .filter(m => m.content !== WELCOME)
        .map(m => ({ role: m.role, content: m.content }))

      const { data } = await api.post('/ai/chat/', { messages: apiMessages })
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Désolée, je suis temporairement indisponible. Réessayez dans un instant 🙏" },
      ])
    } finally {
      setLoading(false)
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Bouton flottant */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}
        title="Assistant IA Sahel"
        aria-label="Ouvrir l'assistant IA"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open
            ? <motion.span key="x"  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                <X size={24} color="white" />
              </motion.span>
            : <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                <Bot size={24} color="white" />
              </motion.span>
          }
        </AnimatePresence>

        {/* Indicateur "IA" */}
        {!open && (
          <span className="absolute -top-1 -right-1 text-[9px] font-black bg-white text-amber-700 rounded-full px-1 leading-4 shadow">
            IA
          </span>
        )}
      </motion.button>

      {/* Fenêtre de chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed bottom-44 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-amber-100"
            style={{ height: '460px' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}>
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={20} color="white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight">Sahel — Assistant IA</p>
                <p className="text-[11px] text-amber-100">Assistante Sahel · Disponible 24h/24</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-amber-50/30">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold
                    ${msg.role === 'user' ? 'bg-amber-500' : 'bg-amber-700'}`}>
                    {msg.role === 'user'
                      ? (user?.username?.[0]?.toUpperCase() || <User size={13} />)
                      : <Bot size={13} />
                    }
                  </div>
                  {/* Bulle */}
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-amber-600 text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 shadow-sm border border-amber-100 rounded-tl-sm'
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                  />
                </div>
              ))}

              {/* Indicateur de frappe */}
              {loading && (
                <div className="flex gap-2 flex-row">
                  <div className="w-7 h-7 rounded-full bg-amber-700 flex items-center justify-center">
                    <Bot size={13} color="white" />
                  </div>
                  <div className="bg-white shadow-sm border border-amber-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    {[0, 160, 320].map(delay => (
                      <span key={delay} style={{
                        width: 7, height: 7, borderRadius: '50%', background: '#d97706',
                        display: 'inline-block',
                        animation: `sahelPulse 1.2s ease-in-out ${delay}ms infinite`,
                      }} />
                    ))}
                    <style>{`
                      @keyframes sahelPulse {
                        0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
                        40%           { transform: scale(1);   opacity: 1;    }
                      }
                    `}</style>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-3 py-2 bg-white border-t border-amber-100 flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => { setInput(e.target.value); autoResize(e.target) }}
                onKeyDown={onKey}
                placeholder="Posez votre question…"
                rows={1}
                className="flex-1 resize-none rounded-xl border border-amber-200 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300 transition bg-amber-50/50 placeholder-gray-400"
                style={{ lineHeight: '1.4', overflowY: 'hidden' }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition disabled:opacity-40 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}
              >
                {loading
                  ? <Loader2 size={16} className="animate-spin" />
                  : <Send size={16} />
                }
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
