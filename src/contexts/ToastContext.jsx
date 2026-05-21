import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++toastId
      setToasts((prev) => [...prev, { id, message, type }])

      if (duration > 0) {
        setTimeout(() => dismiss(id), duration)
      }

      return id
    },
    [dismiss],
  )

  const toast = useMemo(
    () => ({
      success: (msg, duration) => addToast(msg, 'success', duration),
      error: (msg, duration) => addToast(msg, 'error', duration),
      info: (msg, duration) => addToast(msg, 'info', duration),
    }),
    [addToast],
  )

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:bottom-6 sm:right-6 sm:px-0"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md ${
              t.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-950/90 text-emerald-100'
                : t.type === 'error'
                  ? 'border-red-500/30 bg-red-950/90 text-red-100'
                  : 'border-slate-600/50 bg-slate-900/95 text-slate-100'
            }`}
          >
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="text-slate-400 hover:text-white"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.toast
}
