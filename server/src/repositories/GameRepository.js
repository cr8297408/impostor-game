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
