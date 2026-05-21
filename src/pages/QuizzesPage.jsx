import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import QuizCard from '@/components/quiz/QuizCard'
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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">My quizzes</h1>
          <p className="mt-1 text-slate-400">Create, edit, and host live quiz rooms</p>
        </div>
        <Link to={ROUTES.QUIZ_NEW}>
          <Button>+ Create quiz</Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No quizzes yet"
          description="Create your first quiz with questions and answer options, then host a live room."
          actionLabel="Create quiz"
          onAction={() => navigate(ROUTES.QUIZ_NEW)}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onHost={handleHost}
              onDelete={setDeleteTarget}
              hosting={hostingId === quiz.id}
            />
          ))}
        </div>
      )}

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
