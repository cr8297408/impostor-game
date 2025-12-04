import AuthService from '../services/AuthService.js'

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
