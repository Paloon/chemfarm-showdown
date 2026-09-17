import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createRoom as createRoomRequest,
  joinRoom as joinRoomRequest,
  setPlayerReady,
  startRoom as startRoomRequest,
} from '../lib/roomApi.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import { savePlayerSession } from '../lib/storage.js'

export function useRoom() {
  const [room, setRoom] = useState(null)
  const [player, setPlayer] = useState(null)
  const [players, setPlayers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const channelRef = useRef(null)

  const enterRoom = useCallback(async (request, ...args) => {
    setIsLoading(true)
    setError('')
    try {
      const result = await request(...args)
      setRoom(result.room)
      setPlayer(result.player)
      setPlayers(
        result.player.is_host
          ? [result.player]
          : [
              {
                id: 'demo-host',
                nickname: 'เจ้าของห้อง',
                cash: 100,
                is_ready: true,
                is_host: true,
              },
              result.player,
            ],
      )
      savePlayerSession({ roomId: result.room.id, playerId: result.player.id })
      window.history.replaceState({}, '', `?room=${result.room.code}`)
      return result
    } catch (requestError) {
      setError(requestError.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createRoom = useCallback(
    (nickname) => enterRoom(createRoomRequest, nickname),
    [enterRoom],
  )

  const joinRoom = useCallback(
    (code, nickname) => enterRoom(joinRoomRequest, code, nickname),
    [enterRoom],
  )

  const toggleReady = useCallback(async () => {
    if (!player) return
    setError('')
    try {
      const nextReady = !player.is_ready
      await setPlayerReady(player.id, nextReady)
      setPlayer((current) => ({ ...current, is_ready: nextReady }))
      setPlayers((current) =>
        current.map((item) => (item.id === player.id ? { ...item, is_ready: nextReady } : item)),
      )
    } catch (requestError) {
      setError(requestError.message || 'เปลี่ยนสถานะไม่สำเร็จ')
    }
  }, [player])

  const startGame = useCallback(async () => {
    if (!room) return null
    setIsLoading(true)
    setError('')
    try {
      const updatedRoom = await startRoomRequest(room.id)
      const nextRoom = Array.isArray(updatedRoom) ? updatedRoom[0] : updatedRoom
      setRoom((current) => ({ ...current, ...nextRoom }))
      return nextRoom
    } catch (requestError) {
      setError(requestError.message || 'เริ่มเกมไม่สำเร็จ')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [room])

  const leaveRoom = useCallback(() => {
    if (channelRef.current) supabase?.removeChannel(channelRef.current)
    channelRef.current = null
    setRoom(null)
    setPlayer(null)
    setPlayers([])
    setError('')
    window.history.replaceState({}, '', window.location.pathname)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !room?.id) return undefined

    const refreshPlayers = async () => {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', room.id)
        .order('joined_at')
      if (data) setPlayers(data)
    }

    refreshPlayers()
    const channel = supabase
      .channel(`lobby:${room.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${room.id}` },
        refreshPlayers,
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${room.id}` },
        ({ new: nextRoom }) => setRoom(nextRoom),
      )
      .subscribe()

    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [room?.id])

  return {
    room,
    player,
    players,
    isLoading,
    error,
    isOnline: isSupabaseConfigured,
    createRoom,
    joinRoom,
    toggleReady,
    startGame,
    leaveRoom,
    setPlayer,
    setPlayers,
  }
}
