import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Vote, AlertCircle } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PlayerCard } from '@/components/game/PlayerCard'
import { useGame } from '@/hooks/useGame'
import { useSocket } from '@/hooks/useSocket'

const Voting = () => {
  const navigate = useNavigate()
  const { roomId } = useParams()
  const {
    getActivePlayers,
    submitVote,
    hasVoted,
    allPlayersVoted,
    finishVoting,
    votes,
    currentPlayerId,
    phase,
  } = useGame()

  const { emitVote } = useSocket(roomId)
  const activePlayers = getActivePlayers()
  const myVote = votes[currentPlayerId]

  const handleVote = (playerId) => {
    if (hasVoted()) return
    if (playerId === currentPlayerId) {
      alert('No puedes votarte a ti mismo')
      return
    }

    submitVote(playerId)

    // Si es online, emitir al servidor
    if (roomId !== 'OFFLINE') {
      emitVote(playerId)
    }
  }

  const handleFinishVoting = () => {
    if (!allPlayersVoted()) {
      alert('Todos los jugadores deben votar antes de continuar')
      return
    }

    finishVoting()
  }

  // Navegar a resultados cuando cambia la fase
  useEffect(() => {
    if (phase === 'results') {
      navigate(`/results/${roomId}`)
    }
  }, [phase, roomId, navigate])

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <div className="text-center space-y-2">
            <div className="text-5xl">🗳️</div>
            <h1 className="text-3xl font-bold text-white">
              Votación
            </h1>
            <p className="text-white/60">
              Vota por quién crees que es el impostor
            </p>
          </div>

          {/* Estado de votación */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <p className="text-white/80">
                Votos: {Object.keys(votes).length} / {activePlayers.length}
              </p>
              {hasVoted() && (
                <div className="flex items-center gap-2 text-impostor-green">
                  <Vote size={20} />
                  <span className="font-semibold">Has votado</span>
                </div>
              )}
            </div>

            {/* Barra de progreso */}
            <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(Object.keys(votes).length / activePlayers.length) * 100}%`
                }}
                className="h-full gradient-purple-pink"
              />
            </div>
          </div>
        </Card>

        {/* Advertencia */}
        {!hasVoted() && (
          <Card className="bg-yellow-500/10 border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-500 flex-shrink-0" size={24} />
              <div className="space-y-1">
                <p className="text-yellow-500 font-semibold">
                  Piensa bien tu voto
                </p>
                <p className="text-white/80 text-sm">
                  No puedes votarte a ti mismo. El jugador con más votos será eliminado.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Lista de jugadores */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {activePlayers.map((player) => {
            const playerVotes = Object.values(votes).filter(v => v === player.id).length
            const isMyVote = myVote === player.id
            const isMe = player.id === currentPlayerId

            return (
              <PlayerCard
                key={player.id}
                player={player}
                onClick={() => !isMe && !hasVoted() && handleVote(player.id)}
                votes={playerVotes}
                selected={isMyVote}
              />
            )
          })}
        </div>

        {/* Botón finalizar votación */}
        {allPlayersVoted() && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              size="lg"
              onClick={handleFinishVoting}
              className="w-full"
            >
              Ver Resultados
            </Button>
          </motion.div>
        )}

        {!allPlayersVoted() && (
          <p className="text-center text-white/60">
            Esperando a que todos voten...
          </p>
        )}
      </div>
    </Container>
  )
}

export default Voting
