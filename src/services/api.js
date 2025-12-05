const API_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

// Helper para hacer peticiones autenticadas
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('supabase.auth.token')

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

// API de Estadísticas
export const statsApi = {
  // Obtener estadísticas del usuario actual
  getMyStats: async (accessToken) => {
    return fetch(`${API_URL}/api/stats/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (!res.ok) throw new Error('Error al obtener estadísticas')
      return res.json()
    })
  },

  // Obtener historial de juegos del usuario
  getMyGames: async (accessToken, limit = 10) => {
    return fetch(`${API_URL}/api/stats/me/games?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (!res.ok) throw new Error('Error al obtener historial')
      return res.json()
    })
  },

  // Obtener leaderboard
  getLeaderboard: async (limit = 10, orderBy = 'gamesWon') => {
    return fetch(`${API_URL}/api/stats/leaderboard?limit=${limit}&orderBy=${orderBy}`)
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener leaderboard')
        return res.json()
      })
  },
}

// Health check
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_URL}/health`)
    return response.json()
  } catch (error) {
    console.error('Health check failed:', error)
    return { status: 'error' }
  }
}

export default {
  stats: statsApi,
  healthCheck,
}
