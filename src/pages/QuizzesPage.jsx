import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import QuizCard from '@/components/quiz/QuizCard'
import EcoBackground from '@/components/ui/EcoBackground'
import { useToast } from '@/contexts/ToastContext'
import { fetchQuizzes, deleteQuiz } from '@/services/quizService'
import { getOrCreateWaitingSession } from '@/services/sessionService'
import { ROUTES } from '@/utils/constants'
import { adminWaitingPath } from '@/utils/paths'

export default function QuizzesPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [hostingId, setHostingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      try {
        const data = await fetchQuizzes()
        if (mounted) setQuizzes(data)
      } catch (err) {
        toast.error(err.message || 'Failed to load quizzes')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  async function handleHost(quiz) {
    if (!quiz.question_count) {
      toast.error('Add at least one question before hosting.')
      return
    }

    setHostingId(quiz.id)
    try {
      const { session, created } = await getOrCreateWaitingSession(quiz.id)
      toast.success(
        created
          ? `Room ${session.session_code} created!`
          : `Reopened waiting room ${session.session_code}`,
      )
      navigate(adminWaitingPath(session.id))
    } catch (err) {
      toast.error(err.message || 'Failed to create room')
    } finally {
      setHostingId(null)
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteQuiz(deleteTarget.id)
      toast.success('Quiz deleted')
      setDeleteTarget(null)
      const data = await fetchQuizzes()
      setQuizzes(data)
    } catch (err) {
      toast.error(err.message || 'Failed to delete quiz')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="relative overflow-hidden min-h-screen">
      <EcoBackground />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-2">
                <span className="text-gradient">My Quizzes</span>
              </h1>
              <p className="text-lg text-slate-300">
                Create, edit, and host live quiz rooms
              </p>
            </div>
            <Link to={ROUTES.QUIZ_NEW}>
              <Button className="eco-gradient text-white font-semibold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105">
                ✏️ Create quiz
              </Button>
            </Link>
          </motion.div>

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 flex justify-center"
            >
              <LoadingSpinner size="lg" />
            </motion.div>
          ) : quizzes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <EmptyState
                icon="📝"
                title="No quizzes yet"
                description="Create your first quiz with questions and answer options, then host a live room."
                actionLabel="Create quiz"
                onAction={() => navigate(ROUTES.QUIZ_NEW)}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
              className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
            >
              {quizzes.map((quiz, idx) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <QuizCard
                    quiz={quiz}
                    onHost={handleHost}
                    onDelete={setDeleteTarget}
                    hosting={hostingId === quiz.id}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete quiz?"
        message={`"${deleteTarget?.title}" and all its questions will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  )
}
