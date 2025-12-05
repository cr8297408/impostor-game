import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useGameStore } from '@/store/gameStore'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

export const useSocket = (roomId) => {
  const socketRef = useRef(null)
  const store = useGameStore()

  useEffect(() => {
    if (!roomId) return

    // Conectar al servidor
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
    })

    const socket = socketRef.current

    // Unirse a la sala
    socket.emit('join-room', { roomId, playerId: store.currentPlayerId })

    // Notificar al servidor sobre este jugador
    const currentPlayer = store.getPlayerById(store.currentPlayerId)
    if (currentPlayer) {
      socket.emit('add-player', { roomId, player: currentPlayer })
    }

    // Eventos del servidor
    socket.on('room-state', (state) => {
      // Actualizar estado del juego
      useGameStore.setState(state)
    })

    socket.on('player-joined', (player) => {
      store.addPlayer(player.name)
    })

    socket.on('player-left', (playerId) => {
      store.removePlayer(playerId)
    })

    socket.on('game-started', (gameState) => {
      useGameStore.setState(gameState)
    })

    socket.on('clue-added', ({ playerId, text }) => {
      store.addClue(playerId, text)
    })

    socket.on('vote-submitted', ({ voterId, votedPlayerId }) => {
      store.vote(voterId, votedPlayerId)
    })

    socket.on('game-ended', ({ winner, eliminatedPlayer }) => {
      useGameStore.setState({ winner, eliminatedPlayer, phase: 'results' })
    })

    // Cleanup
    return () => {
      socket.disconnect()
    }
  }, [roomId])

  // Métodos para emitir eventos
  const emitStartGame = () => {
    if (socketRef.current) {
      socketRef.current.emit('start-game', { roomId })
    }
  }

  const emitClue = (text) => {
    if (socketRef.current) {
      socketRef.current.emit('add-clue', {
        roomId,
        playerId: store.currentPlayerId,
        text
      })
    }
  }

  const emitVote = (votedPlayerId) => {
    if (socketRef.current) {
      socketRef.current.emit('submit-vote', {
        roomId,
        voterId: store.currentPlayerId,
        votedPlayerId
      })
    }
  }

  const emitAddPlayer = (player) => {
    if (socketRef.current) {
      socketRef.current.emit('add-player', {
        roomId,
        player
      })
    }
  }

  return {
    socket: socketRef.current,
    emitStartGame,
    emitClue,
    emitVote,
    emitAddPlayer,
  }
}
