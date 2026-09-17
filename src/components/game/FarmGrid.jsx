import { CROPS, PLOT_PRICES, TREES } from '../../data/gameConfig.js'
import { formatCash, getGrowthStage, getProgress } from '../../utils/game.js'

export function FarmGrid({ plots, trees, cash, now, selectedTarget, onSelect, onUnlock }) {
  return (
    <section className="farm-world" aria-label="พื้นที่ฟาร์ม">
      <div className="farm-sign">ฟาร์มทดลองปฏิกิริยา</div>
      <div className="tree-row">
        {trees.map((tree) => {
          const config = TREES.find((item) => item.id === tree.treeId)
          const progress = getProgress(tree.startedAt, tree.endsAt, now)
          const selected = selectedTarget.type === 'tree' && selectedTarget.id === tree.instanceId
          return (
            <button
              key={tree.instanceId}
              className={`tree-tile ${selected ? 'is-selected' : ''}`}
              onClick={() => onSelect({ type: 'tree', id: tree.instanceId })}
            >
              <span className="tree-crown" aria-hidden="true">{config.icon}</span>
              <span className="tile-name">{config.name}</span>
              <span className="grow-meter"><i style={{ width: `${progress * 100}%` }} /></span>
              <small>{Math.max(0, Math.ceil((tree.endsAt - now) / 1000))} วิ</small>
              {tree.fertilized && <b className={`grade-badge grade-${tree.fertilized}`}>{tree.fertilized}</b>}
            </button>
          )
        })}
        <div className="empty-tree-spot">＋<small>พื้นที่ต้นไม้</small></div>
      </div>

      <div className="plot-grid">
        {plots.map((plot) => {
          const crop = plot.crop && CROPS.find((item) => item.id === plot.crop.cropId)
          const progress = plot.crop?.startedAt ? getProgress(plot.crop.startedAt, plot.crop.endsAt, now) : 0
          const stage = getGrowthStage(progress)
          const selected = selectedTarget.type === 'plot' && selectedTarget.id === plot.id
          const price = PLOT_PRICES[plot.id - 1]

          if (!plot.unlocked) {
            return (
              <button
                key={plot.id}
                className="farm-plot is-locked"
                disabled={cash < price}
                onClick={() => onUnlock(plot.id)}
              >
                <span aria-hidden="true">🔒</span>
                <strong>แปลงที่ {plot.id}</strong>
                <small>{formatCash(price)}</small>
              </button>
            )
          }

          return (
            <button
              key={plot.id}
              className={`farm-plot ${selected ? 'is-selected' : ''} ${crop ? 'has-crop' : ''}`}
              onClick={() => onSelect({ type: 'plot', id: plot.id })}
            >
              <span className="plot-number">{plot.id}</span>
              {crop ? (
                <>
                  <span className={`crop-sprite stage-${stage}`} aria-hidden="true">{crop.icon}</span>
                  <strong>{crop.name}</strong>
                  {!plot.crop.startedAt ? (
                    <small className="needs-water">รอรดน้ำ</small>
                  ) : (
                    <>
                      <span className="grow-meter"><i style={{ width: `${progress * 100}%` }} /></span>
                      <small>{Math.max(0, Math.ceil((plot.crop.endsAt - now) / 1000))} วิ</small>
                    </>
                  )}
                  {plot.crop.fertilized && <b className={`grade-badge grade-${plot.crop.fertilized}`}>{plot.crop.fertilized}</b>}
                </>
              ) : (
                <><span className="empty-plot-icon">＋</span><strong>แปลงว่าง</strong><small>เลือกแล้วหยอดเมล็ด</small></>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
