import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

export default function UserProfile() {
  const { user, session, signOut, isAuthenticated } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated || !session) {
      setLoading(false)
      return
    }

    fetchStats()
  }, [isAuthenticated, session])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${SOCKET_URL}/api/stats/me`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
        <p className="text-white/70 text-center">
          Inicia sesión para ver tus estadísticas
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
        <p className="text-white/70 text-center">Cargando...</p>
      </div>
    )
  }

  const winRate = stats?.gamesPlayed > 0
    ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)
    : 0

  const impostorWinRate = stats?.gamesAsImpostor > 0
    ? ((stats.winsAsImpostor / stats.gamesAsImpostor) * 100).toFixed(1)
    : 0

  const civilianWinRate = stats?.gamesAsCivilian > 0
    ? ((stats.winsAsCivilian / stats.gamesAsCivilian) * 100).toFixed(1)
    : 0

  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {user?.user_metadata?.username || user?.email?.split('@')[0]}
          </h2>
          <p className="text-white/60 text-sm">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors border border-red-500/50"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Partidas Jugadas" value={stats?.gamesPlayed || 0} />
        <StatCard label="Victorias" value={stats?.gamesWon || 0} />
        <StatCard label="% Victorias" value={`${winRate}%`} />
        <StatCard label="Racha Actual" value={stats?.currentStreak || 0} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
          <h3 className="text-red-300 font-semibold mb-3">Como Impostor</h3>
          <div className="space-y-2 text-white/80 text-sm">
            <div className="flex justify-between">
              <span>Partidas:</span>
              <span>{stats?.gamesAsImpostor || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Victorias:</span>
              <span>{stats?.winsAsImpostor || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>% Victorias:</span>
              <span>{impostorWinRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
          <h3 className="text-blue-300 font-semibold mb-3">Como Civil</h3>
          <div className="space-y-2 text-white/80 text-sm">
            <div className="flex justify-between">
              <span>Partidas:</span>
              <span>{stats?.gamesAsCivilian || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Victorias:</span>
              <span>{stats?.winsAsCivilian || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>% Victorias:</span>
              <span>{civilianWinRate}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Mejor Racha" value={stats?.bestStreak || 0} />
        <StatCard label="Pistas Dadas" value={stats?.totalCluesGiven || 0} />
        <StatCard label="Veces Eliminado" value={stats?.timesEliminated || 0} />
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
      <p className="text-white/60 text-sm mb-1">{label}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  )
}
