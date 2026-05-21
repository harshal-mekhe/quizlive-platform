import Button from '@/components/ui/Button'

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-6 py-16 text-center">
      {icon && <div className="mb-4 text-4xl opacity-80">{icon}</div>}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-slate-400">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
