import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { socketAuthMiddleware } from './middleware/socketAuth.js'
import { GameRepository, StatsRepository } from './repositories/index.js'
import { WORDS } from './words.js'
import routes from './routes/index.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', routes)

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// Almacenamiento en memoria de las salas ACTIVAS
const activeRooms = new Map()

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeRooms: activeRooms.size
  })
})

// Middleware de autenticación para Socket.io
io.use(socketAuthMiddleware)

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id, 'Usuario:', socket.user.username)

  // Unirse a una sala
  socket.on('join-room', async ({ roomId }) => {
    try {
      socket.join(roomId)
      console.log(`Usuario ${socket.user.username} se unió a la sala ${roomId}`)

      // Buscar o crear sala en DB
      let gameDb = await GameRepository.findByRoomId(roomId)

      if (!gameDb) {
        // Crear juego en DB
        gameDb = await GameRepository.create(roomId, {
          category: 'general',
          rounds: 3,
          timePerClue: 60
        })
      }

      // Buscar sala en memoria
      let room = activeRooms.get(roomId)

      if (!room) {
        // Crear sala en memoria
        room = {
          roomId,
          gameDbId: gameDb.id,
          players: [],
          phase: 'lobby',
          config: {
            maxPlayers: 8,
            rounds: 3,
            category: 'general',
            timePerClue: 60,
          }
        }
        activeRooms.set(roomId, room)
      }

      socket.emit('room-state', room)
    } catch (error) {
      console.error('Error joining room:', error)
      socket.emit('error', { message: 'Failed to join room' })
    }
  })

  // Agregar jugador
  socket.on('add-player', async ({ roomId }) => {
    try {
      const room = activeRooms.get(roomId)
      if (!room) return

      // Verificar si el jugador ya existe
      const existingPlayer = room.players.find(p => p.userId === socket.user.id)

      if (!existingPlayer) {
        const player = {
          id: socket.user.id,
          userId: socket.user.id,
          name: socket.user.username,
          avatar: socket.user.avatarColor,
          isImpostor: false,
          isEliminated: false,
          votes: 0,
        }

        room.players.push(player)

        // Agregar jugador al juego en DB
        await GameRepository.addPlayer(room.gameDbId, socket.user.id)

        io.to(roomId).emit('player-joined', player)
        io.to(roomId).emit('room-state', room)
      }
    } catch (error) {
      console.error('Error adding player:', error)
    }
  })

  // Iniciar juego
  socket.on('start-game', async ({ roomId }) => {
    try {
      const room = activeRooms.get(roomId)
      if (!room || room.players.length < 3) return

      // Asignar impostor
      const impostorIndex = Math.floor(Math.random() * room.players.length)
      const impostorPlayer = room.players[impostorIndex]

      room.players = room.players.map((player, index) => ({
        ...player,
        isImpostor: index === impostorIndex,
        isEliminated: false,
        votes: 0,
      }))

      // Seleccionar palabra
      const categoryWords = WORDS[room.config.category] || WORDS.general
      room.secretWord = categoryWords[Math.floor(Math.random() * categoryWords.length)]

      // Actualizar estado en memoria
      room.phase = 'secret'
      room.currentRound = 1
      room.currentTurn = 0
      room.clues = []
      room.votes = {}
      room.maxRounds = room.config.rounds

      // Actualizar DB
      await GameRepository.startGame(
        room.gameDbId,
        room.secretWord,
        impostorPlayer.userId
      )

      io.to(roomId).emit('game-started', room)
      io.to(roomId).emit('room-state', room)
    } catch (error) {
      console.error('Error starting game:', error)
    }
  })

  // Añadir pista
  socket.on('add-clue', async ({ roomId, text }) => {
    try {
      const room = activeRooms.get(roomId)
      if (!room) return

      const playerId = socket.user.id
      const player = room.players.find(p => p.userId === playerId)
      if (!player) return

      const clue = {
        playerId,
        playerName: player.name,
        text,
        round: room.currentRound,
      }

      room.clues.push(clue)

      // Guardar pista en DB
      await GameRepository.addClue(
        room.gameDbId,
        playerId,
        text,
        room.currentRound
      )

      // Incrementar stats de pistas
      if (!socket.user.isAnonymous) {
        await StatsRepository.incrementCluesGiven(playerId)
      }

      // Avanzar turno
      const activePlayers = room.players.filter(p => !p.isEliminated)
      room.currentTurn++

      if (room.currentTurn >= activePlayers.length) {
        if (room.currentRound >= room.maxRounds) {
          room.phase = 'voting'
        } else {
          room.currentRound++
          room.currentTurn = 0
        }
      }

      io.to(roomId).emit('clue-added', { playerId, text })
      io.to(roomId).emit('room-state', room)
    } catch (error) {
      console.error('Error adding clue:', error)
    }
  })

  // Votar
  socket.on('submit-vote', async ({ roomId, votedPlayerId }) => {
    try {
      const room = activeRooms.get(roomId)
      if (!room) return

      const voterId = socket.user.id
      room.votes[voterId] = votedPlayerId

      // Guardar voto en DB
      await GameRepository.addVote(room.gameDbId, voterId, votedPlayerId)

      io.to(roomId).emit('vote-submitted', { voterId, votedPlayerId })
      io.to(roomId).emit('room-state', room)

      // Verificar si todos votaron
      const activePlayers = room.players.filter(p => !p.isEliminated)
      if (Object.keys(room.votes).length === activePlayers.length) {
        // Calcular resultados
        const voteCounts = {}
        Object.values(room.votes).forEach(votedId => {
          voteCounts[votedId] = (voteCounts[votedId] || 0) + 1
        })

        let maxVotes = 0
        let eliminatedId = null

        Object.entries(voteCounts).forEach(([playerId, count]) => {
          if (count > maxVotes) {
            maxVotes = count
            eliminatedId = playerId
          }
        })

        if (eliminatedId) {
          room.players = room.players.map(p => ({
            ...p,
            isEliminated: p.userId === eliminatedId ? true : p.isEliminated,
            votes: voteCounts[p.userId] || 0,
          }))

          const eliminatedPlayer = room.players.find(p => p.userId === eliminatedId)
          room.eliminatedPlayer = eliminatedPlayer

          // Determinar ganador
          room.winner = eliminatedPlayer.isImpostor ? 'CIVILIANS' : 'IMPOSTOR'
          room.phase = 'results'

          // Guardar resultado en DB
          await GameRepository.finishGame(
            room.gameDbId,
            room.winner,
            eliminatedId,
            voteCounts
          )

          // Actualizar stats de todos los jugadores (solo usuarios autenticados)
          for (const player of room.players) {
            // Buscar el socket del jugador para ver si es anónimo
            const playerUser = await import('./repositories/UserRepository.js')
              .then(mod => mod.default.findById(player.userId))

            if (playerUser && !playerUser.isAnonymous) {
              const won = (player.isImpostor && room.winner === 'IMPOSTOR') ||
                         (!player.isImpostor && room.winner === 'CIVILIANS')

              await StatsRepository.updateAfterGame(player.userId, {
                won,
                wasImpostor: player.isImpostor
              })

              if (player.isEliminated) {
                await StatsRepository.incrementTimesEliminated(player.userId)
              }
            }
          }

          io.to(roomId).emit('game-ended', {
            winner: room.winner,
            eliminatedPlayer: room.eliminatedPlayer
          })
          io.to(roomId).emit('room-state', room)

          // Limpiar sala de memoria después de 5 minutos
          setTimeout(() => {
            activeRooms.delete(roomId)
          }, 5 * 60 * 1000)
        }
      }
    } catch (error) {
      console.error('Error submitting vote:', error)
    }
  })

  // Desconexión
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id)
  })
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor de El Impostor corriendo en puerto ${PORT}`)
  console.log(`📡 WebSocket Server activo`)
  console.log(`🗄️  Base de datos conectada`)
})
