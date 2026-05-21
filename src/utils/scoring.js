import { SCORING } from '@/utils/constants'

/** Client-side preview of scoring (authoritative logic is in submit_answer RPC). */
export function calculatePointsPreview(isCorrect, elapsedMs, durationMs) {
  if (!isCorrect) return 0

  const ratio = Math.max(0, 1 - elapsedMs / durationMs)
  const bonus = Math.round(SCORING.MAX_SPEED_BONUS * ratio)
  return SCORING.BASE_POINTS + bonus
}
