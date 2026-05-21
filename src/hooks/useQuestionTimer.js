import { useEffect, useState } from 'react'
import {
  getRemainingMs,
  getRemainingSeconds,
  isTimerExpired,
} from '@/utils/timer'

/**
 * Local countdown — ticks every 250ms, not via Realtime.
 */
export function useQuestionTimer(questionStartedAt, durationSeconds, enabled = true) {
  const [nowMs, setNowMs] = useState(Date.now())

  useEffect(() => {
    if (!enabled || !questionStartedAt || !durationSeconds) return

    const id = setInterval(() => setNowMs(Date.now()), 250)
    return () => clearInterval(id)
  }, [enabled, questionStartedAt, durationSeconds])

  const remainingMs = getRemainingMs(questionStartedAt, durationSeconds, nowMs)
  const remainingSeconds = getRemainingSeconds(questionStartedAt, durationSeconds, nowMs)
  const expired = isTimerExpired(questionStartedAt, durationSeconds, nowMs)
  const progress =
    durationSeconds > 0
      ? Math.min(100, ((durationSeconds * 1000 - remainingMs) / (durationSeconds * 1000)) * 100)
      : 0

  return { remainingMs, remainingSeconds, expired, progress, nowMs }
}
