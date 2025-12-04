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
