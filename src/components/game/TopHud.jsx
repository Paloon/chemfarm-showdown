import { formatCash, formatTimer } from '../../utils/game.js'

export function TopHud({ cash, incomeNotice, secondsLeft, leaderboard, playerId }) {
  return (
    <header className="top-hud">
      <div className="cash-chip">
        <span aria-hidden="true">🪙</span>
        <span><small>เงินของฉัน</small><strong>{formatCash(cash)}</strong></span>
        {incomeNotice && (
          <b key={incomeNotice.id} className="income-pop">
            +{formatCash(incomeNotice.amount)}{incomeNotice.fromTrees > 0 ? ' จากต้นไม้' : ''}
          </b>
        )}
      </div>
      <div className={`match-timer ${secondsLeft < 60 ? 'is-urgent' : ''}`}>
        <small>เหลือเวลา</small>
        <strong>{formatTimer(secondsLeft)}</strong>
      </div>
      <details className="mini-board">
        <summary>🏆 อันดับ</summary>
        <ol>
          {leaderboard.map((item) => (
            <li key={item.id} className={item.id === playerId ? 'is-me' : ''}>
              <span>{item.nickname}</span><strong>{formatCash(item.cash)}</strong>
            </li>
          ))}
        </ol>
      </details>
    </header>
  )
}
