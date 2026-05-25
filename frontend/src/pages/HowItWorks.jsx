import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  UserPlus, Search, ShoppingCart, CreditCard,
  Truck, Star, Store, Package, BarChart,
  CheckCircle, ArrowRight, Phone, Mail,
  Shield, RefreshCcw, Clock
} from 'lucide-react'

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  whileInView:{ opacity: 1, y: 0  },
  viewport:   { once: true        },
  transition: { duration: 0.4, delay },
})

export default function HowItWorks() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* ════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-10 md:py-20"
        style={{ background: 'linear-gradient(135deg, #111827 0%, #1a2e1f 50%, #2D6A4F 100%)' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8732A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp()}>
            <span className="inline-flex items-center gap-2 bg-orange-500/10 border
                             border-orange-500/20 text-orange-400 text-xs font-semibold
                             tracking-wider uppercase px-4 py-2 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
              Guide complet
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white
                           leading-tight mb-4">
              Comment ça marche ?
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
              Sahel Market connecte les artisans du Sahel aux acheteurs
              à travers tout le pays. Simple, rapide, sécurisé.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          TABS — CLIENT / ARTISAN
      ════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── SECTION CLIENT ─────────────────────────────────── */}
        <motion.div {...fadeUp(0)}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center
                            justify-center shadow-md shadow-orange-200">
              <ShoppingCart size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Pour les acheteurs
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Trouvez et achetez des produits artisanaux authentiques en quelques clics
              </p>
            </div>
          </div>
        </motion.div>

        <div className="relative mb-16">
          {/* Ligne de connexion */}
          <div className="hidden md:block absolute top-8 left-8 right-8 h-0.5
                          bg-gradient-to-r from-orange-200 via-orange-300 to-orange-200
                          z-0" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            {[
              {
                icon:  UserPlus,
                step:  '01',
                title: 'Créez votre compte',
                desc:  'Inscrivez-vous gratuitement en moins de 2 minutes avec votre email.',
                color: 'bg-orange-500',
              },
              {
                icon:  Search,
                step:  '02',
                title: 'Explorez le catalogue',
                desc:  'Parcourez les catégories ou recherchez un produit précis.',
                color: 'bg-orange-500',
              },
              {
                icon:  CreditCard,
                step:  '03',
                title: 'Payez en toute sécurité',
                desc:  'Orange Money ou MTN Mobile Money. Paiement sécurisé en FCFA.',
                color: 'bg-orange-500',
              },
              {
                icon:  Truck,
                step:  '04',
                title: 'Recevez votre colis',
                desc:  'Suivi de livraison en temps réel jusqu\'à votre porte.',
                color: 'bg-orange-500',
              },
            ].map(({ icon: Icon, step, title, desc, color }, i) => (
              <motion.div key={step} {...fadeUp(i * 0.1)}>
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 ${color} rounded-2xl flex items-center
                                   justify-center shadow-lg shadow-orange-200 mb-4
                                   relative z-10 border-4 border-white`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <span className="text-xs font-black text-orange-400 tracking-widest mb-1">
                    ÉTAPE {step}
                  </span>
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── AVANTAGES CLIENT ───────────────────────────────── */}
        <motion.div {...fadeUp(0.1)}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {[
            {
              icon:  Shield,
              title: 'Achat protégé',
              desc:  'Si votre commande n\'arrive pas conforme, nous vous remboursons.',
              color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100',
            },
            {
              icon:  RefreshCcw,
              title: 'Retour facile',
              desc:  'Vous avez 7 jours pour retourner un article qui ne vous convient pas.',
              color: 'text-blue-600',  bg: 'bg-blue-50',  border: 'border-blue-100',
            },
            {
              icon:  Clock,
              title: 'Support réactif',
              desc:  'Notre équipe répond à vos questions du lundi au samedi, de 8h à 18h.',
              color: 'text-orange-500',bg: 'bg-orange-50',border: 'border-orange-100',
            },
          ].map(({ icon: Icon, title, desc, color, bg, border }) => (
            <div key={title}
              className={`${bg} border ${border} rounded-2xl p-5 flex gap-4`}>
              <div className={`w-10 h-10 bg-white rounded-xl flex items-center
                               justify-center flex-shrink-0 shadow-sm border ${border}`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm mb-1">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Séparateur */}
        <div className="border-t border-dashed border-gray-200 mb-16" />

        {/* ── SECTION ARTISAN ────────────────────────────────── */}
        <motion.div {...fadeUp(0)}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center
                            justify-center shadow-md shadow-green-200">
              <Store size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Pour les artisans
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Vendez vos créations et développez votre activité
              </p>
            </div>
          </div>
        </motion.div>

        <div className="relative mb-16">
          <div className="hidden md:block absolute top-8 left-8 right-8 h-0.5
                          bg-gradient-to-r from-green-200 via-green-300 to-green-200
                          z-0" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            {[
              {
                icon:  UserPlus,
                step:  '01',
                title: 'Inscription gratuite',
                desc:  'Créez votre compte artisan. Un agent Sahel Market vous contacte sous 48h.',
                color: 'bg-green-600',
              },
              {
                icon:  Package,
                step:  '02',
                title: 'Ajout de vos produits',
                desc:  'Notre agent vous aide à photographier et mettre en ligne vos créations.',
                color: 'bg-green-600',
              },
              {
                icon:  ShoppingCart,
                step:  '03',
                title: 'Recevez des commandes',
                desc:  'Vous êtes notifié à chaque nouvelle commande passée sur votre boutique.',
                color: 'bg-green-600',
              },
              {
                icon:  BarChart,
                step:  '04',
                title: 'Suivez vos ventes',
                desc:  'Tableau de bord complet : ventes, revenus, produits les plus consultés.',
                color: 'bg-green-600',
              },
            ].map(({ icon: Icon, step, title, desc, color }, i) => (
              <motion.div key={step} {...fadeUp(i * 0.1)}>
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 ${color} rounded-2xl flex items-center
                                   justify-center shadow-lg shadow-green-200 mb-4
                                   relative z-10 border-4 border-white`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <span className="text-xs font-black text-green-600 tracking-widest mb-1">
                    ÉTAPE {step}
                  </span>
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── AVANTAGES ARTISAN ──────────────────────────────── */}
        <motion.div {...fadeUp(0.1)}
          className="bg-gradient-to-br from-gray-900 to-green-900 rounded-3xl p-8 mb-16">
          <h3 className="text-white font-bold text-xl mb-6 text-center">
            Pourquoi rejoindre Sahel Market ?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Inscription et mise en ligne 100% gratuite',
              'Un agent terrain vous accompagne personnellement',
              'Paiements sécurisés et reversements réguliers',
              'Visibilité auprès d\'acheteurs dans tout le pays',
              'Tableau de bord simple pour suivre vos ventes',
              'Support disponible du lundi au samedi',
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp(i * 0.05)}
                className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center
                                justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle size={12} className="text-white" />
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{item}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── FAQ ────────────────────────────────────────────── */}
        <motion.div {...fadeUp(0)} className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Est-ce que l\'inscription est vraiment gratuite ?',
                a: 'Oui, l\'inscription est totalement gratuite pour les acheteurs comme pour les artisans. Sahel Market prend une commission uniquement sur les ventes réalisées.',
              },
              {
                q: 'Comment se passe la livraison ?',
                a: 'La livraison est assurée par nos partenaires logistiques. Vous pouvez suivre votre colis en temps réel depuis votre espace client. Les délais varient selon votre localisation.',
              },
              {
                q: 'Quels moyens de paiement sont acceptés ?',
                a: 'Nous acceptons Orange Money et MTN Mobile Money. Tous les paiements sont sécurisés et effectués en FCFA, sans carte bancaire.',
              },
              {
                q: 'Je suis artisan, comment mettre mes produits en ligne ?',
                a: 'Inscrivez-vous en tant qu\'artisan. Un agent Sahel Market vous contactera sous 48h pour vous accompagner dans la mise en ligne de vos produits. Nous nous occupons des photos et des descriptions si nécessaire.',
              },
              {
                q: 'Que faire si je reçois un produit endommagé ?',
                a: 'Contactez-nous dans les 48h suivant la réception via email à sahelmarket@gmail.com ou au +237 680 757 871. Nous traitons chaque litige individuellement et proposons un remboursement ou un renvoi du produit.',
              },
              {
                q: 'Comment sont vérifiés les artisans ?',
                a: 'Chaque artisan est visité et validé par un agent Sahel Market sur le terrain avant que ses produits apparaissent sur la plateforme. Nous vérifions l\'identité, la qualité des produits et les conditions de fabrication.',
              },
            ].map(({ q, a }, i) => (
              <motion.div key={i} {...fadeUp(i * 0.05)}
                className="bg-white rounded-2xl border border-gray-100 p-6
                           hover:border-orange-200 hover:shadow-md transition-all">
                <h4 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-500
                                   text-xs font-black flex items-center justify-center
                                   flex-shrink-0 mt-0.5">
                    ?
                  </span>
                  {q}
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed pl-7">{a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA FINAL ──────────────────────────────────────── */}
        <motion.div {...fadeUp(0.1)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="bg-orange-50 border border-orange-100 rounded-3xl p-8 text-center">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center
                              justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
                <ShoppingCart size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                Je veux acheter
              </h3>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Découvrez des centaines de produits artisanaux authentiques.
              </p>
              <Link to="/products"
                className="inline-flex items-center justify-center gap-2 w-full py-3
                           bg-orange-500 hover:bg-orange-600 text-white font-bold
                           rounded-2xl transition-colors text-sm">
                Explorer le catalogue <ArrowRight size={15} />
              </Link>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-3xl p-8 text-center">
              <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center
                              justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                <Store size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                Je suis artisan
              </h3>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Rejoignez la plateforme et vendez vos créations partout au pays.
              </p>
              <Link to="/register"
                className="inline-flex items-center justify-center gap-2 w-full py-3
                           bg-green-600 hover:bg-green-700 text-white font-bold
                           rounded-2xl transition-colors text-sm">
                S'inscrire gratuitement <ArrowRight size={15} />
              </Link>
            </div>

          </div>

          {/* Contact direct */}
          <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-5
                          flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                Une question ? On vous répond rapidement.
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Du lundi au samedi, de 8h à 18h
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="mailto:sahelmarket@gmail.com"
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border
                           border-gray-200 rounded-xl text-sm font-semibold text-gray-700
                           hover:border-orange-300 hover:text-orange-600 transition-colors">
                <Mail size={15} className="text-orange-500" />
                sahelmarket@gmail.com
              </a>
              <a href="tel:+237680757871"
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-500
                           rounded-xl text-sm font-bold text-white
                           hover:bg-orange-600 transition-colors">
                <Phone size={15} />
                +237 680 757 871
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  )
}