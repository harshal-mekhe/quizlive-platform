import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import EcoBackground from '@/components/ui/EcoBackground'
import AnimatedGlobe from '@/components/ui/AnimatedGlobe'
import { ROUTES } from '@/utils/constants'

export default function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth()

  const features = [
    {
      icon: '🌍',
      title: 'Learn & Compete',
      desc: 'Test your pollution awareness in real-time competitive quizzes',
    },
    {
      icon: '🏆',
      title: 'Live Leaderboards',
      desc: 'Climb the ranks and showcase your environmental knowledge',
    },
    {
      icon: '🌱',
      title: 'Make Impact',
      desc: 'Every quiz completed spreads awareness about our planet',
    },
  ]

  return (
    <section className="relative overflow-hidden min-h-screen">
      <EcoBackground />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:py-28">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6"
            >
              <span className="text-2xl">🌿</span>
              <span className="text-sm font-medium text-emerald-300">
                Pollution Awareness Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="text-white">Save Our</span>
              <br />
              <span className="text-gradient">Planet Together</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl"
            >
              Join the movement! Test your environmental knowledge in real-time
              competitive quizzes. Learn about pollution, climate change, and
              sustainability while competing with others.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to={ROUTES.JOIN}>
                <Button
                  size="lg"
                  className="eco-gradient text-white font-semibold px-8 py-4 rounded-2xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all duration-300 hover:scale-105"
                >
                  🎮 Join Quiz Now
                </Button>
              </Link>
              {isAuthenticated && isAdmin ? (
                <Link to={ROUTES.DASHBOARD}>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="glass-strong px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300"
                  >
                    📊 Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to={ROUTES.SIGNUP}>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="glass-strong px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300"
                  >
                    🎯 Host Quiz
                  </Button>
                </Link>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 grid grid-cols-3 gap-6"
            >
              {[
                { value: '10K+', label: 'Players' },
                { value: '500+', label: 'Quizzes' },
                { value: '95%', label: 'Engagement' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex justify-center lg:justify-end"
          >
            <AnimatedGlobe size="xl" />
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-24 grid sm:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-strong rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 group"
            >
              <motion.div
                className="text-5xl mb-4"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gradient transition-all">
                {feature.title}
              </h3>
              <p className="text-slate-300 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-24 text-center glass-strong rounded-3xl p-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of eco-warriors learning about pollution and climate action
          </p>
          <Link to={ROUTES.JOIN}>
            <Button
              size="lg"
              className="eco-gradient text-white font-semibold px-12 py-5 rounded-2xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all duration-300 hover:scale-105"
            >
              🚀 Start Your Journey
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
