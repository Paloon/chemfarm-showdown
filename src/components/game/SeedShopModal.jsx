import { useState } from 'react'
import { CROPS, TREES } from '../../data/gameConfig.js'
import { formatCash } from '../../utils/game.js'
import { GameModal } from '../GameModal.jsx'

export function SeedShopModal({ cash, trees, onPlant, onBuyTree, onClose }) {
  const [tab, setTab] = useState('crop')
  return (
    <GameModal title="ร้านเมล็ดและต้นไม้" onClose={onClose}>
      <div className="shop-tabs">
        <button className={tab === 'crop' ? 'is-active' : ''} onClick={() => setTab('crop')}>🌱 พืชแปลงดิน</button>
        <button className={tab === 'tree' ? 'is-active' : ''} onClick={() => setTab('tree')}>🌳 ไม้ยืนต้น</button>
      </div>
      <div className="shop-list">
        {tab === 'crop' ? CROPS.map((crop) => (
          <button key={crop.id} disabled={cash < crop.seedPrice} onClick={() => onPlant(crop.id)}>
            <span className="shop-icon">{crop.icon}</span>
            <span><strong>{crop.name}</strong><small>{crop.description}</small></span>
            <span className="shop-stats"><b>{formatCash(crop.seedPrice)}</b><small>{crop.growSeconds} วิ → {formatCash(crop.sellPrice)}</small></span>
          </button>
        )) : TREES.filter((tree) => tree.price > 0).map((tree) => {
          const owned = trees.some((item) => item.treeId === tree.id)
          return (
            <button key={tree.id} disabled={cash < tree.price || owned} onClick={() => onBuyTree(tree.id)}>
              <span className="shop-icon">{tree.icon}</span>
              <span><strong>{tree.name}</strong><small>เก็บผลขายอัตโนมัติทุกรอบ</small></span>
              <span className="shop-stats"><b>{owned ? 'มีแล้ว' : formatCash(tree.price)}</b><small>{tree.cycleSeconds} วิ → {formatCash(tree.sellPrice)}</small></span>
            </button>
          )
        })}
      </div>
    </GameModal>
  )
}
