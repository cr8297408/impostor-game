import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

app.use(cors())
app.use(express.json())

// Almacenamiento en memoria de las salas
const rooms = new Map()

// Palabras por categoría (mismo que en el cliente)
export const WORDS = {
  general: [
    'Pizza', 'Teléfono', 'Computadora', 'Guitarra', 'Bicicleta',
    'Café', 'Libro', 'Zapato', 'Reloj', 'Cámara',
    'Silla', 'Avión', 'Playa', 'Montaña', 'Restaurant',
    'Hospital', 'Escuela', 'Cine', 'Parque', 'Supermercado'
  ],

  animales: [
    'Perro', 'Gato', 'León', 'Elefante', 'Jirafa',
    'Delfín', 'Águila', 'Mariposa', 'Pingüino', 'Koala',
    'Tigre', 'Oso', 'Lobo', 'Zorro', 'Ballena',
    'Cocodrilo', 'Serpiente', 'Tortuga', 'Caballo', 'Vaca'
  ],

  comida: [
    'Hamburguesa', 'Sushi', 'Tacos', 'Pasta', 'Ensalada',
    'Helado', 'Chocolate', 'Pastel', 'Pollo', 'Pescado',
    'Pizza', 'Sandwich', 'Sopa', 'Arroz', 'Pan',
    'Queso', 'Frutas', 'Verduras', 'Carne', 'Huevos'
  ],

  deportes: [
    'Fútbol', 'Baloncesto', 'Tenis', 'Natación', 'Ciclismo',
    'Boxeo', 'Golf', 'Volleyball', 'Béisbol', 'Rugby',
    'Ski', 'Patinaje', 'Escalada', 'Surf', 'Atletismo',
    'Karate', 'Yoga', 'CrossFit', 'Gimnasia', 'Esgrima'
  ],

  profesiones: [
    'Doctor', 'Profesor', 'Ingeniero', 'Chef', 'Piloto',
    'Arquitecto', 'Abogado', 'Músico', 'Actor', 'Diseñador',
    'Periodista', 'Fotógrafo', 'Policía', 'Bombero', 'Científico',
    'Artista', 'Programador', 'Dentista', 'Veterinario', 'Escritor'
  ],

  lugares: [
    'París', 'Tokyo', 'Nueva York', 'Londres', 'Roma',
    'Barcelona', 'Dubai', 'Sídney', 'Ámsterdam', 'Berlín',
    'Playa', 'Montaña', 'Desierto', 'Selva', 'Ciudad',
    'Campo', 'Isla', 'Bosque', 'Lago', 'Río'
  ],

  objetos: [
    'Paraguas', 'Llave', 'Linterna', 'Maleta', 'Mochila',
    'Gafas', 'Sombrero', 'Bufanda', 'Guantes', 'Cinturón',
    'Bolígrafo', 'Cuaderno', 'Tijeras', 'Martillo', 'Destornillador',
    'Espejo', 'Cepillo', 'Peine', 'Toalla', 'Almohada'
  ],

  peliculas: [
    'Titanic', 'Avatar', 'Star Wars', 'Harry Potter', 'Matrix',
    'Inception', 'Interestelar', 'Gladiador', 'Rocky', 'Alien',
    'Terminator', 'Jurassic Park', 'Spider-Man', 'Batman', 'Superman',
    'Iron Man', 'Frozen', 'Toy Story', 'Shrek', 'Coco'
  ]
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size })
})

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id)

  // Unirse a una sala
  socket.on('join-room', ({ roomId, playerId }) => {
    socket.join(roomId)
    console.log(`Jugador ${playerId} se unió a la sala ${roomId}`)

    // Enviar estado actual de la sala
    const room = rooms.get(roomId)
    if (room) {
      socket.emit('room-state', room)
    } else {
      // Crear nueva sala
      rooms.set(roomId, {
        roomId,
        players: [],
        phase: 'lobby',
        config: {
          maxPlayers: 8,
          rounds: 3,
          category: 'general',
          timePerClue: 60,
        }
      })
    }
  })

  // Agregar jugador
  socket.on('add-player', ({ roomId, player }) => {
    const room = rooms.get(roomId)
    if (!room) return

    // Verificar si el jugador ya existe
    const existingPlayer = room.players.find(p => p.id === player.id)
    if (!existingPlayer) {
      room.players.push(player)
      io.to(roomId).emit('player-joined', player)
      io.to(roomId).emit('room-state', room)
    }
  })

  // Iniciar juego
  socket.on('start-game', ({ roomId }) => {
    const room = rooms.get(roomId)
    if (!room || room.players.length < 3) return

    // Asignar impostor
    const impostorIndex = Math.floor(Math.random() * room.players.length)
    room.players = room.players.map((player, index) => ({
      ...player,
      isImpostor: index === impostorIndex,
      isEliminated: false,
      votes: 0,
    }))

    // Seleccionar palabra
    const categoryWords = WORDS[room.config.category] || WORDS.general
    room.secretWord = categoryWords[Math.floor(Math.random() * categoryWords.length)]

    // Actualizar estado
    room.phase = 'secret'
    room.currentRound = 1
    room.currentTurn = 0
    room.clues = []
    room.votes = {}
    room.maxRounds = room.config.rounds

    io.to(roomId).emit('game-started', room)
    io.to(roomId).emit('room-state', room)
  })

  // Añadir pista
  socket.on('add-clue', ({ roomId, playerId, text }) => {
    const room = rooms.get(roomId)
    if (!room) return

    const player = room.players.find(p => p.id === playerId)
    if (!player) return

    const clue = {
      playerId,
      playerName: player.name,
      text,
      round: room.currentRound,
    }

    room.clues.push(clue)

    // Avanzar turno
    const activePlayers = room.players.filter(p => !p.isEliminated)
    room.currentTurn++

    if (room.currentTurn >= activePlayers.length) {
      if (room.currentRound >= room.maxRounds) {
        // Ir a votación
        room.phase = 'voting'
      } else {
        // Siguiente ronda
        room.currentRound++
        room.currentTurn = 0
      }
    }

    io.to(roomId).emit('clue-added', { playerId, text })
    io.to(roomId).emit('room-state', room)
  })

  // Votar
  socket.on('submit-vote', ({ roomId, voterId, votedPlayerId }) => {
    const room = rooms.get(roomId)
    if (!room) return

    room.votes[voterId] = votedPlayerId

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
          isEliminated: p.id === eliminatedId ? true : p.isEliminated,
          votes: voteCounts[p.id] || 0,
        }))

        const eliminatedPlayer = room.players.find(p => p.id === eliminatedId)
        room.eliminatedPlayer = eliminatedPlayer

        // Determinar ganador
        room.winner = eliminatedPlayer.isImpostor ? 'civilians' : 'impostor'
        room.phase = 'results'

        io.to(roomId).emit('game-ended', {
          winner: room.winner,
          eliminatedPlayer: room.eliminatedPlayer
        })
        io.to(roomId).emit('room-state', room)
      }
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
})
