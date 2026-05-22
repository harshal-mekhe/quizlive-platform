import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import EcoBackground from '@/components/ui/EcoBackground'
import AnimatedGlobe from '@/components/ui/AnimatedGlobe'
import { useToast } from '@/contexts/ToastContext'
import { joinSession } from '@/services/participantService'
import { validateRoomCode } from '@/services/sessionService'
import { normalizeRoomCode, ROOM_CODE_LENGTH } from '@/utils/roomCode'
import { saveParticipantSession } from '@/utils/participantStorage'
import { waitingPath } from '@/utils/paths'
import { getParticipantSession } from '@/utils/participantStorage'
import { ROUTES } from '@/utils/constants'

export default function JoinPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const stored = getParticipantSession()
  const [roomCode, setRoomCode] = useState(stored?.roomCode ?? '')
  const [nickname, setNickname] = useState(stored?.nickname ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = getParticipantSession()
    if (saved?.roomCode) {
      setRoomCode(saved.roomCode)
      setNickname(saved.nickname ?? '')
    }
  }, [])

  function handleCodeChange(e) {
    setRoomCode(normalizeRoomCode(e.target.value))
  }

  function resumeWaitingRoom() {
    if (stored?.sessionId) {
      navigate(waitingPath(stored.sessionId))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const { valid, error: validationError, session, sessionCode } =
        await validateRoomCode(roomCode)

      if (!valid) {
        setError(validationError)
        return
      }

      if (!nickname.trim() || nickname.trim().length < 2) {
        setError('Nickname must be at least 2 characters.')
        return
      }

      const participant = await joinSession({
        sessionId: session.id,
        nickname: nickname.trim(),
      })

      saveParticipantSession({
        participantId: participant.id,
        sessionId: session.id,
        nickname: participant.nickname,
        roomCode: sessionCode,
      })

      toast.success('Joined the waiting room!')
      navigate(waitingPath(session.id))
    } catch (err) {
      setError(err.message || 'Could not join the room')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden py-12 sm:py-20">
      <EcoBackground />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4"
              >
                <span className="text-2xl">🌍</span>
                <span className="text-sm font-medium text-emerald-300">
                  Join the Movement
                </span>
              </motion.div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Enter the <span className="text-gradient">Eco Arena</span>
              </h1>
              <p className="text-lg text-slate-300">
                Enter your room code and nickname to join the pollution awareness quiz
              </p>
            </div>

            {stored?.sessionId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 glass-strong rounded-2xl p-6 border-2 border-emerald-500/30"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">⏱️</span>
                  <p className="text-emerald-300 font-medium">
                    You have an active session!
                  </p>
                </div>
                <Button
                  className="w-full eco-gradient text-white font-semibold rounded-xl"
                  onClick={resumeWaitingRoom}
                >
                  🔙 Return to Waiting Room
                </Button>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-strong rounded-3xl p-8 backdrop-blur-2xl"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="mb-3 block text-sm font-semibold text-emerald-300 uppercase tracking-wide">
                    🔑 Room Code
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    value={roomCode}
                    onChange={handleCodeChange}
                    maxLength={ROOM_CODE_LENGTH}
                    placeholder="ABC123"
                    className="w-full rounded-2xl border-2 border-emerald-500/30 glass-strong px-6 py-5 text-center font-mono text-3xl tracking-[0.3em] text-white uppercase placeholder:tracking-normal placeholder:font-sans placeholder:text-lg focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all"
                    autoComplete="off"
                    required
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-cyan-300 uppercase tracking-wide">
                    👤 Your Nickname
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Eco Warrior"
                    maxLength={24}
                    className="w-full rounded-2xl border-2 border-cyan-500/30 glass-strong px-6 py-4 text-lg text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/30 transition-all"
                    required
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-red-500/20 border border-red-500/50 px-4 py-3 text-sm text-red-300 flex items-center gap-2"
                  >
                    <span>⚠️</span>
                    {error}
                  </motion.div>
                )}

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full eco-gradient text-white font-bold text-lg py-5 rounded-2xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all duration-300"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          ⏳
                        </motion.span>
                        Joining...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        🚀 Join Waiting Room
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-center text-sm text-slate-400"
            >
              <Link
                to={ROUTES.HOME}
                className="hover:text-emerald-400 transition-colors inline-flex items-center gap-2"
              >
                ← Back to Home
              </Link>
            </motion.p>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:flex flex-col items-center justify-center"
          >
            <AnimatedGlobe size="lg" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-12 text-center"
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                🌟 Ready to Compete?
              </h3>
              <p className="text-slate-300 max-w-md">
                Test your environmental knowledge and climb the leaderboard!
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
