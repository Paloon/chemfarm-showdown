import { useMemo, useState } from 'react'
import { Brand } from '../components/Brand.jsx'

export function LandingScreen({ onCreateRoom, onJoinRoom, isLoading, error, isOnline }) {
  const roomFromUrl = useMemo(
    () => new URLSearchParams(window.location.search).get('room')?.slice(0, 6) || '',
    [],
  )
  const [mode, setMode] = useState(roomFromUrl ? 'join' : 'home')
  const [nickname, setNickname] = useState('')
  const [roomCode, setRoomCode] = useState(roomFromUrl)

  const submit = (event) => {
    event.preventDefault()
    const cleanName = nickname.trim()
    if (!cleanName) return
    if (mode === 'create') onCreateRoom(cleanName)
    if (mode === 'join' && roomCode.length === 6) onJoinRoom(roomCode, cleanName)
  }

  return (
    <main className="landing-screen screen-fade">
      <div className="landing-sky" aria-hidden="true">
        <span className="cloud cloud--one" />
        <span className="cloud cloud--two" />
        <span className="sun" />
      </div>

      <section className="landing-card">
        <Brand />
        <div className="landing-hero-art" aria-hidden="true">
          <span>🌾</span><span>🧪</span><span>🌱</span>
        </div>
        <h1>ปลูกให้ไว<br />ใช้เคมีให้เป็น</h1>
        <p>แข่งทำฟาร์ม ตอบโจทย์ปฏิกิริยา และขึ้นเป็นอันดับหนึ่งใน 5 นาที</p>

        {mode === 'home' ? (
          <div className="landing-actions">
            <button className="game-button game-button--primary" onClick={() => setMode('create')}>
              <span aria-hidden="true">＋</span> สร้างห้องใหม่
            </button>
            <button className="game-button game-button--secondary" onClick={() => setMode('join')}>
              <span aria-hidden="true">⌁</span> เข้าร่วมด้วยรหัส
            </button>
          </div>
        ) : (
          <form className="join-form" onSubmit={submit}>
            <button className="back-button" type="button" onClick={() => setMode('home')}>
              ← กลับ
            </button>
            <h2>{mode === 'create' ? 'สร้างห้องแข่งขัน' : 'เข้าร่วมห้องแข่งขัน'}</h2>
            {mode === 'join' && (
              <label>
                รหัสห้อง 6 หลัก
                <input
                  inputMode="numeric"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  placeholder="000000"
                  value={roomCode}
                  onChange={(event) => setRoomCode(event.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
              </label>
            )}
            <label>
              ชื่อผู้เล่น
              <input
                maxLength="20"
                placeholder="พิมพ์ชื่อของคุณ"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                autoFocus={mode === 'create'}
              />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="game-button game-button--primary" disabled={isLoading}>
              {isLoading ? 'กำลังเชื่อมต่อ…' : mode === 'create' ? 'สร้างห้อง' : 'เข้าร่วมเกม'}
            </button>
          </form>
        )}

        <div className={`connection-badge ${isOnline ? 'is-online' : ''}`}>
          <span /> {isOnline ? 'เชื่อมต่อระบบออนไลน์' : 'โหมดสาธิตในเครื่อง'}
        </div>
      </section>
    </main>
  )
}
