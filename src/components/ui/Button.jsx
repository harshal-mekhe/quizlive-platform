const variants = {
  primary:
    'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-600/25 hover:from-brand-500 hover:to-indigo-500',
  secondary:
    'border border-slate-600 bg-slate-800/80 text-slate-100 hover:border-slate-500 hover:bg-slate-700/80',
  ghost: 'text-slate-300 hover:bg-slate-800/80 hover:text-white',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
