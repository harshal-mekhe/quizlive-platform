import { motion } from 'framer-motion'

const podiumOrder = [1, 0, 2]
const heights = ['h-32', 'h-48', 'h-28']
const medals = ['🥇', '🥈', '🥉']

export default function Podium({ entries }) {
  const top3 = entries.slice(0, 3)
  const ordered = podiumOrder.map((i) => top3[i]).filter(Boolean)

  return (
    <div className="space-y-12">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.h2
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="text-4xl sm:text-5xl font-bold text-gradient mb-4"
        >
          🏆 Final Results
        </motion.h2>
        <p className="text-slate-300 text-lg">Congratulations to our Eco Champions!</p>
      </motion.div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 sm:gap-8 px-4">
        {ordered.map((player, displayIndex) => {
          const rank = player.rank
          const heightClass = heights[displayIndex] ?? 'h-24'
          const isFirst = rank === 1

          return (
            <motion.div
              key={player.participantId}
              initial={{ opacity: 0, y: 100, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: displayIndex * 0.2, 
                type: 'spring',
                stiffness: 200,
                damping: 15
              }}
              className="flex flex-1 max-w-[160px] flex-col items-center"
            >
              {/* Medal */}
              <motion.div
                animate={{
                  rotate: isFirst ? [0, -10, 10, 0] : 0,
                  scale: isFirst ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="mb-4 text-6xl sm:text-7xl"
              >
                {medals[rank - 1] ?? '🏅'}
              </motion.div>

              {/* Player Name */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: displayIndex * 0.2 + 0.3 }}
                className="mb-4 truncate text-center text-base sm:text-lg font-bold text-white px-2"
              >
                {player.nickname}
              </motion.p>

              {/* Podium Block */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                transition={{ delay: displayIndex * 0.2 + 0.5, type: 'spring' }}
                className={`relative w-full flex flex-col items-center justify-end rounded-t-3xl overflow-hidden ${heightClass} ${
                  rank === 1
                    ? 'bg-gradient-to-t from-yellow-600 via-yellow-500 to-amber-400'
                    : rank === 2
                      ? 'bg-gradient-to-t from-slate-600 via-slate-500 to-slate-400'
                      : 'bg-gradient-to-t from-orange-700 via-orange-600 to-orange-500'
                }`}
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />

                {/* Score */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                  className="relative pb-4 text-center"
                >
                  <p className="font-mono text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
                    {player.score}
                  </p>
                  <p className="text-xs text-white/80 font-semibold">POINTS</p>
                </motion.div>
              </motion.div>

              {/* Rank Label */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: displayIndex * 0.2 + 0.7 }}
                className="mt-3 text-sm font-bold text-slate-400"
              >
                #{rank}
              </motion.p>
            </motion.div>
          )
        })}
      </div>

      {/* Rest of participants */}
      {entries.length > 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mx-auto max-w-2xl"
        >
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            🌟 Other Eco Warriors
          </h3>
          <ul className="space-y-2">
            {entries.slice(3).map((entry, index) => (
              <motion.li
                key={entry.participantId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.05 }}
                className="flex justify-between items-center glass-strong rounded-2xl px-6 py-4 border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 text-white font-bold">
                    #{entry.rank}
                  </span>
                  <span className="text-white font-semibold">{entry.nickname}</span>
                </div>
                <span className="font-mono text-xl font-bold text-gradient">
                  {entry.score}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Celebration Message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center glass-strong rounded-3xl p-8 max-w-2xl mx-auto"
      >
        <p className="text-2xl font-bold text-white mb-2">
          🌍 Thank You for Participating!
        </p>
        <p className="text-slate-300">
          Together we're making a difference in pollution awareness
        </p>
      </motion.div>
    </div>
  )
}
