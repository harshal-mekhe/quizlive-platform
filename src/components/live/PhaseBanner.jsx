import { motion, AnimatePresence } from 'framer-motion'
import { LIVE_PHASE } from '@/utils/constants'

const labels = {
  [LIVE_PHASE.REVEAL]: { 
    text: '✅ Correct Answer Revealed', 
    icon: '💡',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/50'
  },
  [LIVE_PHASE.LEADERBOARD]: { 
    text: '📈 Leaderboard Updating', 
    icon: '🏆',
    gradient: 'from-emerald-500 to-cyan-500',
    glow: 'shadow-emerald-500/50'
  },
  [LIVE_PHASE.PODIUM]: { 
    text: '🎉 Quiz Complete!', 
    icon: '🎆',
    gradient: 'from-purple-500 to-pink-500',
    glow: 'shadow-purple-500/50'
  },
}

export default function PhaseBanner({ livePhase }) {
  const info = labels[livePhase]
  if (!info) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${info.gradient} p-1 shadow-2xl ${info.glow}`}
      >
        <div className="glass-strong rounded-xl px-6 py-4 backdrop-blur-xl">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="flex items-center justify-center gap-3 text-white"
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              {info.icon}
            </motion.span>
            <span className="text-lg font-bold">{info.text}</span>
          </motion.div>
        </div>

        {/* Animated shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.div>
    </AnimatePresence>
  )
}
