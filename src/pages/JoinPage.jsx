import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'
import { joinSession } from '@/services/participantService'
import { validateRoomCode } from '@/services/sessionService'
import { normalizeRoomCode, ROOM_CODE_LENGTH } from '@/utils/roomCode'
import { saveParticipantSession } from '@/utils/participantStorage'
import { waitingPath } from '@/utils/paths'
import { getParticipantSession } from '@/utils/participantStorage'
import { ROUTES } from '@/utils/constants'

export default function JoinPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const stored = getParticipantSession()
  const [roomCode, setRoomCode] = useState(stored?.roomCode ?? '')
  const [nickname, setNickname] = useState(stored?.nickname ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = getParticipantSession()
    if (saved?.roomCode) {
      setRoomCode(saved.roomCode)
      setNickname(saved.nickname ?? '')
    }
  }, [])

  function handleCodeChange(e) {
    setRoomCode(normalizeRoomCode(e.target.value))
  }

  function resumeWaitingRoom() {
    if (stored?.sessionId) {
      navigate(waitingPath(stored.sessionId))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const { valid, error: validationError, session, sessionCode } =
        await validateRoomCode(roomCode)

      if (!valid) {
        setError(validationError)
        return
      }

      if (!nickname.trim() || nickname.trim().length < 2) {
        setError('Nickname must be at least 2 characters.')
        return
      }

      const participant = await joinSession({
        sessionId: session.id,
        nickname: nickname.trim(),
      })

      saveParticipantSession({
        participantId: participant.id,
        sessionId: session.id,
        nickname: participant.nickname,
        roomCode: sessionCode,
      })

      toast.success('Joined the waiting room!')
      navigate(waitingPath(session.id))
    } catch (err) {
      setError(err.message || 'Could not join the room')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative min-h-[calc(100vh-8rem)] overflow-hidden py-12 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950" />

      <div className="relative mx-auto max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Join a quiz</h1>
          <p className="mt-2 text-slate-400">
            Enter the room code from your host and pick a nickname
          </p>
        </div>

        {stored?.sessionId && (
          <div className="mb-4 rounded-xl border border-brand-500/30 bg-brand-500/10 p-4 text-center text-sm">
            <p className="text-brand-200">You have an active waiting room session.</p>
            <Button className="mt-3" size="sm" onClick={resumeWaitingRoom}>
              Return to waiting room
            </Button>
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Room code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={handleCodeChange}
                maxLength={ROOM_CODE_LENGTH}
                placeholder="ABC123"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] text-white uppercase placeholder:tracking-normal placeholder:font-sans placeholder:text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                autoComplete="off"
                required
              />
            </div>

            <Input
              id="nickname"
              label="Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your display name"
              maxLength={24}
              required
            />

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Joining…' : 'Join waiting room'}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to={ROUTES.HOME} className="hover:text-slate-300">
            ← Back to home
          </Link>
        </p>
      </div>
    </section>
  )
}
