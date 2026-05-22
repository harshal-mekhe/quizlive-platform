import { motion } from 'framer-motion'

export default function CircularTimer({ timeRemaining, totalTime, size = 'md' }) {
  const percentage = (timeRemaining / totalTime) * 100
  const radius = size === 'sm' ? 40 : size === 'md' ? 60 : 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getColor = () => {
    if (percentage > 50) return '#10b981' // emerald
    if (percentage > 25) return '#f59e0b' // amber
    return '#ef4444' // red
  }

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48',
  }

  const textSize = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
  }

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      {/* Background circle */}
      <svg className="absolute inset-0 -rotate-90 transform" width="100%" height="100%">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          fill="none"
        />
        <motion.circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke={getColor()}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'linear' }}
          style={{
            filter: `drop-shadow(0 0 10px ${getColor()})`,
          }}
        />
      </svg>

      {/* Time display */}
      <motion.div
        className={`${textSize[size]} font-bold text-white z-10`}
        animate={{
          scale: timeRemaining <= 5 && timeRemaining > 0 ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 0.5,
          repeat: timeRemaining <= 5 && timeRemaining > 0 ? Infinity : 0,
        }}
      >
        {timeRemaining}
      </motion.div>

      {/* Pulse effect when time is low */}
      {timeRemaining <= 5 && timeRemaining > 0 && (
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-red-500"
          animate={{
            scale: [1, 1.2],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
      )}
    </div>
  )
}
