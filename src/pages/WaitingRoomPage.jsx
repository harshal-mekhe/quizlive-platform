import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EcoBackground from '@/components/ui/EcoBackground'
import AnimatedGlobe from '@/components/ui/AnimatedGlobe'
import { useParticipants } from '@/hooks/useParticipants'
import { useSession } from '@/hooks/useSession'
import { getParticipantSession } from '@/utils/participantStorage'
import { SESSION_STATUS, ROUTES } from '@/utils/constants'
import { playPath, resultsPath } from '@/utils/paths'

export default function WaitingRoomPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const stored = getParticipantSession()
  const { session, loading: sessionLoading } = useSession(sessionId)
  const { participants, loading: participantsLoading, count } =
    useParticipants(sessionId)

  useEffect(() => {
    if (!stored || stored.sessionId !== sessionId) {
      navigate(ROUTES.JOIN, { replace: true })
    }
  }, [stored, sessionId, navigate])

  useEffect(() => {
    if (!session) return

    if (session.status === SESSION_STATUS.ACTIVE) {
      navigate(playPath(sessionId), { replace: true })
    }

    if (session.status === SESSION_STATUS.ENDED) {
      navigate(resultsPath(sessionId), { replace: true })
    }
  }, [session?.status, sessionId, navigate])

  if (!stored || stored.sessionId !== sessionId) {
    return null
  }

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const quizTitle = session?.quizzes?.title ?? 'Pollution Awareness Quiz'

  return (
    <section className="relative overflow-hidden min-h-screen py-10 sm:py-16">
      <EcoBackground />

      <div className="relative mx-auto max-w-5xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full mb-6"
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              ⏳
            </motion.span>
            <span className="text-lg font-bold text-emerald-300">
              Waiting for Host...
            </span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {quizTitle}
          </h1>
          <p className="text-xl text-slate-300">
            Welcome,{' '}
            <span className="text-gradient font-bold">{stored.nickname}</span>!
          </p>
          <p className="text-slate-400 mt-2">
            Get ready to test your environmental knowledge
          </p>
        </motion.div>

        {/* Room Code Display */}
        {stored.roomCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-12"
          >
            <div className="glass-strong rounded-3xl px-12 py-6 border-2 border-emerald-500/30">
              <p className="text-sm text-emerald-300 font-semibold mb-2 text-center">
                ROOM CODE
              </p>
              <div className="font-mono text-5xl font-bold text-white tracking-[0.3em] text-center">
                {stored.roomCode}
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Participants List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-strong rounded-3xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span>👥</span>
                Eco Warriors
              </h2>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="glass px-4 py-2 rounded-full"
              >
                <span className="text-emerald-400 font-bold text-lg">{count}</span>
              </motion.div>
            </div>

            {participantsLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                  {participants.map((participant, index) => {
                    const isYou = participant.id === stored.participantId
                    return (
                      <motion.div
                        key={participant.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                          isYou
                            ? 'bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 border-2 border-emerald-400/50'
                            : 'glass hover:bg-white/10'
                        }`}
                      >
                        <motion.div
                          animate={{
                            rotate: isYou ? [0, 360] : 0,
                          }}
                          transition={{
                            duration: 3,
                            repeat: isYou ? Infinity : 0,
                            ease: 'linear',
                          }}
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                            isYou ? 'bg-emerald-500' : 'bg-cyan-500/50'
                          }`}
                        >
                          {isYou ? '⭐' : '🌱'}
                        </motion.div>
                        <div className="flex-1">
                          <p className="font-semibold text-white flex items-center gap-2">
                            {participant.nickname}
                            {isYou && (
                              <span className="text-xs bg-emerald-500 px-2 py-1 rounded-full">
                                YOU
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-slate-400">
                            Joined {new Date(participant.joined_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Right Side - Globe & Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Globe */}
            <div className="flex justify-center">
              <AnimatedGlobe size="lg" />
            </div>

            {/* Info Cards */}
            <div className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass-strong rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">🎯</span>
                  <h3 className="text-lg font-bold text-white">How to Play</h3>
                </div>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    Answer questions before time runs out
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    Faster correct answers earn more points
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    Climb the leaderboard to win!
                  </li>
                </ul>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass-strong rounded-2xl p-6 border-2 border-cyan-500/30"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">🌍</span>
                  <h3 className="text-lg font-bold text-white">Did You Know?</h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Every year, 8 million tons of plastic waste enters our oceans.
                  Let's learn how to make a difference!
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-slate-400 flex items-center justify-center gap-2"
          >
            <span>⏳</span>
            The quiz will start automatically when the host is ready
          </motion.p>
        </motion.div>
      </div>

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
    </section>
  )
}
