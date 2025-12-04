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
