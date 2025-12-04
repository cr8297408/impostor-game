# Plan de Implementación: Autenticación + Base de Datos + Repositories

## Resumen Ejecutivo

Agregar autenticación con Supabase Auth, base de datos PostgreSQL con Prisma, y patrón repository al juego "El Impostor".

**Decisiones arquitectónicas:**
- ✅ Auth: Supabase Auth (anónimo opcional)
- ✅ Datos: Stats + resúmenes de partidas
- ✅ Real-time: Memoria + guardar al final
- ✅ Anónimo: Permitido, stats si te registras
- ✅ Estructura: Monorepo
- ✅ Prisma: Normalizado

---

## Fase 1: Setup Inicial de Infraestructura

### 1.1 Configurar Supabase
- [ ] Crear proyecto en Supabase
- [ ] Obtener credenciales (URL, anon key, service key)
- [ ] Configurar Authentication providers (Email/Password mínimo)
- [ ] Habilitar Row Level Security (RLS) en las tablas

### 1.2 Instalar Dependencias

**Server:**
```bash
cd server
pnpm add @supabase/supabase-js
pnpm add @prisma/client
pnpm add -D prisma
pnpm add dotenv
pnpm add bcryptjs jsonwebtoken  # Para validación adicional si es necesario
```

**Client:**
```bash
cd ..
pnpm add @supabase/supabase-js
```

### 1.3 Configurar Variables de Entorno

**`.env` (root):**
```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Server
VITE_SOCKET_URL=http://localhost:3001
```

**`server/.env`:**
```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx  # Service key para operaciones admin

# Database (PostgreSQL de Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Server
PORT=3001
NODE_ENV=development
```

---

## Fase 2: Schema de Prisma

### 2.1 Inicializar Prisma

```bash
cd server
npx prisma init
```

### 2.2 Definir Schema (`server/prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// AUTENTICACIÓN Y USUARIOS
// ============================================

model User {
  id            String        @id @default(uuid())
  email         String?       @unique
  username      String        @unique
  avatarColor   String        @default("#3b82f6")

  // Supabase Auth ID (si está autenticado)
  supabaseId    String?       @unique

  // Si es anónimo
  isAnonymous   Boolean       @default(true)

  // Timestamps
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  lastLoginAt   DateTime      @default(now())

  // Relaciones
  stats         UserStats?
  gamePlayers   GamePlayer[]
  clues         Clue[]
  votes         Vote[]

  @@index([supabaseId])
  @@index([username])
  @@map("users")
}

