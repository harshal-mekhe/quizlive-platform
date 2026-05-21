import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ParticipantList from '@/components/quiz/ParticipantList'
import RoomCodeDisplay from '@/components/quiz/RoomCodeDisplay'
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
      <div className="py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return (
      <Card title="Session not found">
        <Link to={ROUTES.QUIZZES} className="text-brand-400 hover:text-brand-300">
          ← Back to quizzes
        </Link>
      </Card>
    )
  }

  const quizTitle = session.quizzes?.title ?? 'Quiz'
  const isWaiting = session.status === SESSION_STATUS.WAITING

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          to={ROUTES.QUIZZES}
          className="text-sm text-slate-400 hover:text-brand-400"
        >
          ← My quizzes
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          Host: {quizTitle}
        </h1>
        <p className="mt-1 text-slate-400">
          Share the room code so participants can join the waiting room
        </p>
      </div>

      <Card className="text-center">
        <RoomCodeDisplay code={session.session_code} />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Participants" className="text-center">
          <p className="text-4xl font-bold text-brand-400">{count}</p>
          <p className="mt-1 text-sm text-slate-500">joined</p>
        </Card>
        <Card title="Status" className="text-center">
          <p className="text-lg font-semibold capitalize text-white">
            {session.status}
          </p>
        </Card>
      </div>

      <Card title="Waiting room" description="Updates in realtime as players join">
        <ParticipantList
          participants={participants}
          loading={participantsLoading}
        />
      </Card>

      <div className="flex flex-wrap gap-3">
        {isWaiting && (
          <Button onClick={handleStartQuiz} disabled={starting || count === 0}>
            {starting ? 'Starting…' : 'Start quiz'}
          </Button>
        )}
        <Button variant="secondary" onClick={() => navigate(ROUTES.QUIZZES)}>
          Done
        </Button>
      </div>
    </div>
  )
}
