import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import { APP_NAME, ROUTES } from '@/utils/constants'

export default function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth()

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/30 via-slate-950 to-slate-950" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1 text-sm font-medium text-brand-300">
            Realtime quiz platform
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Host engaging{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              live quizzes
            </span>{' '}
            with {APP_NAME}
          </h1>
          <p className="mt-6 text-lg text-slate-400 sm:text-xl">
            Create quizzes, run live sessions, and track participants — all in one
            modern admin dashboard. Built for scale with Supabase Realtime.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to={ROUTES.JOIN}>
              <Button size="lg">Join a quiz</Button>
            </Link>
            {isAuthenticated && isAdmin ? (
              <Link to={ROUTES.DASHBOARD}>
                <Button variant="secondary" size="lg">
                  Admin dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to={ROUTES.SIGNUP}>
                  <Button variant="secondary" size="lg">
                    Host as admin
                  </Button>
                </Link>
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" size="lg">
                    Admin login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: 'Create quizzes',
              desc: 'Build question sets and manage your quiz library from one place.',
            },
            {
              title: 'Live sessions',
              desc: 'Launch realtime sessions where participants join with a code.',
            },
            {
              title: 'Track results',
              desc: 'Collect answers and leaderboard data as sessions progress.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm"
            >
              <h3 className="font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
