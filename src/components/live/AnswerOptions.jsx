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
  const colors = [
    { bg: 'from-emerald-500 to-teal-500', ring: 'ring-emerald-500/50' },
    { bg: 'from-cyan-500 to-blue-500', ring: 'ring-cyan-500/50' },
    { bg: 'from-purple-500 to-pink-500', ring: 'ring-purple-500/50' },
    { bg: 'from-amber-500 to-orange-500', ring: 'ring-amber-500/50' },
  ]

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {options.map((option, index) => {
        const isSelected = selected === option
        const isCorrect = showResults && option === correctAnswer
        const isWrong = showResults && isSelected && option !== correctAnswer
        const color = colors[index] || colors[0]

        let baseStyle = 'glass-strong border-2 border-white/10 hover:border-white/30 hover:bg-white/15'
        let iconStyle = `bg-gradient-to-br ${color.bg} text-white`
        
        if (isSelected && !showResults) {
          baseStyle = `glass-strong border-2 border-${color.bg.split(' ')[0].replace('from-', '')}/70 ring-4 ${color.ring} bg-white/20`
        }
        if (isCorrect) {
          baseStyle = 'glass-strong border-2 border-emerald-400 bg-emerald-500/20 ring-4 ring-emerald-500/50'
          iconStyle = 'bg-emerald-500 text-white'
        }
        if (isWrong) {
          baseStyle = 'glass-strong border-2 border-red-400 bg-red-500/20 ring-4 ring-red-500/50'
          iconStyle = 'bg-red-500 text-white'
        }

        return (
          <motion.li
            key={`${index}-${option}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
            whileHover={!disabled ? { scale: 1.03, y: -2 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
          >
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(option)}
              className={`relative flex w-full items-center gap-4 rounded-2xl px-5 py-5 text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 overflow-hidden group ${baseStyle}`}
            >
              {/* Shine effect on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              
              <motion.span
                className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold shadow-lg ${iconStyle}`}
                animate={isSelected && !showResults ? { rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                {showResults ? (
                  isCorrect ? '✅' : isWrong ? '❌' : letters[index]
                ) : (
                  letters[index]
                )}
              </motion.span>
              
              <span className="relative font-semibold text-white text-lg leading-snug flex-1">
                {option}
              </span>

              {/* Selected indicator */}
              {isSelected && !showResults && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-2xl"
                >
                  ✨
                </motion.span>
              )}
            </button>
          </motion.li>
        )
      })}
    </ul>
  )
}

export default memo(AnswerOptions)
