import { useRoom } from './hooks/useRoom.js'
import { LandingScreen } from './screens/LandingScreen.jsx'
import { LobbyScreen } from './screens/LobbyScreen.jsx'
import { FarmScreen } from './screens/FarmScreen.jsx'

function App() {
  const roomState = useRoom()
  const { room, player } = roomState

  if (!room || !player) {
    return (
      <LandingScreen
        onCreateRoom={roomState.createRoom}
        onJoinRoom={roomState.joinRoom}
        isLoading={roomState.isLoading}
        error={roomState.error}
        isOnline={roomState.isOnline}
      />
    )
  }

  if (room.status === 'playing') {
    return <FarmScreen room={room} player={player} players={roomState.players} />
  }

  return (
    <LobbyScreen
      room={room}
      player={player}
      players={roomState.players}
      onReady={roomState.toggleReady}
      onStart={roomState.startGame}
      onLeave={roomState.leaveRoom}
      isLoading={roomState.isLoading}
      error={roomState.error}
      isOnline={roomState.isOnline}
    />
  )
}

export default App
