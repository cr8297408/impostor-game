import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Home, RotateCcw, Users } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PlayerCard } from '@/components/game/PlayerCard'
import { useGame } from '@/hooks/useGame'
import { usePlayers } from '@/hooks/usePlayers'

const Results = () => {
  const navigate = useNavigate()
  const { roomId } = useParams()
  const { winner, eliminatedPlayer, resetGame, secretWord } = useGame()
  const { getImpostor, getCivilians } = usePlayers()

  const impostor = getImpostor()
  const civilians = getCivilians()
  const impostorWon = winner === 'impostor'

  const handleNewGame = () => {
    resetGame()
    navigate('/')
  }

  const handleRematch = () => {
    resetGame()
    navigate(`/lobby/${roomId}`)
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Resultado principal */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Card className={`text-center ${
            impostorWon
              ? 'bg-gradient-to-br from-red-500/20 to-red-900/20'
              : 'bg-gradient-to-br from-green-500/20 to-green-900/20'
          }`}>
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="text-8xl mb-4"
            >
              {impostorWon ? '👹' : '🎉'}
            </motion.div>

            <h1 className={`text-5xl font-bold mb-4 ${
              impostorWon ? 'text-red-400' : 'text-green-400'
            }`}>
              {impostorWon ? '¡El Impostor Ganó!' : '¡Los Civiles Ganaron!'}
            </h1>

            <p className="text-white/80 text-xl">
              {impostorWon
                ? 'El impostor logró engañarlos a todos'
                : 'Los civiles descubrieron al impostor'
              }
            </p>
          </Card>
        </motion.div>

        {/* Jugador eliminado */}
        {eliminatedPlayer && (
          <Card>
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-white">
                Jugador Eliminado
              </h2>

              <div className="max-w-xs mx-auto">
                <PlayerCard
                  player={eliminatedPlayer}
                  showRole={true}
                />
              </div>

              <p className="text-white/60">
                {eliminatedPlayer.isImpostor
                  ? '¡Era el impostor! Los civiles adivinaron correctamente.'
                  : 'Era un civil inocente. El impostor ganó.'
                }
              </p>
            </div>
          </Card>
        )}

        {/* Revelación de roles */}
        <Card>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Users size={24} />
            Roles Revelados
          </h2>

          <div className="space-y-4">
            {/* Impostor */}
            <div>
              <h3 className="text-red-400 font-semibold mb-2 text-lg">
                👹 El Impostor
              </h3>
              {impostor && (
                <div className="max-w-xs">
                  <PlayerCard player={impostor} showRole={true} />
                </div>
              )}
            </div>

            {/* Civiles */}
            <div>
              <h3 className="text-green-400 font-semibold mb-2 text-lg">
                👨‍🦰 Los Civiles
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {civilians.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    showRole={true}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Palabra secreta */}
        <Card className="bg-impostor-blue/10">
          <div className="text-center space-y-2">
            <p className="text-white/60">La palabra secreta era:</p>
            <p className="text-4xl font-bold text-impostor-blue">
              {secretWord}
            </p>
          </div>
        </Card>

        {/* Estadísticas */}
        <Card>
          <h3 className="text-xl font-bold text-white mb-4">
            📊 Estadísticas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-dark rounded-xl p-4 text-center">
              <p className="text-white/60 text-sm">Total Jugadores</p>
              <p className="text-3xl font-bold text-white">
                {civilians.length + 1}
              </p>
            </div>
            <div className="glass-dark rounded-xl p-4 text-center">
              <p className="text-white/60 text-sm">Civiles</p>
              <p className="text-3xl font-bold text-green-400">
                {civilians.length}
              </p>
            </div>
            <div className="glass-dark rounded-xl p-4 text-center">
              <p className="text-white/60 text-sm">Impostores</p>
              <p className="text-3xl font-bold text-red-400">
                1
              </p>
            </div>
            <div className="glass-dark rounded-xl p-4 text-center">
              <p className="text-white/60 text-sm">Ganador</p>
              <p className="text-3xl font-bold text-impostor-purple">
                {impostorWon ? '👹' : '👨‍🦰'}
              </p>
            </div>
          </div>
        </Card>

        {/* Botones de acción */}
        <div className="flex gap-3">
          <Button
            size="lg"
            variant="secondary"
            onClick={handleNewGame}
            className="flex-1"
          >
            <Home size={20} className="mr-2" />
            Menú Principal
          </Button>
          <Button
            size="lg"
            onClick={handleRematch}
            className="flex-1"
          >
            <RotateCcw size={20} className="mr-2" />
            Revancha
          </Button>
        </div>
      </div>
    </Container>
  )
}

export default Results