model UserStats {
  id                    String   @id @default(uuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Estadísticas generales
  gamesPlayed           Int      @default(0)
  gamesWon              Int      @default(0)
  gamesLost             Int      @default(0)

  // Como impostor
  gamesAsImpostor       Int      @default(0)
  winsAsImpostor        Int      @default(0)
  lossesAsImpostor      Int      @default(0)

  // Como civil
  gamesAsCivilian       Int      @default(0)
  winsAsCivilian        Int      @default(0)
  lossesAsCivilian      Int      @default(0)

  // Rachas
  currentStreak         Int      @default(0)
  bestStreak            Int      @default(0)

  // Métricas adicionales
  totalCluesGiven       Int      @default(0)
  totalVotesCast        Int      @default(0)
  timesEliminated       Int      @default(0)
  correctImpostorGuesses Int     @default(0)

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@map("user_stats")
}

// ============================================
// JUEGOS Y PARTIDAS
// ============================================

model Game {
  id                String        @id @default(uuid())
  roomId            String        @unique

  // Configuración
  category          String        @default("general")
  maxRounds         Int           @default(3)
  timePerClue       Int           @default(60)

  // Estado del juego
  status            GameStatus    @default(LOBBY)
  secretWord        String?
  currentRound      Int           @default(1)

  // Resultado
  winner            WinnerType?   // 'impostor' | 'civilians'
  eliminatedPlayerId String?

  // Timestamps
  createdAt         DateTime      @default(now())
  startedAt         DateTime?
  endedAt           DateTime?

  // Relaciones
  players           GamePlayer[]
  clues             Clue[]
  votes             Vote[]

  @@index([roomId])
  @@index([status])
  @@index([createdAt])
  @@map("games")
}

enum GameStatus {
  LOBBY
  PLAYING
  VOTING
  FINISHED
  ABANDONED
}

enum WinnerType {
  IMPOSTOR
  CIVILIANS
}

model GamePlayer {
  id              String    @id @default(uuid())
  gameId          String
  userId          String

  game            Game      @relation(fields: [gameId], references: [id], onDelete: Cascade)
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Rol en el juego
  isImpostor      Boolean   @default(false)
  isEliminated    Boolean   @default(false)
  votesReceived   Int       @default(0)

  // Timestamps
  joinedAt        DateTime  @default(now())

  @@unique([gameId, userId])
  @@index([gameId])
  @@index([userId])
  @@map("game_players")
}

model Clue {
  id              String    @id @default(uuid())
  gameId          String
  userId          String

  game            Game      @relation(fields: [gameId], references: [id], onDelete: Cascade)
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  text            String
  round           Int

  createdAt       DateTime  @default(now())

  @@index([gameId])
  @@index([userId])
  @@map("clues")
}

model Vote {
  id              String    @id @default(uuid())
  gameId          String
  voterId         String
  votedPlayerId   String

  game            Game      @relation(fields: [gameId], references: [id], onDelete: Cascade)
  voter           User      @relation(fields: [voterId], references: [id], onDelete: Cascade)

  createdAt       DateTime  @default(now())

  @@unique([gameId, voterId])
  @@index([gameId])
  @@map("votes")
}
```

### 2.3 Generar y Ejecutar Migraciones

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

---

## Fase 3: Arquitectura de Repositories

### 3.1 Estructura de Carpetas

```
server/
├── src/
│   ├── config/
│   │   ├── database.js       # Prisma client singleton
│   │   └── supabase.js       # Supabase client
│   ├── repositories/
│   │   ├── UserRepository.js
│   │   ├── GameRepository.js
│   │   ├── StatsRepository.js
│   │   └── index.js
│   ├── services/
│   │   ├── AuthService.js
│   │   ├── GameService.js
│   │   └── StatsService.js
│   ├── middleware/
│   │   ├── auth.js           # Middleware de autenticación
│   │   └── socketAuth.js     # Middleware para Socket.io
│   ├── utils/
│   │   └── errors.js         # Custom errors
│   └── index.js              # Main server file (refactor de index.js)
├── prisma/
│   └── schema.prisma
└── package.json
```

### 3.2 Implementar Repositories

**`server/src/config/database.js`**
```javascript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

export default prisma
```

**`server/src/repositories/UserRepository.js`**
```javascript
import prisma from '../config/database.js'

export class UserRepository {
  // Crear usuario anónimo
  async createAnonymous(username, avatarColor) {
    return await prisma.user.create({
      data: {
        username,
        avatarColor,
        isAnonymous: true,
        stats: {
          create: {}
        }
      },
      include: { stats: true }
    })
  }

  // Crear usuario autenticado
  async createAuthenticated(supabaseId, email, username, avatarColor) {
    return await prisma.user.create({
      data: {
        supabaseId,
        email,
        username,
        avatarColor,
        isAnonymous: false,
        stats: {
          create: {}
        }
      },
      include: { stats: true }
    })
  }

  // Encontrar por Supabase ID
  async findBySupabaseId(supabaseId) {
    return await prisma.user.findUnique({
      where: { supabaseId },
      include: { stats: true }
    })
  }

  // Encontrar por username
  async findByUsername(username) {
    return await prisma.user.findUnique({
      where: { username },
      include: { stats: true }
    })
  }

  // Encontrar por ID
  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: { stats: true }
    })
  }

  // Actualizar último login
  async updateLastLogin(userId) {
    return await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    })
  }

  // Convertir usuario anónimo a autenticado
  async convertToAuthenticated(userId, supabaseId, email) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        supabaseId,
        email,
        isAnonymous: false
      },
      include: { stats: true }
    })
  }
}

export default new UserRepository()
```

**`server/src/repositories/GameRepository.js`**
```javascript
import prisma from '../config/database.js'

export class GameRepository {
  // Crear juego
  async create(roomId, config) {
    return await prisma.game.create({
      data: {
        roomId,
        category: config.category || 'general',
        maxRounds: config.rounds || 3,
        timePerClue: config.timePerClue || 60,
        status: 'LOBBY'
      }
    })
  }

