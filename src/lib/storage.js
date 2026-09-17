const PLAYER_KEY = 'chemfarm-player'

export function savePlayerSession(session) {
  localStorage.setItem(PLAYER_KEY, JSON.stringify(session))
}

export function getPlayerSession() {
  try {
    return JSON.parse(localStorage.getItem(PLAYER_KEY))
  } catch {
    return null
  }
}

export function clearPlayerSession() {
  localStorage.removeItem(PLAYER_KEY)
}
