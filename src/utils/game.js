import { FERTILIZER } from '../data/gameConfig.js'

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
  return [
    {
      instanceId: 'apple-starter',
      treeId: 'apple',
      startedAt: now,
      endsAt: now + 40000,
      fertilized: false,
    },
  ]
}
