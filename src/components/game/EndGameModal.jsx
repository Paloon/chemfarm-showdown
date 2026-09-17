import { formatCash } from '../../utils/game.js'

export function EndGameModal({ leaderboard, playerId, localStats, onReplay }) {
  const ranked = leaderboard.map((item) => item.id === playerId ? { ...item, ...localStats } : item)
    .sort((a, b) => b.cash - a.cash)

  return (
    <div className="modal-backdrop end-backdrop">
      <section className="end-modal" role="dialog" aria-modal="true" aria-labelledby="end-title">
        <div className="end-trophy" aria-hidden="true">🏆</div>
        <p>หมดเวลาการแข่งขัน</p>
        <h2 id="end-title">ผลการแข่งขัน</h2>
        <ol className="final-board">
          {ranked.map((item, index) => {
            const harvested = item.cropsHarvested ?? item.crops_harvested ?? 0
            const solved = item.quizzesSolved ?? item.quizzes_solved ?? 0
            const bestTime = item.bestQuizTime ?? item.best_quiz_time_ms
            return (
              <li key={item.id} className={`${item.id === playerId ? 'is-me' : ''} rank-${index + 1}`}>
                <span className="rank-number">{index + 1}</span>
                <span className="final-name">{item.nickname}{item.id === playerId && <small>คุณ</small>}</span>
                <strong>{formatCash(item.cash)}</strong>
                <dl>
                  <div><dt>เก็บเกี่ยว</dt><dd>{harvested} ครั้ง</dd></div>
                  <div><dt>ตอบถูก</dt><dd>{solved} ข้อ</dd></div>
                  <div><dt>เร็วที่สุด</dt><dd>{bestTime ? `${(bestTime / 1000).toFixed(2)} วิ` : '—'}</dd></div>
                </dl>
              </li>
            )
          })}
        </ol>
        <button className="game-button game-button--primary" onClick={onReplay}>เล่นอีกครั้ง</button>
      </section>
    </div>
  )
}
