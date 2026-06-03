import { useState, useRef, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader2, ShoppingBag, Gift, Truck, Star, ExternalLink } from 'lucide-react'
import api from '../services/api.js'

/* ── Message de bienvenue ──────────────────────────────────────────── */
const WELCOME = "Bonjour ! Je suis l'assistante de **Sahel Market**.\nJe peux vous guider dans vos achats, vous proposer des produits avec liens directs, vous renseigner sur la livraison ou le suivi de commande.\n\nQue puis-je faire pour vous ?"

const SUGGESTIONS = [
  { icon: ShoppingBag, label: 'Catalogue',   msg: 'Montre-moi le catalogue et tes meilleures recommandations.' },
  { icon: Gift,        label: 'Idée cadeau', msg: 'Je cherche un cadeau artisanal original. Tu peux m\'aider à choisir ?' },
  { icon: Truck,       label: 'Livraison',   msg: 'Comment fonctionne la livraison et quelles zones sont couvertes ?' },
  { icon: Star,        label: 'Fidélité',    msg: 'Explique-moi le programme de fidélité et mes avantages.' },
]

/* ── Formatage Markdown → HTML sécurisé ───────────────────────────── */
function formatMessage(raw) {
  const esc  = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const bold = s => s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  const links = s => s
    .replace(/\[([^\]]+)\]\((\/[^)]*)\)/g, (_, l, h) =>
      `<a href="${h}" class="cmsg-link" data-internal="true">${l} <span class="cmsg-link-arrow">→</span></a>`)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]*)\)/g, (_, l, h) =>
      `<a href="${h}" class="cmsg-link cmsg-link-ext" target="_blank" rel="noopener noreferrer">${l}</a>`)
  const process = s => links(bold(esc(s)))

  const lines = raw.split('\n')
  const parts = []
  let inList  = false

  for (const line of lines) {
    const t  = line.trim()
    const li = t.startsWith('- ') || t.startsWith('• ')
    if (li) {
      if (!inList) { parts.push('<ul class="cmsg-ul">'); inList = true }
      parts.push(`<li>${process(t.slice(2))}</li>`)
    } else {
      if (inList) { parts.push('</ul>'); inList = false }
      if (t === '') parts.push('<div style="height:6px"></div>')
      else          parts.push(`<p class="cmsg-p">${process(t)}</p>`)
    }
  }
  if (inList) parts.push('</ul>')
  return parts.join('')
}

