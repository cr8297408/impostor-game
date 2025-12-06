import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Copy, Check, Settings, Play, UserPlus } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PlayerCard } from '@/components/game/PlayerCard'
import { useGameStore } from '@/store/gameStore'
import { useSocket } from '@/hooks/useSocket'
import { useAuth } from '@/contexts/AuthContext'
import { CATEGORIES, WORDS } from '@/lib/words'

const Lobby = () => {
  const navigate = useNavigate()
  const { roomId } = useParams()
  const { players, addPlayer, config, setConfig, startGame, isOnline, currentPlayerId, getPlayerById } = useGameStore()
  const { user, isAuthenticated } = useAuth()
  const [newPlayerName, setNewPlayerName] = useState('')
  const [copied, setCopied] = useState(false)
  const [showConfig, setShowConfig] = useState(false)

  // Obtener username para Socket.io
  const currentPlayer = getPlayerById(currentPlayerId)
  const username = !isAuthenticated ? currentPlayer?.name : undefined

  const { emitStartGame, emitAddPlayer } = useSocket(roomId, username)

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return
    
    // Crear el jugador localmente primero para obtener el ID
    const playerId = addPlayer(newPlayerName.trim())
    
    // Siempre sincronizar con el servidor (tanto modo local como online)
    if (playerId) {
      const player = useGameStore.getState().getPlayerById(playerId)
      if (player) {
        emitAddPlayer(player)
      }
    }

    setNewPlayerName('')
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStartGame = () => {
    if (players.length < 3) {
      alert('Se necesitan al menos 3 jugadores para comenzar')
      return
    }

    // Siempre usar el servidor
    emitStartGame()
  }

  // Escuchar cuando el juego comienza en modo online
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe((state) => {
      if (state.phase === 'secret') {
        navigate(`/secret/${roomId}`)
      }
    })

    return unsubscribe
  }, [roomId, navigate])

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Sala de Espera</h1>
              <p className="text-white/60">
                {players.length} jugador{players.length !== 1 ? 'es' : ''}
              </p>
            </div>

            {isOnline && roomId !== 'OFFLINE' && (
              <div className="text-right">
                <p className="text-white/60 text-sm">Código de sala:</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-white tracking-wider">
                    {roomId}
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCopyCode}
                    className="!p-2"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Agregar jugadores */}
        {!isOnline && (
          <Card>
            <div className="flex gap-3">
              <Input
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Nombre del jugador..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddPlayer()
                }}
              />
              <Button onClick={handleAddPlayer}>
                <UserPlus size={20} />
              </Button>
            </div>
          </Card>
        )}

        {/* Lista de jugadores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {players.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              isHost={index === 0}
            />
          ))}

          {/* Slots vacíos */}
          {[...Array(Math.max(0, 4 - players.length))].map((_, i) => (
            <Card key={`empty-${i}`} className="opacity-30">
              <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-white/10 flex items-center justify-center">
                <UserPlus size={32} className="text-white/30" />
              </div>
              <p className="text-center text-white/30">Esperando...</p>
            </Card>
          ))}
        </div>

        {/* Configuración */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings size={24} />
                Configuración
              </h3>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowConfig(!showConfig)}
              >
                {showConfig ? 'Ocultar' : 'Mostrar'}
              </Button>
            </div>

            {showConfig && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4 border-t border-white/10"
              >
                {/* Categoría */}
                <div>
                  <label className="text-white/80 text-sm block mb-2">
                    Categoría de palabras
                  </label>
                  <select
                    value={config.category}
                    onChange={(e) => setConfig({ category: e.target.value })}
                    className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-impostor-purple"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rondas (solo modo online) */}
                {isOnline && (
                  <div>
                    <label className="text-white/80 text-sm block mb-2">
                      Número de rondas: {config.rounds}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={config.rounds}
                      onChange={(e) => setConfig({ rounds: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Configuración de tiempo */}
                {isOnline ? (
                  <>
                    {/* Tipo de temporizador (solo modo online) */}
                    <div>
                      <label className="text-white/80 text-sm block mb-2">
                        Modo de temporizador
                      </label>
                      <div className="flex gap-3">
                        <Button
                          size="sm"
                          variant={!config.useGameTimer ? "primary" : "secondary"}
                          onClick={() => setConfig({ useGameTimer: false })}
                          className="flex-1"
                        >
                          Por turno
                        </Button>
                        <Button
                          size="sm"
                          variant={config.useGameTimer ? "primary" : "secondary"}
                          onClick={() => setConfig({ useGameTimer: true })}
                          className="flex-1"
                        >
                          General
                        </Button>
                      </div>
                    </div>

                    {/* Tiempo por pista (solo si no usa timer general) */}
                    {!config.useGameTimer && (
                      <div>
                        <label className="text-white/80 text-sm block mb-2">
                          Tiempo por pista: {config.timePerClue}s
                        </label>
                        <input
                          type="range"
                          min="30"
                          max="120"
                          step="10"
                          value={config.timePerClue}
                          onChange={(e) => setConfig({ timePerClue: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* Temporizador general */}
                    {config.useGameTimer && (
                      <div>
                        <label className="text-white/80 text-sm block mb-2">
                          Tiempo total de juego: {Math.floor(config.gameTimer / 60)}m {config.gameTimer % 60}s
                        </label>
                        <input
                          type="range"
                          min="120"
                          max="900"
                          step="30"
                          value={config.gameTimer}
                          onChange={(e) => setConfig({ gameTimer: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  /* Temporizador para modo local */
                  <div>
                    <label className="text-white/80 text-sm block mb-2">
                      Tiempo total de juego: {Math.floor(config.gameTimer / 60)}m {config.gameTimer % 60}s
                    </label>
                    <input
                      type="range"
                      min="120"
                      max="900"
                      step="30"
                      value={config.gameTimer}
                      onChange={(e) => setConfig({ gameTimer: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </Card>

        {/* Botón iniciar */}
        <Button
          size="lg"
          onClick={handleStartGame}
          disabled={players.length < 3}
          className="w-full"
        >
          <Play size={24} className="mr-2" />
          Iniciar Juego
        </Button>

        {players.length < 3 && (
          <p className="text-center text-red-400 text-sm">
            Se necesitan al menos 3 jugadores para comenzar
          </p>
        )}
      </div>
    </Container>
  )
}

export default Lobby