  // Encontrar por roomId
  async findByRoomId(roomId) {
    return await prisma.game.findUnique({
      where: { roomId },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarColor: true
              }
            }
          }
        },
        clues: true,
        votes: true
      }
    })
  }

  // Agregar jugador al juego
  async addPlayer(gameId, userId, isImpostor = false) {
    return await prisma.gamePlayer.create({
      data: {
        gameId,
        userId,
        isImpostor
      }
    })
  }

  // Iniciar juego
  async startGame(gameId, secretWord, impostorUserId) {
    // Actualizar el juego
    const game = await prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'PLAYING',
        secretWord,
        startedAt: new Date()
      }
    })

    // Marcar al impostor
    await prisma.gamePlayer.updateMany({
      where: {
        gameId,
        userId: impostorUserId
      },
      data: {
        isImpostor: true
      }
    })

    return game
  }

  // Agregar pista
  async addClue(gameId, userId, text, round) {
    return await prisma.clue.create({
      data: {
        gameId,
        userId,
        text,
        round
      }
    })
  }

  // Agregar voto
  async addVote(gameId, voterId, votedPlayerId) {
    return await prisma.vote.create({
      data: {
        gameId,
        voterId,
        votedPlayerId
      }
    })
  }

  // Finalizar juego
  async finishGame(gameId, winner, eliminatedPlayerId, voteCounts) {
    // Actualizar votos recibidos por cada jugador
    for (const [playerId, count] of Object.entries(voteCounts)) {
      await prisma.gamePlayer.updateMany({
        where: {
          gameId,
          userId: playerId
        },
        data: {
          votesReceived: count
        }
      })
    }

    // Marcar jugador eliminado
    if (eliminatedPlayerId) {
      await prisma.gamePlayer.updateMany({
        where: {
          gameId,
          userId: eliminatedPlayerId
        },
        data: {
          isEliminated: true
        }
      })
    }

    // Finalizar juego
    return await prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'FINISHED',
        winner,
        eliminatedPlayerId,
        endedAt: new Date()
      },
      include: {
        players: {
          include: {
            user: true
          }
        }
      }
    })
  }

  // Obtener juegos recientes de un usuario
  async getUserGames(userId, limit = 10) {
    return await prisma.gamePlayer.findMany({
      where: { userId },
      include: {
        game: {
          include: {
            players: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatarColor: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      },
      take: limit
    })
  }
}

export default new GameRepository()
```

**`server/src/repositories/StatsRepository.js`**
```javascript
import prisma from '../config/database.js'

export class StatsRepository {
  // Obtener stats de usuario
  async getUserStats(userId) {
    return await prisma.userStats.findUnique({
      where: { userId }
    })
  }

  // Actualizar stats después de un juego
  async updateAfterGame(userId, gameResult) {
    const { won, wasImpostor } = gameResult
    const stats = await this.getUserStats(userId)

    const updates = {
      gamesPlayed: { increment: 1 },
      totalVotesCast: { increment: 1 }
    }

    // Stats generales
    if (won) {
      updates.gamesWon = { increment: 1 }
      updates.currentStreak = { increment: 1 }
    } else {
      updates.gamesLost = { increment: 1 }
      updates.currentStreak = 0
    }

    // Stats por rol
    if (wasImpostor) {
      updates.gamesAsImpostor = { increment: 1 }
      if (won) {
        updates.winsAsImpostor = { increment: 1 }
      } else {
        updates.lossesAsImpostor = { increment: 1 }
      }
    } else {
      updates.gamesAsCivilian = { increment: 1 }
      if (won) {
        updates.winsAsCivilian = { increment: 1 }
      } else {
        updates.lossesAsCivilian = { increment: 1 }
      }
    }

    // Actualizar mejor racha
    const newCurrentStreak = won ? (stats.currentStreak + 1) : 0
    if (newCurrentStreak > stats.bestStreak) {
      updates.bestStreak = newCurrentStreak
    }

    return await prisma.userStats.update({
      where: { userId },
      data: updates
    })
  }

  // Incrementar pistas dadas
  async incrementCluesGiven(userId) {
    return await prisma.userStats.update({
      where: { userId },
      data: {
        totalCluesGiven: { increment: 1 }
      }
    })
  }

  // Incrementar veces eliminado
  async incrementTimesEliminated(userId) {
    return await prisma.userStats.update({
      where: { userId },
      data: {
        timesEliminated: { increment: 1 }
      }
    })
  }

  // Obtener leaderboard
  async getLeaderboard(limit = 10, orderBy = 'gamesWon') {
    return await prisma.userStats.findMany({
      take: limit,
      orderBy: {
        [orderBy]: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarColor: true,
            isAnonymous: true
          }
        }
      },
      where: {
        user: {
          isAnonymous: false  // Solo usuarios registrados en leaderboard
        }
      }
    })
  }
}

