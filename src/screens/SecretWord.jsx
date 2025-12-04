import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, UserCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useGame } from '@/hooks/useGame'
import { useState } from 'react'

const SecretWord = () => {
  const navigate = useNavigate()
  const { roomId } = useParams()
  const { secretWord, isImpostor, moveToClues, players, isOnline } = useGame()
  const [revealed, setRevealed] = useState(false)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [playersViewed, setPlayersViewed] = useState(new Set())

  const isLocalMode = roomId === 'OFFLINE'
  const currentPlayer = isLocalMode ? players[currentPlayerIndex] : null

  const getCurrentPlayerRole = () => {
    if (!isLocalMode) return isImpostor()
    return currentPlayer?.isImpostor || false
  }

  const handleNextPlayer = () => {
    // Marcar que el jugador actual vio su rol
    if (revealed && currentPlayer) {
      setPlayersViewed(prev => new Set([...prev, currentPlayer.id]))
    }

    // Si hay más jugadores, pasar al siguiente
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1)
      setRevealed(false) // Ocultar la tarjeta para el siguiente jugador
    }
  }

  const handleContinue = () => {
    moveToClues()
    navigate(`/game/${roomId}`)
  }

  return (
    <Container>
      <div className="space-y-8 text-center">
        {/* Título y nombre del jugador actual */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            {isLocalMode ? 'Tu Rol' : 'Tu Rol'}
          </h1>
          {isLocalMode && currentPlayer && (
            <div className="mt-4 mb-2">
              <p className="text-white/40 text-sm">Turno de:</p>
              <div className="flex items-center justify-center gap-3 mt-2">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: currentPlayer.avatar }}
                >
                  {currentPlayer.name[0].toUpperCase()}
                </div>
                <p className="text-3xl font-bold text-white">
                  {currentPlayer.name}
                </p>
              </div>
              <p className="text-white/40 text-sm mt-2">
                Jugador {currentPlayerIndex + 1} de {players.length}
              </p>
            </div>
          )}
          <p className="text-white/60 mt-4">
            Toca la tarjeta para revelar
          </p>
        </motion.div>

        {/* Tarjeta de palabra secreta */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            hover
            onClick={() => setRevealed(!revealed)}
            className={`relative overflow-hidden ${
              isLocalMode
                ? 'bg-gradient-to-br from-impostor-purple/20 to-impostor-blue/20'
                : isImpostor()
                  ? 'bg-gradient-to-br from-red-500/20 to-red-900/20'
                  : 'bg-gradient-to-br from-green-500/20 to-green-900/20'
            }`}
          >
            <div className="min-h-[300px] flex flex-col items-center justify-center space-y-6">
              {/* Icono */}
              <motion.div
                animate={{ scale: revealed ? 0 : 1, opacity: revealed ? 0 : 1 }}
                className="text-6xl"
              >
                {revealed ? '' : '🔒'}
              </motion.div>

              {/* Contenido revelado */}
              <motion.div
                animate={{ scale: revealed ? 1 : 0, opacity: revealed ? 1 : 0 }}
                className="space-y-4"
              >
                <div className="text-7xl">
                  {getCurrentPlayerRole() ? '👹' : '👨‍🦰'}
                </div>

                <h2 className={`text-3xl font-bold ${
                  isLocalMode
                    ? 'text-impostor-purple'
                    : getCurrentPlayerRole()
                      ? 'text-red-400'
                      : 'text-green-400'
                }`}>
                  {getCurrentPlayerRole() ? 'ERES EL IMPOSTOR' : 'ERES CIVIL'}
                </h2>

                {!getCurrentPlayerRole() && (
                  <div className="space-y-2">
                    <p className="text-white/60">Tu palabra secreta es:</p>
                    <p className="text-5xl font-bold text-white">
                      {secretWord}
                    </p>
                  </div>
                )}

                {getCurrentPlayerRole() && (
                  <p className="text-white/80 max-w-md">
                    No conoces la palabra secreta. Debes fingir que la conoces usando las pistas de los demás.
                  </p>
                )}
              </motion.div>

              {/* Instrucción */}
              {!revealed && (
                <p className="text-white/60">
                  Toca para revelar tu rol
                </p>
              )}
            </div>

            {/* Efecto de brillo */}
            {revealed && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />
            )}
          </Card>
        </motion.div>

        {/* Instrucciones */}
        <Card className="bg-impostor-blue/10">
          <div className="space-y-3 text-left">
            <h3 className="text-xl font-bold text-white">📋 Reglas:</h3>
            <ul className="space-y-2 text-white/80">
              <li>• Los civiles conocen la palabra secreta</li>
              <li>• El impostor debe fingir que la conoce</li>
              <li>• Da pistas sutiles sin revelar la palabra</li>
              <li>• Al final, votarán por quién es el impostor</li>
            </ul>
          </div>
        </Card>

        {/* Botones */}
        {isLocalMode ? (
          <>
            {/* Indicador de progreso */}
            <div className="flex justify-center gap-2 py-4">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className={`w-3 h-3 rounded-full transition-all ${
                    playersViewed.has(player.id)
                      ? 'bg-impostor-green scale-110'
                      : index === currentPlayerIndex
                        ? 'bg-impostor-purple animate-pulse'
                        : 'bg-white/20'
                  }`}
                  title={player.name}
                />
              ))}
            </div>

            {/* Botón siguiente jugador o iniciar */}
            {currentPlayerIndex < players.length - 1 ? (
              <Button
                size="lg"
                onClick={handleNextPlayer}
                className="w-full"
                disabled={!revealed}
              >
                <UserCheck size={24} className="mr-2" />
                Siguiente Jugador
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleContinue}
                className="w-full"
                disabled={!revealed || playersViewed.size !== players.length - 1}
              >
                Iniciar Juego
                <ArrowRight size={24} className="ml-2" />
              </Button>
            )}

            {/* Mensaje de ayuda */}
            {!revealed && (
              <p className="text-white/40 text-sm">
                👆 Toca la tarjeta para revelar tu rol
              </p>
            )}
            {revealed && currentPlayerIndex < players.length - 1 && (
              <p className="text-white/40 text-sm">
                ✅ Pasa el dispositivo al siguiente jugador
              </p>
            )}
          </>
        ) : (
          <Button
            size="lg"
            onClick={handleContinue}
            className="w-full"
            disabled={!revealed}
          >
            Continuar al Juego
            <ArrowRight size={24} className="ml-2" />
          </Button>
        )}
      </div>
    </Container>
  )
}

export default SecretWord
