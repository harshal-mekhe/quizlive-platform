import { motion } from 'framer-motion'

export default function AnimatedGlobe({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
    xl: 'w-96 h-96',
  }

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Globe */}
      <motion.div
        className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-2xl shadow-emerald-500/50"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {/* Continents overlay */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3) 0%, transparent 50%),
                               radial-gradient(circle at 70% 60%, rgba(255,255,255,0.2) 0%, transparent 40%)`,
            }}
          />
        </div>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent"
          style={{
            clipPath: 'circle(50% at 30% 30%)',
          }}
        />

        {/* Orbiting particles */}
        {[0, 120, 240].map((angle) => (
          <motion.div
            key={angle}
            className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50"
            style={{
              transformOrigin: '0 0',
            }}
            animate={{
              rotate: [angle, angle + 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: '100px' }} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
