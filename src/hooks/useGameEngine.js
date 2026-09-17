import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CROPS, PLOT_PRICES, STARTING_CASH, TREES } from '../data/gameConfig.js'
import { fetchServerTime, updatePlayerStats } from '../lib/roomApi.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import {
  calculateFertilizedEndTime,
  createInitialPlots,
  createInitialTrees,
} from '../utils/game.js'

export function useGameEngine({ room, player, roomPlayers }) {
  const [cash, setCash] = useState(player.cash ?? STARTING_CASH)
  const [plots, setPlots] = useState(createInitialPlots)
  const [trees, setTrees] = useState(() => createInitialTrees())
  const [inventory, setInventory] = useState({
    S: player.fertilizer_s_count ?? 0,
    A: player.fertilizer_a_count ?? 0,
  })
  const [selectedTarget, setSelectedTarget] = useState({ type: 'plot', id: 1 })
  const [now, setNow] = useState(Date.now())
  const [serverOffset, setServerOffset] = useState(0)
  const [leaderboard, setLeaderboard] = useState(() =>
    roomPlayers.map((item) => ({ id: item.id, nickname: item.nickname, cash: item.cash ?? 0 })),
  )
  const [stats, setStats] = useState({ cropsHarvested: 0, quizzesSolved: 0, bestQuizTime: null })
  const channelRef = useRef(null)
  const endedAtRef = useRef(false)

  const endsAt = useMemo(() => new Date(room.ends_at).getTime(), [room.ends_at])
  const secondsLeft = Math.max(0, (endsAt - now) / 1000)
  const hasEnded = secondsLeft <= 0

  useEffect(() => {
    let active = true
    fetchServerTime()
      .then((serverTime) => {
        if (active) setServerOffset(serverTime - Date.now())
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    const processTick = () => {
      const tickNow = Date.now() + serverOffset
      setNow(tickNow)
      if (tickNow >= endsAt) return

      let cropGain = 0
      let harvested = 0
      setPlots((current) => current.map((plot) => {
        if (!plot.crop?.endsAt || plot.crop.endsAt > tickNow) return plot
        const crop = CROPS.find((item) => item.id === plot.crop.cropId)
        cropGain += crop.sellPrice
        harvested += 1
        return { ...plot, crop: null }
      }))

      let treeGain = 0
      setTrees((current) => current.map((tree) => {
        if (tree.endsAt > tickNow) return tree
        const config = TREES.find((item) => item.id === tree.treeId)
        const cycleMs = config.cycleSeconds * 1000
        const completedCycles = Math.floor((tickNow - tree.endsAt) / cycleMs) + 1
        treeGain += config.sellPrice * completedCycles
        return {
          ...tree,
          startedAt: tree.endsAt + (completedCycles - 1) * cycleMs,
          endsAt: tree.endsAt + completedCycles * cycleMs,
          fertilized: false,
        }
      }))

      if (cropGain + treeGain > 0) setCash((current) => current + cropGain + treeGain)
      if (harvested > 0) {
        setStats((current) => ({ ...current, cropsHarvested: current.cropsHarvested + harvested }))
      }
    }

    processTick()
    const timer = window.setInterval(processTick, 250)
    return () => window.clearInterval(timer)
  }, [endsAt, serverOffset])

  useEffect(() => {
    setLeaderboard((current) => {
      const remote = new Map(current.map((item) => [item.id, item]))
      roomPlayers.forEach((item) => {
        if (!remote.has(item.id)) remote.set(item.id, item)
      })
      remote.set(player.id, { id: player.id, nickname: player.nickname, cash })
      return [...remote.values()].sort((a, b) => b.cash - a.cash)
    })
  }, [cash, player.id, player.nickname, roomPlayers])

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    const channel = supabase
      .channel(`game:${room.id}`)
      .on('broadcast', { event: 'player_state' }, ({ payload }) => {
        setLeaderboard((current) => {
          const next = current.filter((item) => item.id !== payload.id)
          return [...next, payload].sort((a, b) => b.cash - a.cash)
        })
      })
      .subscribe()
    channelRef.current = channel

    const syncTimer = window.setInterval(() => {
      const payload = { id: player.id, nickname: player.nickname, cash, inventory }
      channel.send({ type: 'broadcast', event: 'player_state', payload })
      updatePlayerStats(player.id, {
        cash,
        fertilizer_s_count: inventory.S,
        fertilizer_a_count: inventory.A,
        crops_harvested: stats.cropsHarvested,
        quizzes_solved: stats.quizzesSolved,
        best_quiz_time_ms: stats.bestQuizTime,
      }).catch(() => {})
    }, 2000)

    return () => {
      window.clearInterval(syncTimer)
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [cash, inventory, player.id, player.nickname, room.id, stats])

  useEffect(() => {
    if (hasEnded && !endedAtRef.current) {
      endedAtRef.current = true
      updatePlayerStats(player.id, {
        cash,
        crops_harvested: stats.cropsHarvested,
        quizzes_solved: stats.quizzesSolved,
        best_quiz_time_ms: stats.bestQuizTime,
      }).catch(() => {})
    }
  }, [cash, hasEnded, player.id, stats])

  const unlockPlot = useCallback((plotId) => {
    const price = PLOT_PRICES[plotId - 1]
    if (cash < price || hasEnded) return false
    setCash((current) => current - price)
    setPlots((current) => current.map((plot) => (
      plot.id === plotId ? { ...plot, unlocked: true } : plot
    )))
    setSelectedTarget({ type: 'plot', id: plotId })
    return true
  }, [cash, hasEnded])

  const plantCrop = useCallback((cropId) => {
    const crop = CROPS.find((item) => item.id === cropId)
    if (!crop || cash < crop.seedPrice || hasEnded) return false
    const plotId = selectedTarget.type === 'plot' ? selectedTarget.id : plots.find((plot) => plot.unlocked && !plot.crop)?.id
    const targetPlot = plots.find((plot) => plot.id === plotId)
    if (!targetPlot?.unlocked || targetPlot.crop) return false

    setCash((current) => current - crop.seedPrice)
    setPlots((current) => current.map((plot) => (
      plot.id === plotId
        ? { ...plot, crop: { cropId, plantedAt: now, startedAt: null, endsAt: null, fertilized: false } }
        : plot
    )))
    return true
  }, [cash, hasEnded, now, plots, selectedTarget])

  const waterSelected = useCallback(() => {
    if (selectedTarget.type !== 'plot' || hasEnded) return false
    let watered = false
    setPlots((current) => current.map((plot) => {
      if (plot.id !== selectedTarget.id || !plot.crop || plot.crop.startedAt) return plot
      const crop = CROPS.find((item) => item.id === plot.crop.cropId)
      watered = true
      return {
        ...plot,
        crop: { ...plot.crop, startedAt: now, endsAt: now + crop.growSeconds * 1000 },
      }
    }))
    return watered
  }, [hasEnded, now, selectedTarget])

  const buyTree = useCallback((treeId) => {
    const config = TREES.find((item) => item.id === treeId)
    if (!config || cash < config.price || hasEnded || trees.some((tree) => tree.treeId === treeId)) return false
    setCash((current) => current - config.price)
    const instanceId = `${treeId}-${crypto.randomUUID()}`
    setTrees((current) => [...current, {
      instanceId,
      treeId,
      startedAt: now,
      endsAt: now + config.cycleSeconds * 1000,
      fertilized: false,
    }])
    setSelectedTarget({ type: 'tree', id: instanceId })
    return true
  }, [cash, hasEnded, now, trees])

  const applyFertilizer = useCallback((grade) => {
    if (inventory[grade] <= 0 || hasEnded) return { ok: false, reason: 'empty' }
    let result = { ok: false, reason: 'target' }

    if (selectedTarget.type === 'plot') {
      setPlots((current) => current.map((plot) => {
        if (plot.id !== selectedTarget.id || !plot.crop?.startedAt || plot.crop.fertilized) return plot
        const config = CROPS.find((item) => item.id === plot.crop.cropId)
        const newEnd = calculateFertilizedEndTime({
          startedAt: plot.crop.startedAt,
          totalSeconds: config.growSeconds,
          grade,
          now,
        })
        if (!newEnd) { result = { ok: false, reason: 'late' }; return plot }
        result = { ok: true }
        return { ...plot, crop: { ...plot.crop, endsAt: newEnd, fertilized: grade } }
      }))
    } else {
      setTrees((current) => current.map((tree) => {
        if (tree.instanceId !== selectedTarget.id || tree.fertilized) return tree
        const config = TREES.find((item) => item.id === tree.treeId)
        const newEnd = calculateFertilizedEndTime({
          startedAt: tree.startedAt,
          totalSeconds: config.cycleSeconds,
          grade,
          isTree: true,
          now,
        })
        if (!newEnd) { result = { ok: false, reason: 'late' }; return tree }
        result = { ok: true }
        return { ...tree, endsAt: newEnd, fertilized: grade }
      }))
    }

    if (result.ok) setInventory((current) => ({ ...current, [grade]: current[grade] - 1 }))
    return result
  }, [hasEnded, inventory, now, selectedTarget])

  const awardFertilizer = useCallback((grade, responseTime) => {
    setInventory((current) => ({ ...current, [grade]: current[grade] + 1 }))
    setStats((current) => ({
      ...current,
      quizzesSolved: current.quizzesSolved + 1,
      bestQuizTime: current.bestQuizTime === null
        ? responseTime
        : Math.min(current.bestQuizTime, responseTime),
    }))
  }, [])

  return {
    cash,
    plots,
    trees,
    inventory,
    selectedTarget,
    setSelectedTarget,
    now,
    secondsLeft,
    hasEnded,
    leaderboard,
    stats,
    unlockPlot,
    plantCrop,
    waterSelected,
    buyTree,
    applyFertilizer,
    awardFertilizer,
  }
}
