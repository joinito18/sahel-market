import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { closeCart, removeItem, updateQuantity } from '../store/cartSlice.js'

import { imgUrl, fcfa as FCFA } from '../utils/media.js'


export default function CartDrawer() {
  const dispatch = useDispatch()
  const { isOpen, items, total } = useSelector(s => s.cart)

  const itemCount  = items.reduce((s, i) => s + i.quantity, 0)
  const deliveryFee = total >= 25000 ? 0 : 1500
  const grandTotal  = total + deliveryFee

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => dispatch(closeCart())}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-white z-50
                       flex flex-col shadow-2xl"
          >

            {/* ── Header ───────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-4
                            border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                  <ShoppingBag size={18} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 leading-none">
                    Mon panier
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {itemCount} article{itemCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(closeCart())}
                className="w-8 h-8 flex items-center justify-center rounded-xl
                           hover:bg-gray-100 transition-colors text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Banner livraison offerte ──────────────────────────── */}
            {items.length > 0 && (
              <div className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold
                              flex-shrink-0 transition-colors
                              ${deliveryFee === 0
                                ? 'bg-green-50 text-green-700'
                                : 'bg-orange-50 text-orange-700'}`}>
                <Tag size={12} />
                {deliveryFee === 0
                  ? '🎉 Livraison offerte sur cette commande !'
                  : `Livraison offerte dès ${FCFA(25000)} — il manque ${FCFA(25000 - total)}`
                }
              </div>
            )}

            {/* ── Liste articles ────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (

                /* Panier vide */
                <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center">
                  <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center">
                    <ShoppingBag size={40} strokeWidth={1} className="text-gray-300" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-700 mb-1">Votre panier est vide</p>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Découvrez nos produits artisanaux et ajoutez vos favoris.
                    </p>
                  </div>
                  <Link
                    to="/products"
                    onClick={() => dispatch(closeCart())}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white
                               text-sm font-bold rounded-2xl hover:bg-orange-600
                               transition-colors shadow-lg shadow-orange-200"
                  >
                    Explorer le catalogue <ArrowRight size={15} />
                  </Link>
                </div>

              ) : (
                <ul className="px-5 py-3 space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map(item => {
                      const src = imgUrl(item.main_image)
                      return (
                        <motion.li
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex gap-3 p-3 bg-gray-50 rounded-2xl
                                     hover:bg-orange-50/50 transition-colors group"
                        >
                          {/* Image */}
                          <div className="w-18 h-18 w-[72px] h-[72px] rounded-xl overflow-hidden
                                          bg-white flex-shrink-0 border border-gray-100 shadow-sm">
                            {src
                              ? <img src={src} alt={item.name}
                                     className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center
                                                text-xl bg-amber-50">
                                  🛒
                                </div>
                            }
                          </div>

                          {/* Infos */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 line-clamp-2
                                          leading-snug mb-1 group-hover:text-orange-700
                                          transition-colors">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-400 mb-2">
                              {FCFA(item.price)} / unité
                            </p>

                            <div className="flex items-center justify-between">
                              {/* Quantité */}
                              <div className="flex items-center gap-1 bg-white rounded-xl
                                              border border-gray-200 p-0.5">
                                <button
                                  onClick={() => dispatch(updateQuantity({
                                    id: item.id,
                                    quantity: item.quantity - 1
                                  }))}
                                  className="w-7 h-7 rounded-lg hover:bg-orange-50
                                             hover:text-orange-500 flex items-center
                                             justify-center transition-colors text-gray-600"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="text-sm font-bold text-gray-800
                                                 w-6 text-center tabular-nums">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => dispatch(updateQuantity({
                                    id: item.id,
                                    quantity: item.quantity + 1
                                  }))}
                                  className="w-7 h-7 rounded-lg hover:bg-orange-50
                                             hover:text-orange-500 flex items-center
                                             justify-center transition-colors text-gray-600"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Sous-total */}
                                <span className="text-sm font-bold text-orange-600">
                                  {FCFA(item.price * item.quantity)}
                                </span>
                                {/* Supprimer */}
                                <button
                                  onClick={() => dispatch(removeItem(item.id))}
                                  className="w-7 h-7 rounded-lg hover:bg-red-100
                                             flex items-center justify-center
                                             transition-colors text-gray-300
                                             hover:text-red-500"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* ── Footer récapitulatif ──────────────────────────────── */}
            <AnimatePresence>
              {items.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex-shrink-0 border-t border-gray-100 bg-white px-5 py-4"
                >
                  {/* Lignes récap */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Sous-total ({itemCount} article{itemCount !== 1 ? 's' : ''})</span>
                      <span className="font-medium text-gray-800">{FCFA(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Livraison</span>
                      {deliveryFee === 0
                        ? <span className="text-green-600 font-semibold">Offerte 🎉</span>
                        : <span className="font-medium text-gray-800">{FCFA(deliveryFee)}</span>
                      }
                    </div>
                    <div className="flex justify-between items-center pt-2
                                    border-t border-gray-100">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-xl font-black text-orange-600">
                        {FCFA(grandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/checkout"
                      onClick={() => dispatch(closeCart())}
                      className="flex items-center justify-center gap-2 w-full py-3.5
                                 bg-orange-500 hover:bg-orange-600 text-white text-sm
                                 font-bold rounded-2xl transition-all duration-150
                                 shadow-lg shadow-orange-200 hover:shadow-orange-300
                                 hover:-translate-y-0.5"
                    >
                      Commander maintenant <ArrowRight size={16} />
                    </Link>
                    <button
                      onClick={() => dispatch(closeCart())}
                      className="w-full py-3 text-sm font-semibold text-gray-500
                                 hover:text-gray-700 hover:bg-gray-50 rounded-2xl
                                 transition-colors"
                    >
                      Continuer mes achats
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}