export function ActionBar({ onSeeds, onWater, onLab, onInventory, cooldown, inventoryTotal }) {
  return (
    <nav className="action-bar" aria-label="คำสั่งในฟาร์ม">
      <button onClick={onSeeds}><span>🌱</span><strong>หยอดเมล็ด</strong></button>
      <button onClick={onWater}><span>💧</span><strong>รดน้ำ</strong></button>
      <button className="lab-action" onClick={onLab} disabled={cooldown > 0}>
        <span>🧪</span><strong>{cooldown > 0 ? `รอ ${cooldown} วิ` : 'ห้องวิจัยปุ๋ยเคมี'}</strong>
      </button>
      <button onClick={onInventory}>
        <span>🎒</span><strong>กระเป๋าปุ๋ย</strong>{inventoryTotal > 0 && <b>{inventoryTotal}</b>}
      </button>
    </nav>
  )
}
