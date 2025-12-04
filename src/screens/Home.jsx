import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Wifi, WifiOff, Play, LogIn, UserPlus } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useGameStore } from '@/store/gameStore'
import { useAuth } from '@/contexts/AuthContext'
import UserProfile from '@/components/user/UserProfile'

const Home = () => {
  const navigate = useNavigate()
  const { createRoom, joinRoom, addPlayer } = useGameStore()
  const { user, isAuthenticated } = useAuth()
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [showJoin, setShowJoin] = useState(false)

  // Obtener el nombre del jugador (autenticado o manual)
  const getPlayerName = () => {
    if (isAuthenticated) {
      return user?.user_metadata?.username || user?.email?.split('@')[0] || 'Usuario'
    }
    return playerName.trim()
  }

  const handleCreateOffline = () => {
    const name = getPlayerName()
    if (!name) {
      alert('Por favor ingresa tu nombre')
      return
    }

    const roomId = createRoom(false)
    const playerId = addPlayer(name)
    navigate(`/lobby/${roomId}`)
  }

  const handleCreateOnline = () => {
    const name = getPlayerName()
    if (!name) {
      alert('Por favor ingresa tu nombre')
      return
    }

    const roomId = createRoom(true)
    const playerId = addPlayer(name)
    navigate(`/lobby/${roomId}`)
  }

  const handleJoinOnline = () => {
    const name = getPlayerName()
    if (!name || !roomCode.trim()) {
      alert('Por favor ingresa tu nombre y el código de sala')
      return
    }

    joinRoom(roomCode.toUpperCase().trim(), true)
    addPlayer(name)
    navigate(`/lobby/${roomCode.toUpperCase().trim()}`)
  }

  return (
    <Container>
      <div className="text-center space-y-8">
        {/* Logo y título */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="space-y-4"
        >
          <div className="text-8xl">🕵️</div>
          <h1 className="text-6xl font-bold text-gradient">
            El Impostor
          </h1>
          <p className="text-white/70 text-xl">
            Juego de deducción y mímica social
          </p>
        </motion.div>

        {/* Perfil o formulario de nombre */}
        {isAuthenticated ? (
          <UserProfile />
        ) : (
          <>
            <Card>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  ¿Cómo te llamas?
                </h2>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Tu nombre..."
                  className="text-center text-lg"
                  maxLength={20}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !showJoin) {
                      handleCreateOffline()
                    }
                  }}
                />
              </div>
            </Card>

            {/* Botones de autenticación */}
            <div className="flex gap-4 justify-center">
              <Button
                variant="secondary"
                onClick={() => navigate('/login')}
                className="flex items-center gap-2"
              >
                <LogIn size={20} />
                Iniciar Sesión
              </Button>
              <Button
                onClick={() => navigate('/register')}
                className="flex items-center gap-2"
              >
                <UserPlus size={20} />
                Registrarse
              </Button>
            </div>
          </>
        )}

        {/* Opciones de juego */}
        {!showJoin ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-4"
          >
            {/* Modo Offline */}
            <Card hover onClick={handleCreateOffline}>
              <div className="text-center space-y-3">
                <div className="bg-impostor-purple/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <WifiOff size={32} className="text-impostor-purple" />
                </div>
                <h3 className="text-xl font-bold text-white">Modo Local</h3>
                <p className="text-white/60 text-sm">
                  Juega con amigos en el mismo dispositivo
                </p>
              </div>
            </Card>

            {/* Crear sala online */}
            <Card hover onClick={handleCreateOnline}>
              <div className="text-center space-y-3">
                <div className="bg-impostor-blue/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Play size={32} className="text-impostor-blue" />
                </div>
                <h3 className="text-xl font-bold text-white">Crear Sala</h3>
                <p className="text-white/60 text-sm">
                  Crea una sala online y comparte el código
                </p>
              </div>
            </Card>

            {/* Unirse a sala */}
            <Card hover onClick={() => setShowJoin(true)}>
              <div className="text-center space-y-3">
                <div className="bg-impostor-green/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Users size={32} className="text-impostor-green" />
                </div>
                <h3 className="text-xl font-bold text-white">Unirse</h3>
                <p className="text-white/60 text-sm">
                  Únete a una sala existente con código
                </p>
              </div>
            </Card>
          </motion.div>
        ) : (
          /* Formulario de unirse */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  Código de Sala
                </h2>
                <Input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Ej: ABC123"
                  className="text-center text-2xl tracking-wider"
                  maxLength={6}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleJoinOnline()
                    }
                  }}
                />
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowJoin(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleJoinOnline}
                    className="flex-1"
                  >
                    Unirse
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Footer */}
        <p className="text-white/40 text-sm">
          Hecho con ❤️ para jugar con amigos
        </p>
      </div>
    </Container>
  )
}

export default Home
