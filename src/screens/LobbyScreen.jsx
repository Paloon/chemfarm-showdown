import { useEffect, useState } from 'react'
import { Brand } from '../components/Brand.jsx'

export function LobbyScreen({ room, player, players, onReady, onStart, onLeave, isLoading, error, isOnline }) {
  const [qrUrl, setQrUrl] = useState('')
  const roomUrl = `${window.location.origin}${window.location.pathname}?room=${room.code}`
  const isHost = player.id === room.host_player_id || player.is_host
  const everyoneReady = players.length > 0 && players.every((item) => item.is_ready || item.id === room.host_player_id)

  useEffect(() => {
    import('qrcode').then(({ default: QRCode }) => (
      QRCode.toDataURL(roomUrl, { width: 240, margin: 1, color: { dark: '#2f3b25', light: '#fffaf0' } })
    )).then(setQrUrl)
  }, [roomUrl])

  const copyCode = async () => {
    await navigator.clipboard?.writeText(room.code)
  }

  return (
    <main className="lobby-screen screen-fade">
      <header className="lobby-header">
        <Brand compact />
        <button className="text-button" onClick={onLeave}>ออกจากห้อง</button>
      </header>

      <section className="lobby-layout">
        <div className="room-ticket wood-card">
          <p className="section-kicker">ห้องแข่งขันของคุณ</p>
          <h1>รหัสห้อง</h1>
          <button className="room-code" onClick={copyCode} aria-label="คัดลอกรหัสห้อง">
            {room.code}
          </button>
          <p className="tap-hint">แตะรหัสเพื่อคัดลอก</p>
          {qrUrl && <img src={qrUrl} alt="คิวอาร์โค้ดสำหรับเข้าร่วมห้อง" />}
          <p className="share-hint">ให้เพื่อนสแกนเพื่อเข้าห้องทันที</p>
        </div>

        <div className="players-panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">ผู้เล่นในห้อง</p>
              <h2>{players.length} คนพร้อมลงฟาร์ม</h2>
            </div>
            <span className="live-dot">● สด</span>
          </div>

          <ul className="player-list">
            {players.map((item, index) => (
              <li key={item.id}>
                <span className={`player-avatar avatar-${index % 4}`}>{item.nickname.slice(0, 1)}</span>
                <span className="player-name">
                  {item.nickname}
                  {item.id === room.host_player_id || item.is_host ? <small>เจ้าของห้อง</small> : null}
                </span>
                <span className={`ready-state ${item.is_ready ? 'is-ready' : ''}`}>
                  {item.is_ready ? 'พร้อมแล้ว' : 'กำลังเตรียมตัว'}
                </span>
              </li>
            ))}
          </ul>

          {error && <p className="form-error" role="alert">{error}</p>}

          {isHost || !isOnline ? (
            <button
              className="game-button game-button--primary"
              disabled={isLoading || (isOnline && (!everyoneReady || players.length < 2))}
              onClick={onStart}
            >
              {isLoading ? 'กำลังเริ่มเกม…' : 'เริ่มการแข่งขัน'}
            </button>
          ) : (
            <button
              className={`game-button ${player.is_ready ? 'game-button--ready' : 'game-button--primary'}`}
              onClick={onReady}
            >
              {player.is_ready ? '✓ พร้อมแล้ว' : 'ฉันพร้อมแล้ว'}
            </button>
          )}
          <p className="lobby-note">เจ้าของห้องจะเริ่มเกมเมื่อทุกคนพร้อม</p>
        </div>
      </section>
    </main>
  )
}
