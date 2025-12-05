import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useGameStore } from '@/store/gameStore'
import { useAuth } from '@/contexts/AuthContext'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

export const useSocket = (roomId, username) => {
  const socketRef = useRef(null)
  const store = useGameStore()
  const { session, user } = useAuth()

  useEffect(() => {
    if (!roomId || roomId === 'OFFLINE') return

    // Preparar autenticación
    const auth = {}
    if (session?.access_token) {
      // Usuario autenticado
      auth.token = session.access_token
    } else if (username) {
      // Usuario anónimo
      auth.username = username
    } else {
      console.error('No se proporcionó token ni username para la conexión')
      return
    }

    // Conectar al servidor
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      auth
    })

    const socket = socketRef.current

    // Manejar conexión exitosa
    socket.on('connect', () => {
      console.log('Conectado al servidor')
      // Unirse a la sala
      socket.emit('join-room', { roomId })
      // Agregar jugador automáticamente (el servidor usa socket.user)
      socket.emit('add-player', { roomId })
    })

    // Manejar errores de autenticación
    socket.on('connect_error', (error) => {
      console.error('Error de conexión:', error.message)
    })

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
  }, [roomId, session, username])

  // Métodos para emitir eventos
  const emitStartGame = () => {
    if (socketRef.current) {
      socketRef.current.emit('start-game', { roomId })
    }
  }

  const emitClue = (text) => {
    if (socketRef.current) {
      // El servidor obtiene playerId desde socket.user.id
      socketRef.current.emit('add-clue', {
        roomId,
        text
      })
    }
  }

  const emitVote = (votedPlayerId) => {
    if (socketRef.current) {
      // El servidor obtiene voterId desde socket.user.id
      socketRef.current.emit('submit-vote', {
        roomId,
        votedPlayerId
      })
    }
  }

  return {
    socket: socketRef.current,
    emitStartGame,
    emitClue,
    emitVote,
  }
}
