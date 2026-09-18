import { CROPS, FERTILIZER, TREES } from '../data/gameConfig.js'

export function formatCash(value) {
  return `$${Math.max(0, Math.floor(value)).toLocaleString('th-TH')}`
}

export function formatTimer(totalSeconds) {
  const safeSeconds = Math.max(0, Math.ceil(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function makeRoomCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function makeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16)
    const value = character === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

export function calculateFertilizedEndTime({ startedAt, totalSeconds, grade, isTree = false, now = Date.now() }) {
  const cutRatio = isTree ? FERTILIZER[grade].treeCut : FERTILIZER[grade].cropCut
  const totalMs = totalSeconds * 1000
  const cutMs = totalMs * cutRatio
  const grownMs = Math.max(0, now - startedAt)

  if (grownMs > cutMs) {
    return null
  }

  return startedAt + totalMs - cutMs
}

export function getProgress(startedAt, endsAt, now = Date.now()) {
  const duration = Math.max(1, endsAt - startedAt)
  return Math.min(1, Math.max(0, (now - startedAt) / duration))
}

export function getGrowthStage(progress) {
  if (progress < 0.34) return 1
  if (progress < 0.68) return 2
  return 3
}

export function createInitialPlots() {
  return Array.from({ length: 7 }, (_, index) => ({
    id: index + 1,
    unlocked: index === 0,
    crop: null,
  }))
}

export function createInitialTrees(now = Date.now()) {
  const starterTree = TREES.find((tree) => tree.id === 'apple')
  return [
    {
      instanceId: 'apple-starter',
      treeId: 'apple',
      startedAt: now,
      endsAt: now + starterTree.cycleSeconds * 1000,
      fertilized: false,
    },
  ]
}

export function collectReadyProduction({ plots, trees, now }) {
  let cropGain = 0
  let treeGain = 0
  let harvestedCrops = 0
  let harvestedTreeCycles = 0
  let plotsChanged = false
  let treesChanged = false

  const nextPlots = plots.map((plot) => {
    if (!plot.crop?.endsAt || plot.crop.endsAt > now) return plot

    const crop = CROPS.find((item) => item.id === plot.crop.cropId)
    cropGain += crop.sellPrice
    harvestedCrops += 1
    plotsChanged = true
    return { ...plot, crop: null }
  })

  const nextTrees = trees.map((tree) => {
    if (tree.endsAt > now) return tree

    const config = TREES.find((item) => item.id === tree.treeId)
    const cycleMs = config.cycleSeconds * 1000
    const completedCycles = Math.floor((now - tree.endsAt) / cycleMs) + 1
    treeGain += config.sellPrice * completedCycles
    harvestedTreeCycles += completedCycles
    treesChanged = true

    return {
      ...tree,
      startedAt: tree.endsAt + (completedCycles - 1) * cycleMs,
      endsAt: tree.endsAt + completedCycles * cycleMs,
      fertilized: false,
    }
  })

  return {
    plots: plotsChanged ? nextPlots : plots,
    trees: treesChanged ? nextTrees : trees,
    cropGain,
    treeGain,
    totalGain: cropGain + treeGain,
    harvestedCrops,
    harvestedTreeCycles,
  }
}
