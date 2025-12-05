import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Vote, AlertCircle, UserCircle } from 'lucide-react'
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
  const safeVotes = votes || {}
  const myVote = safeVotes[currentPlayerId]
  const isLocalMode = roomId?.startsWith('OFFLINE') || false

  // Estado para modo local: quién está votando actualmente
  const [currentVoterId, setCurrentVoterId] = useState(null)
  const [showVoterSelection, setShowVoterSelection] = useState(isLocalMode)

  // Seleccionar quién está votando (solo modo local)
  const handleSelectVoter = (voterId) => {
    setCurrentVoterId(voterId)
    setShowVoterSelection(false)
  }

  // Votar por un jugador
  const handleVote = (playerId) => {
    if (isLocalMode) {
      // Modo local: usar el voterId seleccionado
      if (!currentVoterId) {
        alert('Primero selecciona quién eres')
        return
      }

      if (playerId === currentVoterId) {
        alert('No puedes votarte a ti mismo')
        return
      }

      if (safeVotes[currentVoterId]) {
        alert('Este jugador ya votó')
        return
      }

      // Registrar voto con el ID del votante seleccionado
      submitVote(playerId, currentVoterId)

      // Resetear para el siguiente votante
      setCurrentVoterId(null)
      setShowVoterSelection(true)
    } else {
      // Modo online: usar currentPlayerId
      if (hasVoted()) {
        return
      }

      if (playerId === currentPlayerId) {
        alert('No puedes votarte a ti mismo')
        return
      }

      submitVote(playerId)
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
                Votos: {Object.keys(safeVotes).length} / {activePlayers.length}
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
                  width: `${(Object.keys(safeVotes).length / activePlayers.length) * 100}%`
                }}
                className="h-full gradient-purple-pink"
              />
            </div>
          </div>
        </Card>

        {/* Selección de votante (solo modo local) */}
        {isLocalMode && showVoterSelection && (
          <Card className="bg-impostor-purple/10">
            <div className="text-center space-y-4">
              <UserCircle size={48} className="mx-auto text-impostor-purple" />
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  ¿Quién eres tú?
                </h2>
                <p className="text-white/60">
                  Selecciona tu jugador para votar
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {activePlayers.map((player) => {
                  const hasVotedAlready = safeVotes[player.id]
                  return (
                    <div key={player.id} className="relative">
                      <PlayerCard
                        player={player}
                        onClick={!hasVotedAlready ? () => handleSelectVoter(player.id) : undefined}
                      />
                      {hasVotedAlready && (
                        <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center pointer-events-none">
                          <div className="bg-impostor-green rounded-full p-3">
                            <Vote size={32} className="text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Advertencia */}
        {!isLocalMode && !hasVoted() && (
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

        {/* Jugador actual votando (modo local) */}
        {isLocalMode && currentVoterId && (
          <Card className="bg-impostor-purple/20">
            <div className="text-center">
              <p className="text-white/60 text-sm">Votando como:</p>
              <p className="text-2xl font-bold text-white mt-1">
                {activePlayers.find(p => p.id === currentVoterId)?.name}
              </p>
              <p className="text-white/60 text-sm mt-2">
                Vota por quién crees que es el impostor
              </p>
            </div>
          </Card>
        )}

        {/* Lista de jugadores para votar */}
        {(!isLocalMode || (isLocalMode && !showVoterSelection)) && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {activePlayers.map((player) => {
              const playerVotes = Object.values(safeVotes).filter(v => v === player.id).length

              // En modo local, usar currentVoterId; en online, usar currentPlayerId
              const activeVoterId = isLocalMode ? currentVoterId : currentPlayerId
              const isMyVote = isLocalMode ? false : (myVote === player.id)
              const isMe = player.id === activeVoterId
              const canVote = isLocalMode ? !isMe : (!isMe && !hasVoted())

              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onClick={canVote ? () => handleVote(player.id) : undefined}
                  votes={playerVotes}
                  selected={isMyVote}
                />
              )
            })}
          </div>
        )}

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
          <Card className="bg-impostor-blue/10">
            <p className="text-center text-white/80">
              {roomId.startsWith('OFFLINE')
                ? '🗳️ Cada jugador debe votar por turno'
                : '⏳ Esperando votación de todos los jugadores...'}
            </p>
            {roomId.startsWith('OFFLINE') && (
              <p className="text-center text-white/60 text-sm mt-2">
                Pasen el dispositivo entre ustedes para votar
              </p>
            )}
          </Card>
        )}
      </div>
    </Container>
  )
}

export default Voting