export default new StatsRepository()
```

**`server/src/repositories/index.js`**
```javascript
export { default as UserRepository } from './UserRepository.js'
export { default as GameRepository } from './GameRepository.js'
export { default as StatsRepository } from './StatsRepository.js'
```

---

## Fase 4: Servicios de Autenticación

### 4.1 Configurar Supabase Client

**`server/src/config/supabase.js`**
```javascript
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
```

**`src/config/supabase.js` (Client)**
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 4.2 Auth Service

**`server/src/services/AuthService.js`**
```javascript
import { supabase } from '../config/supabase.js'
import { UserRepository } from '../repositories/index.js'

export class AuthService {
  // Verificar token de Supabase
  async verifyToken(token) {
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      throw new Error('Invalid token')
    }

    return user
  }

  // Crear o encontrar usuario desde Supabase
  async getOrCreateUserFromSupabase(supabaseUser) {
    // Buscar usuario existente
    let user = await UserRepository.findBySupabaseId(supabaseUser.id)

    if (!user) {
      // Crear nuevo usuario
      const username = supabaseUser.email?.split('@')[0] || `user_${Date.now()}`
      const avatarColor = this.generateRandomColor()

      user = await UserRepository.createAuthenticated(
        supabaseUser.id,
        supabaseUser.email,
        username,
        avatarColor
      )
    } else {
      // Actualizar último login
      await UserRepository.updateLastLogin(user.id)
    }

    return user
  }

  // Crear usuario anónimo
  async createAnonymousUser(username) {
    const avatarColor = this.generateRandomColor()
    return await UserRepository.createAnonymous(username, avatarColor)
  }

  // Convertir usuario anónimo a autenticado
  async convertAnonymousToAuth(anonymousUserId, supabaseUser) {
    return await UserRepository.convertToAuthenticated(
      anonymousUserId,
      supabaseUser.id,
      supabaseUser.email
    )
  }

  generateRandomColor() {
    const colors = [
      '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }
}

export default new AuthService()
```

### 4.3 Middleware de Autenticación

**`server/src/middleware/auth.js`**
```javascript
import { AuthService } from '../services/AuthService.js'

// Middleware para rutas HTTP (opcional - para APIs REST)
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const supabaseUser = await AuthService.verifyToken(token)
    const user = await AuthService.getOrCreateUserFromSupabase(supabaseUser)

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Middleware opcional (permite anónimos)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (token) {
      const supabaseUser = await AuthService.verifyToken(token)
      const user = await AuthService.getOrCreateUserFromSupabase(supabaseUser)
      req.user = user
    }

    next()
  } catch (error) {
    // Continuar sin usuario autenticado
    next()
  }
}
```

**`server/src/middleware/socketAuth.js`**
```javascript
import { AuthService } from '../services/AuthService.js'

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    const username = socket.handshake.auth.username

    if (token) {
      // Usuario autenticado
      const supabaseUser = await AuthService.verifyToken(token)
      const user = await AuthService.getOrCreateUserFromSupabase(supabaseUser)
      socket.user = user
    } else if (username) {
      // Usuario anónimo
      const user = await AuthService.createAnonymousUser(username)
      socket.user = user
    } else {
      throw new Error('No authentication provided')
    }

    next()
  } catch (error) {
    next(new Error('Authentication failed'))
  }
}
```

---

## Fase 5: Integración con el Servidor de Socket.io

### 5.1 Refactorizar `server/index.js` → `server/src/index.js`

```javascript
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { socketAuthMiddleware } from './middleware/socketAuth.js'
import { GameRepository, StatsRepository } from './repositories/index.js'

