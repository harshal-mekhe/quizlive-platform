import { ROUTES } from '@/utils/constants'

export function quizEditPath(id) {
  return `/dashboard/quizzes/${id}/edit`
}

export function adminWaitingPath(sessionId) {
  return `/dashboard/sessions/${sessionId}/waiting`
}

export function waitingPath(sessionId) {
  return `/waiting/${sessionId}`
}

export function playPath(sessionId) {
  return `/play/${sessionId}`
}

export function adminLivePath(sessionId) {
  return `/dashboard/sessions/${sessionId}/live`
}

export function resultsPath(sessionId) {
  return `/results/${sessionId}`
}

export function isQuizEditRoute(pathname) {
  return pathname.includes('/dashboard/quizzes/') && pathname.endsWith('/edit')
}

export { ROUTES }
