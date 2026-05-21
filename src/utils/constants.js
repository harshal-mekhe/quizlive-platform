export const APP_NAME = 'QuizLive'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  QUIZZES: '/dashboard/quizzes',
  QUIZ_NEW: '/dashboard/quizzes/new',
  QUIZ_EDIT: '/dashboard/quizzes/:id/edit',
  JOIN: '/join',
  WAITING: '/waiting/:sessionId',
  ADMIN_WAITING: '/dashboard/sessions/:sessionId/waiting',
  ADMIN_LIVE: '/dashboard/sessions/:sessionId/live',
  PLAY: '/play/:sessionId',
  RESULTS: '/results/:sessionId',
}

export const LIVE_PHASE = {
  LOBBY: 'lobby',
  QUESTION: 'question',
  REVEAL: 'reveal',
  LEADERBOARD: 'leaderboard',
  PODIUM: 'podium',
}

export const SCORING = {
  BASE_POINTS: 10,
  MAX_SPEED_BONUS: 5,
}

export const PHASE_DURATIONS = {
  REVEAL_MS: 3500,
  LEADERBOARD_MS: 5000,
}

export const QUIZ_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
}

export const SESSION_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  ENDED: 'ended',
}

export const DEFAULT_QUESTION_TIME = 30
export const OPTIONS_PER_QUESTION = 4
export const MIN_QUESTIONS = 1

export const USER_ROLES = {
  ADMIN: 'admin',
  PARTICIPANT: 'participant',
}
