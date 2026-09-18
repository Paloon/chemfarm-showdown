import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CROPS, PLOT_PRICES, STARTING_CASH, TREES } from '../data/gameConfig.js'
import { fetchServerTime, updatePlayerStats } from '../lib/roomApi.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import {
  calculateFertilizedEndTime,
  collectReadyProduction,
  createInitialPlots,
  createInitialTrees,
  makeId,
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
  const [incomeNotice, setIncomeNotice] = useState(null)
  const channelRef = useRef(null)
  const endedAtRef = useRef(false)
  const plotsRef = useRef(plots)
  const treesRef = useRef(trees)
  const incomeTimerRef = useRef(null)

  const endsAt = useMemo(() => new Date(room.ends_at).getTime(), [room.ends_at])
  const secondsLeft = Math.max(0, (endsAt - now) / 1000)
  const hasEnded = secondsLeft <= 0

  useEffect(() => { plotsRef.current = plots }, [plots])
  useEffect(() => { treesRef.current = trees }, [trees])
  useEffect(() => () => window.clearTimeout(incomeTimerRef.current), [])

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

      const production = collectReadyProduction({
        plots: plotsRef.current,
        trees: treesRef.current,
        now: tickNow,
      })

      if (production.plots !== plotsRef.current) {
        plotsRef.current = production.plots
        setPlots(production.plots)
      }
      if (production.trees !== treesRef.current) {
        treesRef.current = production.trees
        setTrees(production.trees)
      }
      if (production.totalGain > 0) {
        setCash((current) => current + production.totalGain)
        setIncomeNotice({ id: tickNow, amount: production.totalGain, fromTrees: production.treeGain })
        window.clearTimeout(incomeTimerRef.current)
        incomeTimerRef.current = window.setTimeout(() => setIncomeNotice(null), 1400)
      }
      if (production.harvestedCrops > 0) {
        setStats((current) => ({
          ...current,
          cropsHarvested: current.cropsHarvested + production.harvestedCrops,
        }))
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
      const payload = { id: player.id, nickname: player.nickname, cash, inventory, ...stats }
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
    const target = plots.find((plot) => plot.id === selectedTarget.id)
    if (!target?.crop || target.crop.startedAt) return false
    const crop = CROPS.find((item) => item.id === target.crop.cropId)
    setPlots((current) => current.map((plot) => {
      if (plot.id !== selectedTarget.id) return plot
      return {
        ...plot,
        crop: { ...plot.crop, startedAt: now, endsAt: now + crop.growSeconds * 1000 },
      }
    }))
    return true
  }, [hasEnded, now, plots, selectedTarget])

  const buyTree = useCallback((treeId) => {
    const config = TREES.find((item) => item.id === treeId)
    if (!config || cash < config.price || hasEnded || trees.some((tree) => tree.treeId === treeId)) return false
    setCash((current) => current - config.price)
    const instanceId = `${treeId}-${makeId()}`
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
    if (selectedTarget.type === 'plot') {
      const target = plots.find((plot) => plot.id === selectedTarget.id)
      if (!target?.crop?.startedAt || target.crop.fertilized) return { ok: false, reason: 'target' }
      const config = CROPS.find((item) => item.id === target.crop.cropId)
      const newEnd = calculateFertilizedEndTime({
        startedAt: target.crop.startedAt,
        totalSeconds: config.growSeconds,
        grade,
        now,
      })
      if (!newEnd) return { ok: false, reason: 'late' }
      setPlots((current) => current.map((plot) => (
        plot.id === selectedTarget.id
          ? { ...plot, crop: { ...plot.crop, endsAt: newEnd, fertilized: grade } }
          : plot
      )))
    } else {
      const target = trees.find((tree) => tree.instanceId === selectedTarget.id)
      if (!target || target.fertilized) return { ok: false, reason: 'target' }
      const config = TREES.find((item) => item.id === target.treeId)
      const newEnd = calculateFertilizedEndTime({
        startedAt: target.startedAt,
        totalSeconds: config.cycleSeconds,
        grade,
        isTree: true,
        now,
      })
      if (!newEnd) return { ok: false, reason: 'late' }
      setTrees((current) => current.map((tree) => (
        tree.instanceId === selectedTarget.id ? { ...tree, endsAt: newEnd, fertilized: grade } : tree
      )))
    }
    setInventory((current) => ({ ...current, [grade]: current[grade] - 1 }))
    return { ok: true }
  }, [hasEnded, inventory, now, plots, selectedTarget, trees])

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
    incomeNotice,
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
