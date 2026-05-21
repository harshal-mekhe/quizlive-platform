import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ParticipantList({ participants, loading, highlightId }) {
  if (loading) {
    return (
      <div className="py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!participants.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No participants yet. Share the room code!
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {participants.map((p, index) => (
        <li
          key={p.id}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
            p.id === highlightId
              ? 'border-brand-500/50 bg-brand-500/10'
              : 'border-slate-800 bg-slate-900/50'
          }`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold text-brand-400">
            {index + 1}
          </span>
          <span className="flex-1 font-medium text-white">{p.nickname}</span>
          {p.id === highlightId && (
            <span className="text-xs font-medium text-brand-400">You</span>
          )}
        </li>
      ))}
    </ul>
  )
}
