import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateFertilizedEndTime,
  createInitialPlots,
  formatTimer,
  getGrowthStage,
  makeId,
} from '../src/utils/game.js'

test('formats a five-minute match timer', () => {
  assert.equal(formatTimer(300), '05:00')
  assert.equal(formatTimer(59.2), '01:00')
  assert.equal(formatTimer(0), '00:00')
})

test('grade S removes 70 percent of total crop time', () => {
  const startedAt = 1_000
  const endTime = calculateFertilizedEndTime({
    startedAt,
    totalSeconds: 100,
    grade: 'S',
    now: startedAt + 10_000,
  })
  assert.equal(endTime, startedAt + 30_000)
})

test('fertilizer has no effect after the cut amount has already grown', () => {
  const startedAt = 1_000
  const endTime = calculateFertilizedEndTime({
    startedAt,
    totalSeconds: 100,
    grade: 'S',
    now: startedAt + 75_000,
  })
  assert.equal(endTime, null)
})

test('tree fertilizer is capped at a 40 percent cut', () => {
  const startedAt = 10_000
  const endTime = calculateFertilizedEndTime({
    startedAt,
    totalSeconds: 100,
    grade: 'S',
    isTree: true,
    now: startedAt + 10_000,
  })
  assert.equal(endTime, startedAt + 60_000)
})

test('creates seven plots with only the first plot unlocked', () => {
  const plots = createInitialPlots()
  assert.equal(plots.length, 7)
  assert.equal(plots.filter((plot) => plot.unlocked).length, 1)
  assert.equal(getGrowthStage(0.2), 1)
  assert.equal(getGrowthStage(0.5), 2)
  assert.equal(getGrowthStage(0.9), 3)
})

test('creates a browser-compatible unique identifier', () => {
  assert.match(makeId(), /^[0-9a-f-]{36}$/)
})
