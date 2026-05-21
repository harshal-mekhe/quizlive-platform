import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ActiveSessionsList from '@/components/quiz/ActiveSessionsList'
import { fetchDashboardStats } from '@/services/quizService'
import { fetchAdminSessions } from '@/services/sessionService'
import { ROUTES } from '@/utils/constants'

export default function DashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingSessions, setLoadingSessions] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoadingStats(false))

    fetchAdminSessions()
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoadingSessions(false))
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Welcome back, {profile?.display_name || 'Admin'}
          </h1>
          <p className="mt-2 text-slate-400">
            Manage quizzes, host live rooms, and track participants
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={ROUTES.QUIZ_NEW}>
            <Button>+ Create quiz</Button>
          </Link>
          <Link to={ROUTES.JOIN} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">Participant join ↗</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Quizzes" description="In your library">
          {loadingStats ? (
            <LoadingSpinner className="py-4" />
          ) : (
            <>
              <p className="text-3xl font-bold text-brand-400">{stats?.quizCount ?? 0}</p>
              <Link
                to={ROUTES.QUIZZES}
                className="mt-2 inline-block text-sm text-brand-400 hover:text-brand-300"
              >
                View all →
              </Link>
            </>
          )}
        </Card>
        <Card title="Sessions" description="Rooms hosted">
          {loadingStats ? (
            <LoadingSpinner className="py-4" />
          ) : (
            <p className="text-3xl font-bold text-indigo-400">{stats?.sessionCount ?? 0}</p>
          )}
        </Card>
        <Card title="Participants" description="Total joins">
          {loadingStats ? (
            <LoadingSpinner className="py-4" />
          ) : (
            <p className="text-3xl font-bold text-violet-400">
              {stats?.participantCount ?? 0}
            </p>
          )}
        </Card>
      </div>

      <Card
        title="Live rooms"
        description="Waiting and active sessions you can re-enter"
      >
        <ActiveSessionsList sessions={sessions} loading={loadingSessions} />
      </Card>

      <Card title="Quick actions">
        <div className="flex flex-wrap gap-3">
          <Link to={ROUTES.QUIZ_NEW}>
            <Button variant="secondary">Create quiz</Button>
          </Link>
          <Link to={ROUTES.QUIZZES}>
            <Button variant="secondary">Manage quizzes</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
