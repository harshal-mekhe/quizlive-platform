import { motion } from 'framer-motion'

export default function QuizTimer({ remainingSeconds, progress, urgent }) {
  const color = urgent
    ? 'text-red-400'
    : remainingSeconds <= 5
      ? 'text-amber-400'
      : 'text-brand-300'

  return (
    <div className="w-full max-w-xs">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-400">Time left</span>
        <motion.span
          key={remainingSeconds}
          initial={{ scale: 1.2, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`font-mono text-2xl font-bold tabular-nums ${color}`}
        >
          {remainingSeconds}s
        </motion.span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className={`h-full rounded-full ${urgent ? 'bg-red-500' : 'bg-gradient-to-r from-brand-500 to-indigo-500'}`}
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.25, ease: 'linear' }}
        />
      </div>
    </div>
  )
}
