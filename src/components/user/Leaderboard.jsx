import { useState, useEffect } from 'react'
import { Trophy, Medal, Award } from 'lucide-react'
import { statsApi } from '@/services/api'

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderBy, setOrderBy] = useState('gamesWon')

  useEffect(() => {
    fetchLeaderboard()
  }, [orderBy])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await statsApi.getLeaderboard(10, orderBy)
      setLeaderboard(data)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getMedalIcon = (position) => {
    switch (position) {
      case 0:
        return <Trophy className="text-yellow-400" size={24} />
      case 1:
        return <Medal className="text-gray-300" size={24} />
      case 2:
        return <Award className="text-orange-400" size={24} />
      default:
        return <span className="text-white/40 font-bold">{position + 1}</span>
    }
  }

  const getWinRate = (stats) => {
    if (!stats.gamesPlayed) return '0.0'
    return ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">Leaderboard</h2>
        <p className="text-white/70 text-center">Cargando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">Leaderboard</h2>
        <p className="text-red-400 text-center">{error}</p>
        <button
          onClick={fetchLeaderboard}
          className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg mx-auto block"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="text-yellow-400" />
          Leaderboard
        </h2>
        <select
          value={orderBy}
          onChange={(e) => setOrderBy(e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="gamesWon">Victorias</option>
          <option value="gamesPlayed">Partidas</option>
          <option value="bestStreak">Mejor Racha</option>
          <option value="winsAsImpostor">Victorias como Impostor</option>
        </select>
      </div>

      {leaderboard.length === 0 ? (
        <p className="text-white/60 text-center py-8">
          No hay jugadores en el leaderboard aún
        </p>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                index < 3
                  ? 'bg-gradient-to-r from-white/20 to-white/10 border-white/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="w-10 flex items-center justify-center">
                {getMedalIcon(index)}
              </div>

              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xl"
                style={{ backgroundColor: entry.user.avatarColor }}
              >
                {entry.user.username[0].toUpperCase()}
              </div>

              <div className="flex-1">
                <p className="text-white font-semibold">{entry.user.username}</p>
                <p className="text-white/60 text-sm">
                  {entry.gamesPlayed} partidas • {getWinRate(entry)}% victorias
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {entry[orderBy]}
                </p>
                <p className="text-white/60 text-sm capitalize">
                  {orderBy === 'gamesWon' && 'victorias'}
                  {orderBy === 'gamesPlayed' && 'partidas'}
                  {orderBy === 'bestStreak' && 'racha'}
                  {orderBy === 'winsAsImpostor' && 'victorias'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
