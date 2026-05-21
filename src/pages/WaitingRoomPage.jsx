import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ParticipantList from '@/components/quiz/ParticipantList'
import RoomCodeDisplay from '@/components/quiz/RoomCodeDisplay'
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const quizTitle = session?.quizzes?.title ?? 'Quiz'

  return (
    <section className="relative overflow-hidden py-10 sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/20 via-slate-950 to-slate-950" />

      <div className="relative mx-auto max-w-lg px-4">
        <div className="mb-8 text-center">
          <p className="text-sm text-slate-500">{quizTitle}</p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            Waiting room
          </h1>
          <p className="mt-2 text-slate-400">
            Hi, <span className="font-medium text-brand-300">{stored.nickname}</span>
            {' — hang tight while the host gets ready'}
          </p>
        </div>

        {stored.roomCode && (
          <div className="mb-8 flex justify-center">
            <RoomCodeDisplay code={stored.roomCode} size="sm" />
          </div>
        )}

        <Card
          title={`Players (${count})`}
          description="Live list updates as others join"
        >
          <ParticipantList
            participants={participants}
            loading={participantsLoading}
            highlightId={stored.participantId}
          />
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          You&apos;ll enter the quiz automatically when the host starts.
        </p>
      </div>
    </section>
  )
}
