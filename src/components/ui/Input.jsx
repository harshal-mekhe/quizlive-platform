export default function Input({
  label,
  id,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
