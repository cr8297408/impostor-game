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
