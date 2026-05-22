import { AnimatePresence, motion } from 'framer-motion'
import { memo } from 'react'

function LiveLeaderboard({ entries, highlightId, title = '🏆 Live Leaderboard' }) {
  return (
    <div className="space-y-6">
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-2xl font-bold text-gradient"
      >
        {title}
      </motion.h3>
      <ul className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        <AnimatePresence initial={false}>
          {entries.map((entry, index) => {
            const isHighlighted = entry.participantId === highlightId
            const isTop3 = entry.rank <= 3
            
            return (
              <motion.li
                key={entry.participantId}
                layout
                initial={{ opacity: 0, x: -30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.9 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 25,
                  delay: index * 0.05 
                }}
                whileHover={{ scale: 1.02, x: 5 }}
                className={`relative flex items-center gap-4 rounded-2xl px-5 py-4 transition-all ${
                  isHighlighted
                    ? 'glass-strong border-2 border-emerald-400 bg-emerald-500/20 ring-4 ring-emerald-500/30'
                    : isTop3
                      ? 'glass-strong border-2 border-cyan-500/30 bg-white/10'
                      : 'glass border border-white/10'
                }`}
              >
                {/* Rank Badge */}
                <motion.div
                  animate={isTop3 ? { rotate: [0, -5, 5, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl font-bold shadow-lg ${
                    entry.rank === 1
                      ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white'
                      : entry.rank === 2
                        ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900'
                        : entry.rank === 3
                          ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                          : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300'
                  }`}
                >
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                </motion.div>

                {/* Player Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-white text-lg flex items-center gap-2">
                    {entry.nickname}
                    {isHighlighted && (
                      <span className="text-xs bg-emerald-500 px-2 py-1 rounded-full">
                        YOU
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-400">
                    {entry.rank === 1 ? '🏆 Champion' : entry.rank === 2 ? '⭐ Runner-up' : entry.rank === 3 ? '🌟 Third Place' : 'Eco Warrior'}
                  </p>
                </div>

                {/* Score */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-right"
                >
                  <p className="font-mono text-2xl font-bold text-gradient">
                    {entry.score}
                  </p>
                  <p className="text-xs text-slate-400">points</p>
                </motion.div>

                {/* Glow effect for top 3 */}
                {isTop3 && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(16, 185, 129, 0.3)',
                        '0 0 40px rgba(16, 185, 129, 0.5)',
                        '0 0 20px rgba(16, 185, 129, 0.3)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.7);
        }
      `}</style>
    </div>
  )
}

export default memo(LiveLeaderboard)
