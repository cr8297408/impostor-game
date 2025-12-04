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
