import { Link, Outlet } from 'react-router-dom'
import { APP_NAME, ROUTES } from '@/utils/constants'

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/40 via-slate-950 to-slate-950" />
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link
          to={ROUTES.HOME}
          className="mb-8 block text-center text-2xl font-bold bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent"
        >
          {APP_NAME}
        </Link>
        <Outlet />
      </div>
    </div>
  )
}
