/** Characters that avoid ambiguous glyphs (0/O, 1/I/L) */
const ROOM_CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const ROOM_CODE_LENGTH = 6
export const ROOM_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{6}$/

/**
 * Generate a random room code (uppercase alphanumeric).
 */
export function generateRoomCode(length = ROOM_CODE_LENGTH) {
  let code = ''
  const charsetLength = ROOM_CODE_CHARSET.length
  const randomValues = crypto.getRandomValues(new Uint32Array(length))

  for (let i = 0; i < length; i++) {
    code += ROOM_CODE_CHARSET[randomValues[i] % charsetLength]
  }

  return code
}

/**
 * Normalize user input to valid room code format.
 */
export function normalizeRoomCode(input) {
  return String(input ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, ROOM_CODE_LENGTH)
}

export function isValidRoomCodeFormat(code) {
  return ROOM_CODE_PATTERN.test(code)
}
