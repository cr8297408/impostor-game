import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const AVATARS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
]

const initialState = {
  // Room & Connection
  roomId: null,
  isOnline: false,

  // Players
  players: [],
  currentPlayerId: null,

  // Game State
  phase: 'home', // 'home' | 'lobby' | 'secret' | 'clues' | 'voting' | 'results'
  secretWord: null,
  category: 'general',

  // Rounds & Turns
  currentRound: 1,
  currentTurn: 0,
  maxRounds: 3,

  // Clues
  clues: [],

  // Voting
  votes: {},
  eliminatedPlayer: null,

  // Results
  winner: null, // 'impostor' | 'civilians'

  // Config
  config: {
    maxPlayers: 8,
    rounds: 3,
    category: 'general',
    timePerClue: 60,
    gameTimer: 300, // 5 minutos por defecto para toda la partida
    useGameTimer: false, // Si está activado, usa temporizador general en vez de por turno
  }
}

export const useGameStore = create(
  devtools((set, get) => ({
    ...initialState,

    // === RESET ===
    resetGame: () => set(initialState),

    // Reset para revancha - mantiene jugadores, roomId y config
    resetForRematch: () => {
      const state = get()
      set({
        // Mantener
        roomId: state.roomId,
        isOnline: state.isOnline,
        players: state.players.map(p => ({
          ...p,
          isImpostor: false,
          isEliminated: false,
          votes: 0,
        })),
        currentPlayerId: state.currentPlayerId,
        config: state.config,

        // Resetear estado de juego
        phase: 'lobby',
        secretWord: null,
        currentRound: 1,
        currentTurn: 0,
        clues: [],
        votes: {},
        eliminatedPlayer: null,
        winner: null,
      })
    },

    // === ROOM MANAGEMENT ===
    createRoom: (isOnline = false) => {
      const roomId = isOnline ? Math.random().toString(36).substring(2, 8).toUpperCase() : 'OFFLINE'
      set({ roomId, isOnline, phase: 'lobby' })
      return roomId
    },

    joinRoom: (roomId, isOnline = false) => {
      set({ roomId, isOnline, phase: 'lobby' })
    },

    setConfig: (config) => set((state) => ({
      config: { ...state.config, ...config }
    })),

    // === PLAYER MANAGEMENT ===
    addPlayer: (name) => {
      const state = get()
      const existingPlayer = state.players.find(p => p.name === name)

      if (existingPlayer) return existingPlayer.id

      const id = Math.random().toString(36).substring(2, 11)
      const avatar = AVATARS[state.players.length % AVATARS.length]

      const newPlayer = {
        id,
        name,
        avatar,
        isImpostor: false,
        isEliminated: false,
        votes: 0,
      }

      set((state) => ({
        players: [...state.players, newPlayer],
        currentPlayerId: state.currentPlayerId || id
      }))

      return id
    },

    removePlayer: (playerId) => set((state) => ({
      players: state.players.filter(p => p.id !== playerId)
    })),

    setCurrentPlayer: (playerId) => set({ currentPlayerId: playerId }),

    // === GAME START ===
    startGame: (words) => {
      const state = get()

      if (state.players.length < 3) {
        console.error('Se necesitan al menos 3 jugadores')
        return
      }

      // Asignar impostor aleatoriamente
      const impostorIndex = Math.floor(Math.random() * state.players.length)
      const updatedPlayers = state.players.map((player, index) => ({
        ...player,
        isImpostor: index === impostorIndex,
        isEliminated: false,
        votes: 0,
      }))

      // Seleccionar palabra aleatoria
      const categoryWords = words[state.config.category] || words.general
      const randomWord = categoryWords[Math.floor(Math.random() * categoryWords.length)]

      set({
        players: updatedPlayers,
        secretWord: randomWord,
        phase: 'secret',
        currentRound: 1,
        currentTurn: 0,
        clues: [],
        votes: {},
        maxRounds: state.config.rounds,
      })
    },

    // === GAME FLOW ===
    moveToClues: () => set({ phase: 'clues' }),

    addClue: (playerId, text) => {
      const state = get()
      const player = state.players.find(p => p.id === playerId)

      if (!player) return

      const newClue = {
        playerId,
        playerName: player.name,
        text,
        round: state.currentRound,
      }

      set((state) => ({
        clues: [...state.clues, newClue],
      }))

      // Avanzar turno
      get().nextTurn()
    },

    nextTurn: () => {
      const state = get()
      const activePlayers = state.players.filter(p => !p.isEliminated)
      const nextTurn = state.currentTurn + 1

      if (nextTurn >= activePlayers.length) {
        // Fin de ronda
        if (state.currentRound >= state.maxRounds) {
          // Ir a votación
          set({ phase: 'voting' })
        } else {
          // Siguiente ronda
          set({
            currentRound: state.currentRound + 1,
            currentTurn: 0,
          })
        }
      } else {
        set({ currentTurn: nextTurn })
      }
    },

    // Terminar ronda anticipadamente
    endRoundEarly: () => {
      set({ phase: 'voting' })
    },

    // === VOTING ===
    vote: (voterId, votedPlayerId) => {
      set((state) => ({
        votes: { ...state.votes, [voterId]: votedPlayerId }
      }))
    },

    calculateVotes: () => {
      const state = get()
      const voteCounts = {}

      // Contar votos
      Object.values(state.votes).forEach(votedId => {
        voteCounts[votedId] = (voteCounts[votedId] || 0) + 1
      })

      // Encontrar el jugador con más votos
      let maxVotes = 0
      let eliminatedId = null

      Object.entries(voteCounts).forEach(([playerId, count]) => {
        if (count > maxVotes) {
          maxVotes = count
          eliminatedId = playerId
        }
      })

      if (!eliminatedId) return

      // Actualizar jugadores
      const updatedPlayers = state.players.map(p => ({
        ...p,
        isEliminated: p.id === eliminatedId ? true : p.isEliminated,
        votes: voteCounts[p.id] || 0,
      }))

      const eliminatedPlayer = updatedPlayers.find(p => p.id === eliminatedId)

      set({
        players: updatedPlayers,
        eliminatedPlayer,
      })

      // Determinar ganador
      get().determineWinner()
    },

    determineWinner: () => {
      const state = get()
      const { eliminatedPlayer } = state

      if (!eliminatedPlayer) return

      if (eliminatedPlayer.isImpostor) {
        // Los civiles ganaron
        set({ winner: 'civilians', phase: 'results' })
      } else {
        // El impostor ganó
        set({ winner: 'impostor', phase: 'results' })
      }
    },

    // === UTILITIES ===
    getCurrentPlayer: () => {
      const state = get()
      const activePlayers = state.players.filter(p => !p.isEliminated)
      return activePlayers[state.currentTurn]
    },

    isPlayerImpostor: (playerId) => {
      const state = get()
      const player = state.players.find(p => p.id === playerId)
      return player?.isImpostor || false
    },

    getPlayerById: (playerId) => {
      const state = get()
      return state.players.find(p => p.id === playerId)
    },
  }))
)
