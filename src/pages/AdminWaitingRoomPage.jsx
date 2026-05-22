import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EcoBackground from '@/components/ui/EcoBackground'
import ParticipantList from '@/components/quiz/ParticipantList'
import { useParticipants } from '@/hooks/useParticipants'
import { useSession } from '@/hooks/useSession'
import { useToast } from '@/contexts/ToastContext'
import {
  fetchQuestionsForQuiz,
  startLiveQuiz,
} from '@/services/liveQuizService'
import { SESSION_STATUS, ROUTES } from '@/utils/constants'
import { adminLivePath } from '@/utils/paths'

export default function AdminWaitingRoomPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { session, loading: sessionLoading } = useSession(sessionId)
  const { participants, loading: participantsLoading, count } =
    useParticipants(sessionId)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (session?.status === SESSION_STATUS.ACTIVE) {
      navigate(adminLivePath(sessionId), { replace: true })
    }
    if (session?.status === SESSION_STATUS.ENDED) {
      navigate(ROUTES.QUIZZES)
    }
  }, [session?.status, sessionId, navigate])

  async function handleStartQuiz() {
    if (count === 0) {
      toast.error('Wait for at least one participant to join.')
      return
    }

    setStarting(true)
    try {
      const questions = await fetchQuestionsForQuiz(session.quiz_id)
      await startLiveQuiz(sessionId, questions)
      toast.success('Quiz started!')
      navigate(adminLivePath(sessionId))
    } catch (err) {
      toast.error(err.message || 'Failed to start quiz')
    } finally {
      setStarting(false)
    }
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EcoBackground />
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EcoBackground />
        <div className="glass-strong rounded-3xl p-8 text-center">
          <span className="text-6xl mb-4 block">⚠️</span>
          <h2 className="text-2xl font-bold text-white mb-4">Session not found</h2>
          <Link to={ROUTES.QUIZZES} className="text-emerald-400 hover:text-emerald-300">
            ← Back to quizzes
          </Link>
        </div>
      </div>
    )
  }

  const quizTitle = session.quizzes?.title ?? 'Quiz'
  const isWaiting = session.status === SESSION_STATUS.WAITING

  return (
    <section className="relative min-h-screen py-12">
      <EcoBackground />

      <div className="relative mx-auto max-w-4xl px-4 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            to={ROUTES.QUIZZES}
            className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-2"
          >
            <span>←</span> My quizzes
          </Link>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
            <span>🎯</span>
            Host: <span className="text-gradient">{quizTitle}</span>
          </h1>
          <p className="mt-2 text-lg text-slate-300">
            Share the room code so participants can join the waiting room
          </p>
        </motion.div>

        {/* Room Code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-3xl p-8 text-center border-2 border-emerald-500/30"
        >
          <p className="text-sm text-emerald-300 font-semibold mb-3 uppercase tracking-wide">
            Room Code
          </p>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="font-mono text-6xl font-bold text-white tracking-[0.3em] mb-2"
          >
            {session.session_code}
          </motion.div>
          <p className="text-slate-400 text-sm">Share this code with participants</p>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-strong rounded-3xl p-6 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-4xl">👥</span>
              <h3 className="text-xl font-bold text-white">Participants</h3>
            </div>
            <motion.p
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl font-bold text-gradient"
            >
              {count}
            </motion.p>
            <p className="mt-2 text-sm text-slate-400">joined</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-strong rounded-3xl p-6 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-4xl">🟢</span>
              <h3 className="text-xl font-bold text-white">Status</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-400 capitalize">
              {session.status}
            </p>
            <p className="mt-2 text-sm text-slate-400">Current state</p>
          </motion.div>
        </div>

        {/* Participants List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-strong rounded-3xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">👥</span>
            <div>
              <h2 className="text-2xl font-bold text-white">Waiting Room</h2>
              <p className="text-slate-400">Updates in realtime as players join</p>
            </div>
          </div>
          <ParticipantList
            participants={participants}
            loading={participantsLoading}
          />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-4"
        >
          {isWaiting && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleStartQuiz}
                disabled={starting || count === 0}
                className="eco-gradient text-white font-bold px-8 py-4 rounded-xl shadow-2xl shadow-emerald-500/50"
              >
                {starting ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ⏳
                    </motion.span>
                    Starting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>🚀</span>
                    Start Quiz
                  </span>
                )}
              </Button>
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="secondary"
              onClick={() => navigate(ROUTES.QUIZZES)}
              className="glass-strong px-8 py-4 rounded-xl hover:bg-white/20"
            >
              <span className="flex items-center gap-2">
                <span>✔️</span>
                Done
              </span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
