import { motion, AnimatePresence } from 'framer-motion'
import { LIVE_PHASE } from '@/utils/constants'

const labels = {
  [LIVE_PHASE.REVEAL]: { text: 'Correct answer revealed', color: 'text-amber-300' },
  [LIVE_PHASE.LEADERBOARD]: { text: 'Leaderboard updating…', color: 'text-brand-300' },
  [LIVE_PHASE.PODIUM]: { text: 'Quiz complete!', color: 'text-emerald-300' },
}

export default function PhaseBanner({ livePhase }) {
  const info = labels[livePhase]
  if (!info) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-center text-sm font-medium ${info.color}`}
      >
        {info.text}
      </motion.div>
    </AnimatePresence>
  )
}
