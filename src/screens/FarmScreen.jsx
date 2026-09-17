import { useCallback, useState } from 'react'
import { ActionBar } from '../components/game/ActionBar.jsx'
import { FarmGrid } from '../components/game/FarmGrid.jsx'
import { InventoryModal } from '../components/game/InventoryModal.jsx'
import { SeedShopModal } from '../components/game/SeedShopModal.jsx'
import { TopHud } from '../components/game/TopHud.jsx'
import { useGameEngine } from '../hooks/useGameEngine.js'

export function FarmScreen({ room, player, players }) {
  const game = useGameEngine({ room, player, roomPlayers: players })
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const [inventoryMessage, setInventoryMessage] = useState('')

  const showToast = useCallback((message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 1800)
  }, [])

  const plant = (cropId) => {
    if (game.plantCrop(cropId)) {
      setModal(null)
      showToast('หยอดเมล็ดแล้ว อย่าลืมรดน้ำ!')
    } else {
      showToast('เลือกแปลงว่างหรือหาเงินเพิ่มก่อน')
    }
  }

  const water = () => {
    showToast(game.waterSelected() ? 'รดน้ำแล้ว เริ่มนับเวลาเติบโต!' : 'เลือกพืชที่ยังไม่ได้รดน้ำก่อน')
  }

  const buyTree = (treeId) => {
    if (game.buyTree(treeId)) {
      setModal(null)
      showToast('ปลูกต้นไม้แล้ว จะเก็บผลให้อัตโนมัติ')
    }
  }

  const applyFertilizer = (grade) => {
    const result = game.applyFertilizer(grade)
    const messages = {
      empty: 'ปุ๋ยเกรดนี้หมดแล้ว',
      target: 'เป้าหมายนี้ยังใช้ปุ๋ยไม่ได้ หรือใช้ไปแล้ว',
      late: 'พืชเติบโตเกินช่วงที่ปุ๋ยจะลดเวลาได้แล้ว',
    }
    setInventoryMessage(result.ok ? `ใช้ปุ๋ยเกรด ${grade} สำเร็จ!` : messages[result.reason])
  }

  return (
    <main className="farm-screen screen-fade">
      <TopHud cash={game.cash} secondsLeft={game.secondsLeft} leaderboard={game.leaderboard} playerId={player.id} />
      <FarmGrid
        plots={game.plots}
        trees={game.trees}
        cash={game.cash}
        now={game.now}
        selectedTarget={game.selectedTarget}
        onSelect={game.setSelectedTarget}
        onUnlock={(plotId) => {
          if (game.unlockPlot(plotId)) showToast('ปลดล็อกแปลงใหม่แล้ว!')
        }}
      />
      <ActionBar
        onSeeds={() => setModal('shop')}
        onWater={water}
        onLab={() => showToast('ห้องวิจัยกำลังเปิด…')}
        onInventory={() => { setInventoryMessage(''); setModal('inventory') }}
        cooldown={0}
        inventoryTotal={game.inventory.S + game.inventory.A}
      />

      {toast && <div className="game-toast" role="status">{toast}</div>}
      {modal === 'shop' && (
        <SeedShopModal cash={game.cash} trees={game.trees} onPlant={plant} onBuyTree={buyTree} onClose={() => setModal(null)} />
      )}
      {modal === 'inventory' && (
        <InventoryModal
          inventory={game.inventory}
          selectedTarget={game.selectedTarget}
          onApply={applyFertilizer}
          message={inventoryMessage}
          onClose={() => setModal(null)}
        />
      )}
    </main>
  )
}
