export function Brand({ compact = false }) {
  return (
    <div className={`game-brand${compact ? ' game-brand--compact' : ''}`}>
      <span className="game-brand__flask" aria-hidden="true">⚗</span>
      <span>
        <strong>เคมฟาร์ม</strong>
        {!compact && <small>ศึกชิงจ้าวแห่งปฏิกิริยา</small>}
      </span>
    </div>
  )
}
