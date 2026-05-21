export default function LoadingSpinner({ className = '', size = 'md' }) {
  const sizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-brand-500 border-t-transparent ${sizes[size]}`}
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}
