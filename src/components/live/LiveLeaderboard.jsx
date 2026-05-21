import { AnimatePresence, motion } from 'framer-motion'
import { memo } from 'react'

function LiveLeaderboard({ entries, highlightId, title = 'Leaderboard' }) {
  return (
    <div className="space-y-4">
      <h3 className="text-center text-lg font-semibold text-white">{title}</h3>
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {entries.map((entry) => (
            <motion.li
              key={entry.participantId}
              layout
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
                entry.participantId === highlightId
                  ? 'border-brand-500/50 bg-brand-500/10'
                  : 'border-slate-800 bg-slate-900/50'
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
                  entry.rank === 1
                    ? 'bg-amber-500/20 text-amber-300'
                    : entry.rank === 2
                      ? 'bg-slate-500/30 text-slate-200'
                      : entry.rank === 3
                        ? 'bg-orange-900/40 text-orange-300'
                        : 'bg-slate-800 text-slate-400'
                }`}
              >
                #{entry.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{entry.nickname}</p>
              </div>
              <span className="font-mono text-lg font-bold text-brand-400">
                {entry.score}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}

export default memo(LiveLeaderboard)
