import { useSelector } from 'react-redux'
import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ChatWidget() {
  const { user } = useSelector(s => s.auth)
  const phone = '+237680757871'
  const message = encodeURIComponent(`Bonjour Sahel Market ! Je suis ${user?.username || 'un client'} et j'ai besoin d'aide.`)

  return (
    <motion.a
      href={`https://wa.me/${phone.replace('+', '')}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
      title="Contacter via WhatsApp"
    >
      <MessageCircle size={26} fill="white" strokeWidth={1.5} />
    </motion.a>
  )
}