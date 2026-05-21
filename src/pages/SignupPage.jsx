import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { ROUTES } from '@/utils/constants'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const data = await signup({ email, password, displayName })
      const user = data?.user

      if (user && !user.email_confirmed_at) {
        setSuccess(
          'Account created! Check your email to confirm, then log in.',
        )
      } else {
        navigate(ROUTES.DASHBOARD)
      }
    } catch (err) {
      setError(err.message || 'Failed to create account.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card title="Admin signup" description="Create an account to host quizzes">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="displayName"
          label="Display name"
          type="text"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Quiz Host"
        />
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
        />
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 6 characters"
        />
        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            {success}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-brand-400 hover:text-brand-300">
          Sign in
        </Link>
      </p>
    </Card>
  )
}
