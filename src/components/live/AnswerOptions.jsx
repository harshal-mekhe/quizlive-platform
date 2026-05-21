import { motion } from 'framer-motion'
import { memo } from 'react'

function AnswerOptions({
  options = [],
  selected,
  onSelect,
  disabled,
  correctAnswer,
  showResults,
}) {
  const letters = ['A', 'B', 'C', 'D']

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {options.map((option, index) => {
        const isSelected = selected === option
        const isCorrect = showResults && option === correctAnswer
        const isWrong = showResults && isSelected && option !== correctAnswer

        let style =
          'border-slate-700 bg-slate-900/60 hover:border-brand-500/50 hover:bg-slate-800/80'
        if (isSelected && !showResults) {
          style = 'border-brand-500 bg-brand-500/15 ring-2 ring-brand-500/30'
        }
        if (isCorrect) style = 'border-emerald-500 bg-emerald-500/15'
        if (isWrong) style = 'border-red-500/80 bg-red-500/10'

        return (
          <motion.li
            key={`${index}-${option}`}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(option)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${style}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold text-brand-400">
                {letters[index]}
              </span>
              <span className="font-medium text-white">{option}</span>
            </button>
          </motion.li>
        )
      })}
    </ul>
  )
}

export default memo(AnswerOptions)
