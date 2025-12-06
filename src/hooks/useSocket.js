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
    if (!roomId) return

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
    socket.on('room-state', (serverState) => {
      const currentState = useGameStore.getState()
      const currentConfig = currentState.config
      const isLocalMode = roomId?.startsWith('OFFLINE')
      
      // En lobby, priorizar la config local (para preservar selecciones del usuario)
      // En otras fases, usar la config del servidor
      const mergedConfig = serverState.phase === 'lobby' 
        ? { ...serverState.config, ...currentConfig }
        : { ...currentConfig, ...serverState.config }
      
      // Orden de fases para comparación
      const phaseOrder = ['home', 'lobby', 'secret', 'clues', 'voting', 'results']
      const currentPhaseIndex = phaseOrder.indexOf(currentState.phase)
      const serverPhaseIndex = phaseOrder.indexOf(serverState.phase)
      
      // En modo local, mantener la fase del cliente si está más avanzada
      // (esto es para cuando el usuario avanza localmente después de ver su rol)
      const finalPhase = isLocalMode && currentPhaseIndex > serverPhaseIndex
        ? currentState.phase
        : serverState.phase
      
      // Para los jugadores: el servidor es la fuente de verdad
      // Pero en modo local, si el cliente tiene jugadores y el servidor no, preservar los del cliente
      // (esto puede pasar si hay un delay en la sincronización)
      const serverPlayers = serverState.players || []
      const clientPlayers = currentState.players || []
      const finalPlayers = serverPlayers.length >= clientPlayers.length 
        ? serverPlayers 
        : clientPlayers
      
      // Para votos en modo local: preservar los votos del cliente si hay más
      const currentVotes = currentState.votes || {}
      const serverVotes = serverState.votes || {}
      const finalVotes = isLocalMode && Object.keys(currentVotes).length > Object.keys(serverVotes).length
        ? currentVotes
        : (serverVotes || {})
      
      useGameStore.setState({
        ...serverState,
        config: mergedConfig,
        phase: finalPhase,
        players: finalPlayers,
        votes: finalVotes,
      })
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
      console.log("🚀 ~ emitStartGame ~ store:", store.config)
      socketRef.current.emit('start-game', {
        roomId,
        config: store.config
      })
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

  const emitVote = (votedPlayerId, voterId = null) => {
    if (socketRef.current) {
      // El servidor obtiene voterId desde socket.user.id
      socketRef.current.emit('submit-vote', {
        roomId,
        voterId: voterId || store.currentPlayerId,
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

  const emitRematch = () => {
    if (socketRef.current) {
      socketRef.current.emit('rematch', { roomId })
    }
  }

  return {
    socket: socketRef.current,
    emitStartGame,
    emitClue,
    emitVote,
    emitAddPlayer,
    emitRematch,
  }
}
