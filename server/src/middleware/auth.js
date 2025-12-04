import AuthService from '../services/AuthService.js'

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