dotenv.config()

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
      const { WORDS } = await import('./words.js')  // Mover WORDS a archivo separado
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
      await StatsRepository.incrementCluesGiven(playerId)

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

          // Actualizar stats de todos los jugadores
          for (const player of room.players) {
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
```

### 5.2 Mover WORDS a archivo separado

**`server/src/words.js`**
```javascript
export const WORDS = {
  // ... copiar todo el objeto WORDS del archivo anterior
}

export const CATEGORIES = [
  // ... copiar todas las categorías
]
```

---

## Fase 6: Integración en el Cliente (React)

### 6.1 Context de Autenticación

**`src/contexts/AuthContext.jsx`**
```javascript
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/config/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 6.2 Actualizar useSocket para incluir autenticación

**`src/hooks/useSocket.js`**
```javascript
import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useGameStore } from '@/store/gameStore'
import { useAuth } from '@/contexts/AuthContext'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

export const useSocket = (roomId) => {
  const socketRef = useRef(null)
  const store = useGameStore()
  const { session, user } = useAuth()

  useEffect(() => {
    if (!roomId || roomId === 'OFFLINE') return

    // Preparar autenticación
    const auth = {}

    if (session?.access_token) {
      auth.token = session.access_token
    } else {
      // Usuario anónimo - necesita username
      const username = store.getPlayerById(store.currentPlayerId)?.name || 'Anónimo'
      auth.username = username
    }

    // Conectar al servidor con autenticación
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      auth
    })

    const socket = socketRef.current

    // Eventos de conexión
    socket.on('connect', () => {
      console.log('Conectado al servidor')
      // Unirse a la sala
      socket.emit('join-room', { roomId })
      socket.emit('add-player', { roomId })
    })

    socket.on('connect_error', (error) => {
      console.error('Error de conexión:', error.message)
    })

    // Eventos del servidor
    socket.on('room-state', (state) => {
      useGameStore.setState(state)
    })

    socket.on('player-joined', (player) => {
      // Ya manejado por room-state
    })

    socket.on('player-left', (playerId) => {
      store.removePlayer(playerId)
    })

    socket.on('game-started', (gameState) => {
      useGameStore.setState(gameState)
    })

    socket.on('clue-added', ({ playerId, text }) => {
      // Ya manejado por room-state
    })

    socket.on('vote-submitted', ({ voterId, votedPlayerId }) => {
      // Ya manejado por room-state
    })

    socket.on('game-ended', ({ winner, eliminatedPlayer }) => {
      useGameStore.setState({ winner, eliminatedPlayer, phase: 'results' })
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    // Cleanup
    return () => {
      socket.disconnect()
    }
  }, [roomId, session])

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
        text
      })
    }
  }

  const emitVote = (votedPlayerId) => {
    if (socketRef.current) {
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
```

### 6.3 Pantallas de Autenticación

**`src/screens/Auth/Login.jsx`**
```javascript
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Iniciar Sesión</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/register" className="text-impostor-accent hover:underline">
            ¿No tienes cuenta? Regístrate
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-gray-400 hover:text-white">
            Continuar sin cuenta
          </Link>
        </div>
      </Card>
    </div>
  )
}
```

**`src/screens/Auth/Register.jsx`**
```javascript
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signUp(email, password, username)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold text-green-500 mb-4">
            ¡Registro exitoso!
          </h2>
          <p className="text-gray-300">
            Por favor revisa tu correo para confirmar tu cuenta.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Registrarse</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Contraseña (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-impostor-accent hover:underline">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-gray-400 hover:text-white">
            Continuar sin cuenta
          </Link>
        </div>
      </Card>
    </div>
  )
}
```

### 6.4 Componente de Perfil/Stats

**`src/components/user/UserProfile.jsx`**
```javascript
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function UserProfile() {
  const { user, signOut, isAuthenticated } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch user stats from API
      fetchUserStats()
    }
  }, [isAuthenticated])

  const fetchUserStats = async () => {
    // TODO: Implementar endpoint de API para obtener stats
    setLoading(false)
  }

  if (!isAuthenticated) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-400 mb-4">
          Inicia sesión para ver tus estadísticas
        </p>
        <Button onClick={() => window.location.href = '/login'}>
          Iniciar Sesión
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{user.user_metadata?.username}</h2>
          <p className="text-gray-400">{user.email}</p>
        </div>
        <Button onClick={signOut} variant="secondary">
          Cerrar Sesión
        </Button>
      </div>

      {loading ? (
        <p>Cargando estadísticas...</p>
      ) : stats ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-impostor-dark p-4 rounded">
            <p className="text-gray-400 text-sm">Partidas Jugadas</p>
            <p className="text-3xl font-bold">{stats.gamesPlayed}</p>
          </div>
          <div className="bg-impostor-dark p-4 rounded">
            <p className="text-gray-400 text-sm">Victorias</p>
            <p className="text-3xl font-bold text-green-500">{stats.gamesWon}</p>
          </div>
          <div className="bg-impostor-dark p-4 rounded">
            <p className="text-gray-400 text-sm">Como Impostor</p>
            <p className="text-3xl font-bold text-red-500">{stats.gamesAsImpostor}</p>
          </div>
          <div className="bg-impostor-dark p-4 rounded">
            <p className="text-gray-400 text-sm">Mejor Racha</p>
            <p className="text-3xl font-bold text-yellow-500">{stats.bestStreak}</p>
          </div>
        </div>
      ) : (
        <p>No hay estadísticas disponibles</p>
      )}
    </Card>
  )
}
```

### 6.5 Actualizar App.jsx para incluir AuthProvider y rutas

**`src/App.jsx`**
```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider } from './contexts/AuthContext'
import Home from './screens/Home'
import Login from './screens/Auth/Login'
import Register from './screens/Auth/Register'
import Lobby from './screens/Lobby'
import SecretWord from './screens/SecretWord'
import Game from './screens/Game'
import Voting from './screens/Voting'
import Results from './screens/Results'
import AdLayout from './components/ads/AdLayout'

function App() {
  return (
    <AuthProvider>
      <Router>
        <AdLayout>
          <div className="min-h-screen bg-gradient-to-br from-impostor-darker via-impostor-dark to-impostor-darker">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/lobby/:roomId?" element={<Lobby />} />
                <Route path="/secret/:roomId?" element={<SecretWord />} />
                <Route path="/game/:roomId?" element={<Game />} />
                <Route path="/voting/:roomId?" element={<Voting />} />
                <Route path="/results/:roomId?" element={<Results />} />
              </Routes>
            </AnimatePresence>
          </div>
        </AdLayout>
      </Router>
    </AuthProvider>
  )
}

export default App
```

---

## Fase 7: APIs REST para Stats (Opcional pero Recomendado)

### 7.1 Crear rutas de API

**`server/src/routes/stats.js`**
```javascript
import express from 'express'
import { StatsRepository, GameRepository } from '../repositories/index.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Obtener stats del usuario actual
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const stats = await StatsRepository.getUserStats(req.user.id)
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener historial de juegos del usuario
router.get('/me/games', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const games = await GameRepository.getUserGames(req.user.id, limit)
    res.json(games)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const orderBy = req.query.orderBy || 'gamesWon'
    const leaderboard = await StatsRepository.getLeaderboard(limit, orderBy)
    res.json(leaderboard)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
```

**`server/src/routes/index.js`**
```javascript
import express from 'express'
import statsRoutes from './stats.js'

const router = express.Router()

router.use('/stats', statsRoutes)

export default router
```

**Actualizar `server/src/index.js`:**
```javascript
import apiRoutes from './routes/index.js'

// ... después de app.use(express.json())
app.use('/api', apiRoutes)
```

---

## Fase 8: Testing y Validación

### 8.1 Crear datos de prueba

**`server/prisma/seed.js`**
```javascript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crear usuarios de prueba
  const user1 = await prisma.user.create({
    data: {
      username: 'test_user_1',
      email: 'test1@example.com',
      avatarColor: '#3b82f6',
      isAnonymous: false,
      stats: {
        create: {
          gamesPlayed: 10,
          gamesWon: 6,
          gamesAsImpostor: 3,
          winsAsImpostor: 2,
          bestStreak: 4
        }
      }
    }
  })

  const user2 = await prisma.user.create({
    data: {
      username: 'test_user_2',
      email: 'test2@example.com',
      avatarColor: '#ef4444',
      isAnonymous: false,
      stats: {
        create: {
          gamesPlayed: 8,
          gamesWon: 3,
          gamesAsImpostor: 2,
          winsAsImpostor: 1,
          bestStreak: 2
        }
      }
    }
  })

  console.log('✅ Seed completado:', { user1, user2 })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Ejecutar seed:**
```bash
npx prisma db seed
```

**Agregar a `server/package.json`:**
```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

### 8.2 Verificar funcionamiento

**Checklist de testing:**
- [ ] Usuarios pueden jugar sin cuenta (anónimos)
- [ ] Usuarios pueden registrarse
- [ ] Usuarios pueden iniciar sesión
- [ ] Usuarios autenticados ven sus stats
- [ ] Las partidas se guardan en DB
- [ ] Las stats se actualizan correctamente
- [ ] El leaderboard funciona
- [ ] Socket.io funciona con y sin auth

---

## Fase 9: Deployment

### 9.1 Preparar para producción

**Variables de entorno de producción:**

1. Configurar en Supabase:
   - Auth providers
   - Email templates
   - RLS policies

2. Configurar en Railway/Render:
   ```env
   DATABASE_URL=<supabase-postgres-url>
   SUPABASE_URL=<supabase-url>
   SUPABASE_SERVICE_KEY=<service-key>
   NODE_ENV=production
   PORT=3001
   ```

3. Configurar en Vercel (frontend):
   ```env
   VITE_SUPABASE_URL=<supabase-url>
   VITE_SUPABASE_ANON_KEY=<anon-key>
   VITE_SOCKET_URL=<backend-url>
   ```

### 9.2 Scripts de deployment

**`package.json` (root):**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "server": "cd server && npm run dev",
    "server:build": "cd server && npm run build",
    "dev:all": "concurrently \"npm run dev\" \"npm run server\"",
    "deploy:server": "cd server && npm run deploy",
    "db:migrate": "cd server && npx prisma migrate deploy",
    "db:seed": "cd server && npx prisma db seed"
  }
}
```

---

## Resumen de Archivos Creados/Modificados

### Nuevos archivos:
1. `server/prisma/schema.prisma`
2. `server/src/config/database.js`
3. `server/src/config/supabase.js`
4. `server/src/repositories/UserRepository.js`
5. `server/src/repositories/GameRepository.js`
6. `server/src/repositories/StatsRepository.js`
7. `server/src/repositories/index.js`
8. `server/src/services/AuthService.js`
9. `server/src/middleware/auth.js`
10. `server/src/middleware/socketAuth.js`
11. `server/src/routes/stats.js`
12. `server/src/routes/index.js`
13. `server/src/words.js`
14. `server/prisma/seed.js`
15. `src/config/supabase.js`
16. `src/contexts/AuthContext.jsx`
17. `src/screens/Auth/Login.jsx`
18. `src/screens/Auth/Register.jsx`
19. `src/components/user/UserProfile.jsx`

### Archivos modificados:
1. `server/index.js` → `server/src/index.js` (refactorizado)
2. `src/hooks/useSocket.js` (agregar autenticación)
3. `src/App.jsx` (agregar AuthProvider y rutas)
4. `server/package.json` (agregar dependencias)
5. `package.json` (agregar dependencias de Supabase)
6. `.env` (agregar variables)
7. `server/.env` (agregar variables)

---

## Timeline Estimado

- **Fase 1-2 (Setup + Schema):** 2-3 horas
- **Fase 3 (Repositories):** 3-4 horas
- **Fase 4 (Auth Services):** 2-3 horas
- **Fase 5 (Integración Server):** 4-5 horas
- **Fase 6 (Integración Client):** 4-5 horas
- **Fase 7 (APIs REST):** 2-3 horas
- **Fase 8 (Testing):** 2-3 horas
- **Fase 9 (Deployment):** 2-3 horas

**Total:** ~25-35 horas de desarrollo

---

## Próximos Pasos Después de Implementación

1. Agregar OAuth providers (Google, Discord, GitHub)
2. Implementar sistema de amigos
3. Crear rankings por temporada
4. Agregar logros/achievements
5. Implementar sistema de reportes
6. Agregar chat en el juego
7. Crear replays de partidas
8. Implementar matchmaking basado en rating

---

## Notas Importantes

- ✅ Los usuarios anónimos pueden jugar sin restricciones
- ✅ Las stats solo se guardan para usuarios autenticados
- ✅ El juego sigue siendo rápido (todo en memoria)
- ✅ La DB solo se actualiza al inicio y final de partida
- ✅ Arquitectura escalable con patrón repository
- ✅ Fácil agregar features futuras
- ✅ Supabase Auth maneja la seguridad
- ✅ Prisma facilita las queries y migraciones
