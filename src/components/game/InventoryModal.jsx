import { GameModal } from '../GameModal.jsx'

export function InventoryModal({ inventory, selectedTarget, onApply, message, onClose }) {
  return (
    <GameModal title="กระเป๋าปุ๋ยเคมี" onClose={onClose}>
      <p className="inventory-target">
        เป้าหมายที่เลือก: <strong>{selectedTarget.type === 'plot' ? `แปลงที่ ${selectedTarget.id}` : 'ต้นไม้'}</strong>
      </p>
      <div className="fertilizer-grid">
        <button disabled={inventory.S < 1} onClick={() => onApply('S')}>
          <span className="fertilizer-bag grade-S">S</span>
          <strong>ปุ๋ยเกรด S</strong>
          <small>พืช −70% · ต้นไม้ −40%</small>
          <b>เหลือ {inventory.S} ถุง</b>
        </button>
        <button disabled={inventory.A < 1} onClick={() => onApply('A')}>
          <span className="fertilizer-bag grade-A">A</span>
          <strong>ปุ๋ยเกรด A</strong>
          <small>พืช −40% · ต้นไม้ −20%</small>
          <b>เหลือ {inventory.A} ถุง</b>
        </button>
      </div>
      <p className="rule-note">ใช้ได้หนึ่งถุงต่อหนึ่งรอบการเก็บเกี่ยว และต้องใช้ก่อนพืชเติบโตเกินเวลาที่ปุ๋ยลดได้</p>
      {message && <p className="inventory-message">{message}</p>}
    </GameModal>
  )
}
