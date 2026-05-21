const PARTICIPANT_KEY = 'quizlive_participant'
const SESSION_KEY = 'quizlive_session'

export function saveParticipantSession({ participantId, sessionId, nickname, roomCode }) {
  const payload = { participantId, sessionId, nickname, roomCode }
  sessionStorage.setItem(PARTICIPANT_KEY, JSON.stringify(payload))
}

export function getParticipantSession() {
  try {
    const raw = sessionStorage.getItem(PARTICIPANT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearParticipantSession() {
  sessionStorage.removeItem(PARTICIPANT_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}
