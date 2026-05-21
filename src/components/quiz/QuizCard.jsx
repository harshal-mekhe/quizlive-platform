import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { quizEditPath } from '@/utils/paths'

const statusStyles = {
  draft: 'bg-slate-700/80 text-slate-300',
  published: 'bg-emerald-500/20 text-emerald-300',
  archived: 'bg-amber-500/20 text-amber-300',
}

export default function QuizCard({ quiz, onHost, onDelete, hosting }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-900/50 shadow-lg transition-all hover:border-brand-500/30 hover:shadow-brand-500/5">
      <div className="h-1 bg-gradient-to-r from-brand-600 via-indigo-500 to-violet-500" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-lg font-semibold text-white group-hover:text-brand-200">
            {quiz.title}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[quiz.status] ?? statusStyles.draft}`}
          >
            {quiz.status}
          </span>
        </div>

        {quiz.description && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-400">{quiz.description}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
          <span>{quiz.question_count} question{quiz.question_count !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>
            Updated {new Date(quiz.updated_at).toLocaleDateString()}
          </span>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <Button size="sm" onClick={() => onHost(quiz)} disabled={hosting}>
            {hosting ? 'Creating room…' : 'Host live'}
          </Button>
          <Link to={quizEditPath(quiz.id)}>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => onDelete(quiz)}>
            Delete
          </Button>
        </div>
      </div>
    </article>
  )
}
