import { motion } from 'framer-motion'

const podiumOrder = [1, 0, 2]
const heights = ['h-28', 'h-40', 'h-24']
const medals = ['🥇', '🥈', '🥉']

export default function Podium({ entries }) {
  const top3 = entries.slice(0, 3)
  const ordered = podiumOrder.map((i) => top3[i]).filter(Boolean)

  return (
    <div className="space-y-10">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-3xl font-bold text-white sm:text-4xl"
      >
        Final results
      </motion.h2>

      <div className="flex items-end justify-center gap-3 px-2 sm:gap-6">
        {ordered.map((player, displayIndex) => {
          const rank = player.rank
          const heightClass = heights[displayIndex] ?? 'h-20'

          return (
            <motion.div
              key={player.participantId}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: displayIndex * 0.15, type: 'spring' }}
              className="flex flex-1 max-w-[140px] flex-col items-center"
            >
              <span className="mb-2 text-3xl">{medals[rank - 1] ?? '🏅'}</span>
              <p className="mb-3 truncate text-center text-sm font-semibold text-white sm:text-base">
                {player.nickname}
              </p>
              <div
                className={`flex w-full flex-col items-center justify-end rounded-t-2xl border border-slate-700 bg-gradient-to-t from-slate-900 to-slate-800 ${heightClass}`}
              >
                <span className="pb-3 font-mono text-xl font-bold text-brand-400">
                  {player.score}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">#{rank}</p>
            </motion.div>
          )
        })}
      </div>

      {entries.length > 3 && (
        <ul className="mx-auto max-w-md space-y-2">
          {entries.slice(3).map((entry) => (
            <li
              key={entry.participantId}
              className="flex justify-between rounded-lg border border-slate-800 px-4 py-2 text-sm"
            >
              <span className="text-slate-300">
                #{entry.rank} {entry.nickname}
              </span>
              <span className="font-mono text-brand-400">{entry.score}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