/* ── Avatar "SM" — identique au logo navbar ────────────────────────── */
function AvatarSM({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: '#111111', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{
        fontFamily: 'var(--font-serif, "Cormorant Garamond", Georgia, serif)',
        fontSize: size * 0.52, fontWeight: 700,
        color: '#d97706', lineHeight: 1, letterSpacing: '-0.02em',
        paddingTop: 1,
      }}>S</span>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════════════════════════════════ */
export default function ChatWidget() {
  const { user }  = useSelector(s => s.auth)
  const navigate  = useNavigate()
  const location  = useLocation()

  const [open,     setOpen]     = useState(false)
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }])

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  const userCtx = {
    authenticated: !!user,
    name:          user?.first_name || user?.username || '',
    current_page:  location.pathname + location.search,
  }

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 280)
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  /* Navigation React Router sur les liens internes */
  const handleMsgClick = useCallback(e => {
    const a = e.target.closest('a[data-internal]')
    if (!a) return
    e.preventDefault()
    navigate(a.getAttribute('href'))
    setOpen(false)
  }, [navigate])

  function autoResize(el) {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 96) + 'px'
  }

  async function send(text) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    const userMsg = { role: 'user', content: msg }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    setLoading(true)

    try {
      const apiMsgs = history
        .filter(m => m.content !== WELCOME)
        .map(m => ({ role: m.role, content: m.content }))

      const { data } = await api.post('/ai/chat/', {
        messages:     apiMsgs,
        user_context: userCtx,
      })
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Désolée, je suis temporairement indisponible. Réessayez dans un instant 🙏",
      }])
    } finally {
      setLoading(false)
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const showSuggestions = messages.length === 1 && !loading

  /* ── Initiales utilisateur ── */
  const userInitial = user?.first_name?.[0]?.toUpperCase()
    || user?.username?.[0]?.toUpperCase()
    || '?'

  return (
    <>
      {/* ── Styles injectés ─────────────────────────────────────────── */}
      <style>{`
        /* Liens dans les messages */
        .cmsg-link {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: #b45309;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 1.5px solid rgba(180,83,9,0.3);
          transition: border-color .15s, color .15s;
          cursor: pointer;
        }
        .cmsg-link:hover { color: #92400e; border-bottom-color: #92400e; }
        .cmsg-link-arrow { font-size: 11px; font-style: normal; }
        .cmsg-link-ext::after { content: "↗"; font-size: 10px; margin-left: 2px; opacity: .6; }

        /* Paragraphes et listes */
        .cmsg-p  { margin: 0 0 4px; line-height: 1.55; }
        .cmsg-p:last-child { margin-bottom: 0; }
        .cmsg-ul { margin: 4px 0; padding-left: 14px; display:flex; flex-direction:column; gap:3px; }
        .cmsg-ul li { font-size: 13px; line-height: 1.5; }

        /* Animation points frappe */
        @keyframes sahelPulse {
          0%,80%,100% { transform:scale(.55); opacity:.25; }
          40%         { transform:scale(1);   opacity:1;   }
        }

        /* Scrollbar du chat */
        .chat-msgs::-webkit-scrollbar { width: 3px; }
        .chat-msgs::-webkit-scrollbar-track { background: transparent; }
        .chat-msgs::-webkit-scrollbar-thumb { background: #E8E7E2; border-radius: 2px; }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════
          BOUTON FLOTTANT
      ═══════════════════════════════════════════════════════════════ */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: .6, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.93 }}
        aria-label="Ouvrir l'assistant Sahel Market"
        style={{
          position: 'fixed',
          bottom: 88, right: 16,
          zIndex: 50,
          width: 52, height: 52,
          borderRadius: 14,
          background: '#111111',
          border: '1.5px solid rgba(217,119,6,0.35)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18), 0 0 0 1px rgba(217,119,6,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          flexDirection: 'column', gap: 1,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }} transition={{ duration: .16 }}>
              <X size={20} color="white" />
            </motion.span>
          ) : (
            <motion.span key="sm"
              initial={{ opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: .7 }} transition={{ duration: .16 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <span style={{
                fontFamily: 'var(--font-serif,"Cormorant Garamond",Georgia,serif)',
                fontSize: 18, fontWeight: 700, color: '#d97706', lineHeight: 1,
              }}>S</span>
              <span style={{
                fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.08em', lineHeight: 1,
              }}>IA</span>
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pastille verte "en ligne" */}
        {!open && (
          <span style={{
            position: 'absolute', top: -3, right: -3,
            width: 10, height: 10, borderRadius: '50%',
            background: '#2D6A4F',
            border: '2px solid white',
            boxShadow: '0 0 0 2px rgba(45,106,79,0.25)',
          }} />
        )}
      </motion.button>

      {/* ══════════════════════════════════════════════════════════════
          FENÊTRE DE CHAT
      ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: .96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: .96 }}
            transition={{ duration: .2, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              bottom: 152, right: 16,
              zIndex: 50,
              width: 360,
              maxWidth: 'calc(100vw - 2rem)',
              height: 'min(520px, calc(100dvh - 180px))',
              background: '#FFFFFF',
              borderRadius: 20,
              boxShadow: '0 32px 80px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >

            {/* ── HEADER ────────────────────────────────────────────── */}
            <div style={{
              background: '#111111',
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              flexShrink: 0,
              borderBottom: '1px solid rgba(217,119,6,0.2)',
            }}>
              <AvatarSM size={36} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: 'var(--font-serif,"Cormorant Garamond",Georgia,serif)',
                  fontSize: 15, fontWeight: 700, color: '#FFFFFF',
                  lineHeight: 1.2, letterSpacing: '-0.01em',
                }}>
                  Sahel Market
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#2D6A4F', flexShrink: 0,
                    boxShadow: '0 0 4px rgba(45,106,79,0.6)',
                  }} />
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Votre guide artisanal
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'background .15s', flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >
                <X size={14} color="rgba(255,255,255,0.6)" />
              </button>
            </div>

            {/* ── MESSAGES ──────────────────────────────────────────── */}
            <div
              className="chat-msgs"
              onClick={handleMsgClick}
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                background: '#F5F4EF',
                /* PAS de display:flex ici — ça casse le scroll sur mobile */
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 14px' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: 8,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                }}>

                  {/* Avatar */}
                  {msg.role === 'assistant' ? (
                    <AvatarSM size={26} />
                  ) : (
                    <div style={{
                      width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                      background: '#d97706',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#fff',
                    }}>
                      {userInitial}
                    </div>
                  )}

                  {/* Bulle */}
                  <div style={{
                    maxWidth: '76%',
                    ...(msg.role === 'assistant' ? {
                      background: '#FFFFFF',
                      border: '1px solid #E8E7E2',
                      borderLeft: '3px solid #d97706',
                      borderRadius: '0 16px 16px 16px',
                      padding: '10px 13px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                      color: '#111111',
                      fontSize: 13,
                    } : {
                      background: '#111111',
                      borderRadius: '16px 0 16px 16px',
                      padding: '10px 13px',
                      color: '#FFFFFF',
                      fontSize: 13,
                    }),
                  }}
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                  />
                </div>
              ))}

              {/* ── Indicateur de frappe ────────────────────────────── */}
              {loading && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <AvatarSM size={26} />
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E8E7E2',
                    borderLeft: '3px solid #d97706',
                    borderRadius: '0 16px 16px 16px',
                    padding: '12px 14px',
                    display: 'flex', alignItems: 'center', gap: 5,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  }}>
                    {[0, 150, 300].map(d => (
                      <span key={d} style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#d97706', display: 'inline-block',
                        animation: `sahelPulse 1.2s ease-in-out ${d}ms infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
              </div>{/* fin wrapper flex interne */}
            </div>

            {/* ── SUGGESTIONS RAPIDES (barre permanente) ────────────── */}
            <div style={{
              flexShrink: 0,
              background: '#FFFFFF',
              borderTop: '1px solid #F0EFE9',
              padding: '8px 12px',
              display: 'flex', gap: 6,
              overflowX: 'auto',
              scrollbarWidth: 'none',
            }}>
              <style>{`.sugg-strip::-webkit-scrollbar{display:none}`}</style>
              {SUGGESTIONS.map(({ icon: Icon, label, msg }) => (
                <button
                  key={label}
                  onClick={() => send(msg)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 10px',
                    background: '#F5F4EF',
                    border: '1px solid #E8E7E2',
                    borderRadius: 20,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    fontSize: 11, fontWeight: 600, color: '#6B6B6B',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#d97706'
                    e.currentTarget.style.color       = '#b45309'
                    e.currentTarget.style.background  = '#FFFBF5'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#E8E7E2'
                    e.currentTarget.style.color       = '#6B6B6B'
                    e.currentTarget.style.background  = '#F5F4EF'
                  }}
                >
                  <Icon size={11} strokeWidth={2} />
                  {label}
                </button>
              ))}
            </div>

            {/* ── INPUT ─────────────────────────────────────────────── */}
            <div style={{
              flexShrink: 0,
              padding: '10px 12px 12px',
              background: '#FFFFFF',
              borderTop: '1px solid #E8E7E2',
              display: 'flex', gap: 8, alignItems: 'flex-end',
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => { setInput(e.target.value); autoResize(e.target) }}
                onKeyDown={onKey}
                placeholder="Posez votre question…"
                rows={1}
                style={{
                  flex: 1,
                  resize: 'none',
                  border: '1.5px solid #E8E7E2',
                  borderRadius: 10,
                  padding: '9px 12px',
                  fontSize: 13,
                  lineHeight: '1.4',
                  outline: 'none',
                  background: '#F5F4EF',
                  color: '#111111',
                  fontFamily: 'var(--font-sans,"Inter",system-ui,sans-serif)',
                  transition: 'border-color .15s',
                  overflowY: 'hidden',
                }}
                onFocus={e  => e.target.style.borderColor = '#d97706'}
                onBlur={e   => e.target.style.borderColor = '#E8E7E2'}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                style={{
                  width: 36, height: 36,
                  borderRadius: 10,
                  background: input.trim() && !loading ? '#111111' : '#E8E7E2',
                  border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'background .2s',
                }}
              >
                {loading
                  ? <Loader2 size={15} color={input.trim() ? '#fff' : '#ADADAD'} className="animate-spin" />
                  : <Send    size={15} color={input.trim() ? '#fff' : '#ADADAD'} />
                }
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
