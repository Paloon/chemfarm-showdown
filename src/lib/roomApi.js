import { MATCH_DURATION_SECONDS, STARTING_CASH } from '../data/gameConfig.js'
import { isSupabaseConfigured, supabase } from './supabase.js'
import { makeId, makeRoomCode } from '../utils/game.js'

async function uniqueRoomCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = makeRoomCode()
    const { data } = await supabase.from('rooms').select('id').eq('code', code).maybeSingle()
    if (!data) return code
  }
  throw new Error('ไม่สามารถสร้างรหัสห้องได้ กรุณาลองอีกครั้ง')
}

export async function createRoom(nickname) {
  if (!isSupabaseConfigured) return createDemoRoom(nickname, true)

  const code = await uniqueRoomCode()
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert({ code, status: 'lobby' })
    .select()
    .single()
  if (roomError) throw roomError

  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({ room_id: room.id, nickname, cash: STARTING_CASH, is_host: true, is_ready: true })
    .select()
    .single()
  if (playerError) throw playerError

  await supabase.from('rooms').update({ host_player_id: player.id }).eq('id', room.id)
  return { room: { ...room, host_player_id: player.id }, player }
}

export async function joinRoom(code, nickname) {
  if (!isSupabaseConfigured) return createDemoRoom(nickname, false, code)

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code)
    .eq('status', 'lobby')
    .maybeSingle()
  if (roomError || !room) throw new Error('ไม่พบห้องนี้ หรือเกมเริ่มไปแล้ว')

  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({ room_id: room.id, nickname, cash: STARTING_CASH })
    .select()
    .single()
  if (playerError) throw playerError
  return { room, player }
}

export async function setPlayerReady(playerId, isReady) {
  if (!isSupabaseConfigured) return { is_ready: isReady }
  const { data, error } = await supabase
    .from('players')
    .update({ is_ready: isReady })
    .eq('id', playerId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function startRoom(roomId) {
  if (!isSupabaseConfigured) {
    const now = new Date()
    return {
      status: 'playing',
      started_at: now.toISOString(),
      ends_at: new Date(now.getTime() + MATCH_DURATION_SECONDS * 1000).toISOString(),
    }
  }
  const { data, error } = await supabase.rpc('start_game', { target_room_id: roomId })
  if (error) throw error
  return data
}

export async function resetRoom(roomId) {
  if (!isSupabaseConfigured) return { status: 'lobby', started_at: null, ends_at: null }
  const { data, error } = await supabase.rpc('reset_room', { target_room_id: roomId })
  if (error) throw error
  return Array.isArray(data) ? data[0] : data
}

export async function fetchServerTime() {
  if (!isSupabaseConfigured) return Date.now()
  const { data, error } = await supabase.rpc('get_server_time')
  if (error) throw error
  return new Date(data).getTime()
}

export async function fetchQuestions() {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase.from('quiz_questions').select('*')
  if (error) throw error
  return data
}

export async function recordQuizAttempt(attempt) {
  if (!isSupabaseConfigured) return
  const { error } = await supabase.from('quiz_attempts').insert(attempt)
  if (error) throw error
}

export async function updatePlayerStats(playerId, stats) {
  if (!isSupabaseConfigured) return
  const { error } = await supabase.from('players').update(stats).eq('id', playerId)
  if (error) throw error
}

function createDemoRoom(nickname, isHost, requestedCode) {
  const roomId = makeId()
  const playerId = makeId()
  return {
    room: {
      id: roomId,
      code: requestedCode || makeRoomCode(),
      status: 'lobby',
      host_player_id: isHost ? playerId : 'demo-host',
    },
    player: {
      id: playerId,
      room_id: roomId,
      nickname,
      cash: STARTING_CASH,
      fertilizer_s_count: 0,
      fertilizer_a_count: 0,
      is_ready: isHost,
      is_host: isHost,
    },
  }
}
