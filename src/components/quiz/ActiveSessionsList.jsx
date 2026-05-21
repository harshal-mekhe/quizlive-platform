import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import { adminWaitingPath } from '@/utils/paths'
import { SESSION_STATUS } from '@/utils/constants'

const statusBadge = {
  waiting: 'bg-amber-500/20 text-amber-300',
  active: 'bg-emerald-500/20 text-emerald-300',
}

export default function ActiveSessionsList({ sessions, loading }) {
  if (loading) {
    return (
      <div className="py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!sessions.length) {
    return (
      <EmptyState
        title="No live rooms"
        description="Host a quiz from My Quizzes to open a waiting room."
      />
    )
  }

  return (
    <ul className="space-y-3">
      {sessions.map((session) => (
        <li
          key={session.id}
          className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium text-white">
              {session.quizzes?.title ?? 'Quiz'}
            </p>
            <p className="mt-1 font-mono text-sm tracking-wider text-brand-400">
              {session.session_code}
            </p>
            <span
              className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadge[session.status] ?? statusBadge.waiting}`}
            >
              {session.status}
            </span>
          </div>
          <Link to={adminWaitingPath(session.id)}>
            <Button variant="secondary" size="sm">
              {session.status === SESSION_STATUS.WAITING
                ? 'Open waiting room'
                : 'View session'}
            </Button>
          </Link>
        </li>
      ))}
    </ul>
  )
}
