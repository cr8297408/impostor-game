import express from 'express'
import statsRoutes from './stats.js'

const router = express.Router()

router.use('/stats', statsRoutes)

export default router
