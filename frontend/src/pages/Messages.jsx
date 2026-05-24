import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ArrowLeft, MessageCircle, Store, User } from 'lucide-react'
import api from '../services/api.js'

const OR = '#f97316'
const BG = '#f0f2f5'

function avatar(u) {
  if (u?.avatar) return u.avatar
  return null
}

function initials(u) {
  const name = u?.first_name || u?.username || '?'
  return name[0].toUpperCase()
}

function AvatarBubble({ u, size = 40 }) {
  const src = avatar(u)
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 3,
      overflow: 'hidden', flexShrink: 0,
      background: 'linear-gradient(135deg,#fb923c,#ea580c)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {src
        ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ color: '#fff', fontWeight: 900, fontSize: size * 0.35 }}>{initials(u)}</span>
      }
    </div>
  )
}

/* ── Liste conversations ───────────────────────────────────────── */
function ConversationList({ activeId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn:  () => api.get('/auth/messages/').then(r => r.data),
    refetchInterval: 15000,
  })
  const convs = data || []

  if (isLoading) return (
    <div style={{ padding: 24 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{
          height: 64, borderRadius: 12, background: '#f3f4f6',
          marginBottom: 8, opacity: 0.6,
        }} />
      ))}
    </div>
  )

  if (convs.length === 0) return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <MessageCircle size={40} color="#e5e7eb" style={{ margin: '0 auto 12px' }} />
      <p style={{ color: '#9ca3af', fontSize: 13 }}>Aucune conversation</p>
      <p style={{ color: '#d1d5db', fontSize: 12, marginTop: 4 }}>
        Contactez un artisan depuis sa fiche produit
      </p>
    </div>
  )

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {convs.map(c => (
        <Link
          key={c.user_id}
          to={`/messages/${c.user_id}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', textDecoration: 'none',
            background: activeId === String(c.user_id) ? '#fff7ed' : 'transparent',
            borderLeft: activeId === String(c.user_id) ? `3px solid ${OR}` : '3px solid transparent',
            transition: 'background .12s',
          }}
          onMouseEnter={e => { if (activeId !== String(c.user_id)) e.currentTarget.style.background = '#f9fafb' }}
          onMouseLeave={e => { if (activeId !== String(c.user_id)) e.currentTarget.style.background = 'transparent' }}
        >
          <div style={{ position: 'relative' }}>
            <AvatarBubble u={c} size={42} />
            {c.unread > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: OR, color: '#fff',
                fontSize: 9, fontWeight: 900, minWidth: 16, height: 16,
                borderRadius: 8, display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: '0 3px',
              }}>
                {c.unread}
              </span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <p style={{
                fontSize: 13, fontWeight: c.unread > 0 ? 700 : 600,
                color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {c.first_name ? `${c.first_name} ${c.last_name || ''}`.trim() : c.username}
              </p>
              {c.last_message_at && (
                <p style={{ fontSize: 10, color: '#9ca3af', flexShrink: 0, marginLeft: 8 }}>
                  {new Date(c.last_message_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </p>
              )}
            </div>
            <p style={{
              fontSize: 12, color: c.unread > 0 ? '#374151' : '#9ca3af',
              fontWeight: c.unread > 0 ? 600 : 400,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {c.last_message || '…'}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}

/* ── Thread ──────────────────────────────────────────────────────── */
function Thread({ userId }) {
  const { user: me }  = useSelector(s => s.auth)
  const [text, setText] = useState('')
  const bottomRef       = useRef(null)
  const qc              = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['thread', userId],
    queryFn:  () => api.get(`/auth/messages/${userId}/`).then(r => r.data),
    refetchInterval: 8000,
  })

  const send = useMutation({
    mutationFn: (content) => api.post(`/auth/messages/${userId}/`, { content }),
    onSuccess: () => {
      setText('')
      qc.invalidateQueries(['thread', userId])
      qc.invalidateQueries(['conversations'])
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.messages?.length])

  const handleSend = (e) => {
    e.preventDefault()
    if (text.trim()) send.mutate(text.trim())
  }

  const other    = data?.other
  const messages = data?.messages || []

  if (isLoading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #f97316', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

      {/* En-tête thread */}
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid #f3f4f6',
        display: 'flex', alignItems: 'center', gap: 12, background: '#fff',
      }}>
        <Link to="/messages" className="md:hidden" style={{ color: '#6b7280', textDecoration: 'none' }}>
          <ArrowLeft size={18} />
        </Link>
        {other && <AvatarBubble u={other} size={38} />}
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
            {other?.first_name ? `${other.first_name} ${other.last_name || ''}`.trim() : other?.username}
          </p>
          <p style={{ fontSize: 11, color: '#9ca3af' }}>
            {other?.role === 'producer' ? '🎨 Artisan' : '🛍️ Client'}
          </p>
        </div>
        {other?.role === 'producer' && (
          <Link
            to={`/artisans/${other?.username}`}
            style={{
              marginLeft: 'auto', fontSize: 12, fontWeight: 600,
              color: OR, textDecoration: 'none',
              padding: '5px 12px', background: '#fff7ed',
              borderRadius: 8, border: '1px solid #fed7aa',
            }}
          >
            Voir le profil →
          </Link>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: 13 }}>
            Commencez la conversation !
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender === me?.id
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i < 10 ? 0 : 0 }}
              style={{
                display: 'flex',
                justifyContent: isMe ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end', gap: 8,
              }}
            >
              {!isMe && <AvatarBubble u={other} size={28} />}
              <div style={{
                maxWidth: '72%', padding: '10px 14px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isMe ? OR : '#f3f4f6',
                color: isMe ? '#fff' : '#111827',
                fontSize: 13, lineHeight: 1.5,
                boxShadow: isMe ? '0 2px 8px rgba(249,115,22,0.2)' : 'none',
              }}>
                {msg.content}
                <p style={{
                  fontSize: 10, marginTop: 4, textAlign: 'right',
                  color: isMe ? 'rgba(255,255,255,0.6)' : '#9ca3af',
                }}>
                  {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <form onSubmit={handleSend} style={{
        padding: '12px 16px', borderTop: '1px solid #f3f4f6',
        display: 'flex', gap: 10, background: '#fff',
      }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Écrivez un message…"
          style={{
            flex: 1, padding: '11px 16px', borderRadius: 12,
            border: '1px solid #e5e7eb', outline: 'none',
            fontSize: 13, background: '#f9fafb', color: '#111827',
          }}
          onFocus={e => e.target.style.borderColor = OR}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
        <button
          type="submit"
          disabled={!text.trim() || send.isPending}
          style={{
            width: 44, height: 44, borderRadius: 12, border: 'none',
            background: text.trim() ? OR : '#e5e7eb', cursor: text.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .15s', flexShrink: 0,
          }}
        >
          <Send size={17} color={text.trim() ? '#fff' : '#9ca3af'} />
        </button>
      </form>
    </div>
  )
}

/* ── Page principale ─────────────────────────────────────────────── */
export default function Messages() {
  const { userId } = useParams()
  const navigate   = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: BG }}>

      <div style={{ background: '#1a1a1a', padding: '24px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ color: OR, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            Mon compte
          </p>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900 }}>Messages</h1>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 24px 60px' }}>
        <div style={{
          background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb',
          overflow: 'hidden', display: 'flex',
          height: 'calc(100vh - 220px)', minHeight: 480,
        }}>

          {/* Colonne gauche — liste */}
          <div style={{
            width: 300, flexShrink: 0, borderRight: '1px solid #f3f4f6',
            display: 'flex', flexDirection: 'column',
            ...(userId ? { display: 'none' } : {}),
          }}
            className="md:flex flex-col"
          >
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Conversations</p>
            </div>
            <ConversationList activeId={userId} />
          </div>

          {/* Colonne droite — thread ou placeholder */}
          {userId ? (
            <Thread userId={userId} />
          ) : (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12,
            }}
              className="hidden md:flex"
            >
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MessageCircle size={28} color={OR} />
              </div>
              <p style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>
                Sélectionnez une conversation
              </p>
              <p style={{ color: '#9ca3af', fontSize: 13 }}>
                ou contactez un artisan depuis sa fiche produit
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
