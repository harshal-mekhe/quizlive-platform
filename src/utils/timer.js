/**
 * Local timer sync — uses server question_started_at + duration (no per-second Realtime).
 */
export function getRemainingMs(questionStartedAt, durationSeconds, nowMs = Date.now()) {
  if (!questionStartedAt || !durationSeconds) return 0

  const startMs = new Date(questionStartedAt).getTime()
  const durationMs = durationSeconds * 1000
  const elapsed = nowMs - startMs
  return Math.max(0, durationMs - elapsed)
}

export function getRemainingSeconds(questionStartedAt, durationSeconds, nowMs = Date.now()) {
  return Math.ceil(getRemainingMs(questionStartedAt, durationSeconds, nowMs) / 1000)
}

export function isTimerExpired(questionStartedAt, durationSeconds, nowMs = Date.now()) {
  return getRemainingMs(questionStartedAt, durationSeconds, nowMs) <= 0
}

export function getElapsedMs(questionStartedAt, nowMs = Date.now()) {
  if (!questionStartedAt) return 0
  return Math.max(0, nowMs - new Date(questionStartedAt).getTime())
}
