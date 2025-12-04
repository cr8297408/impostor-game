import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Eye, Users } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ClueCard } from '@/components/game/ClueCard'
import { Timer } from '@/components/game/Timer'
import { useGame } from '@/hooks/useGame'
import { useSocket } from '@/hooks/useSocket'

const Game = () => {
  const navigate = useNavigate()
  const { roomId } = useParams()
  const {
    currentRound,
    maxRounds,
    clues,
    secretWord,
    isImpostor,
    getCurrentTurnPlayer,
    isMyTurn,
    addClue,
    phase,
    config,
    getActivePlayers,
  } = useGame()

  const { emitClue } = useSocket(roomId)
  const [clueText, setClueText] = useState('')
  const [showWord, setShowWord] = useState(false)

  const currentPlayer = getCurrentTurnPlayer()
  const activePlayers = getActivePlayers()

  const handleSubmitClue = () => {
    if (!clueText.trim()) return

    addClue(clueText.trim())
    setClueText('')

    // Si es online, emitir al servidor
    if (roomId !== 'OFFLINE') {
      emitClue(clueText.trim())
    }
  }

  // Navegar a votación cuando cambia la fase
  useEffect(() => {
    if (phase === 'voting') {
      navigate(`/voting/${roomId}`)
    }
  }, [phase, roomId, navigate])

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Ronda {currentRound} de {maxRounds}
              </h1>
              <p className="text-white/60 flex items-center gap-2 mt-1">
                <Users size={16} />
                {activePlayers.length} jugadores activos
              </p>
            </div>

            {/* Botón ver palabra */}
            {!isImpostor() && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowWord(!showWord)}
              >
                <Eye size={16} className="mr-2" />
                {showWord ? 'Ocultar' : 'Ver'} palabra
              </Button>
            )}
          </div>

          {/* Palabra secreta (solo civiles) */}
          <AnimatePresence>
            {showWord && !isImpostor() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-white/10 text-center"
              >
                <p className="text-white/60 text-sm">Tu palabra:</p>
                <p className="text-3xl font-bold text-impostor-green">
                  {secretWord}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Turno actual */}
        <Card className={`${
          isMyTurn() ? 'ring-4 ring-impostor-purple' : ''
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Turno de:</p>
              <p className="text-2xl font-bold text-white">
                {currentPlayer?.name || 'Cargando...'}
              </p>
            </div>

            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4"
              style={{
                backgroundColor: currentPlayer?.avatar,
                borderColor: currentPlayer?.avatar,
              }}
            >
              {currentPlayer?.name?.[0]?.toUpperCase()}
            </div>
          </div>

          {isMyTurn() && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-impostor-purple font-semibold"
            >
              ¡Es tu turno! Da una pista sutil.
            </motion.p>
          )}
        </Card>

        {/* Timer (opcional) */}
        {config.timePerClue > 0 && isMyTurn() && (
          <Timer
            seconds={config.timePerClue}
            onComplete={handleSubmitClue}
          />
        )}

        {/* Formulario de pista */}
        {isMyTurn() && (
          <Card>
            <div className="space-y-3">
              <label className="text-white font-semibold">
                Da tu pista:
              </label>
              <div className="flex gap-3">
                <Input
                  value={clueText}
                  onChange={(e) => setClueText(e.target.value)}
                  placeholder={isImpostor() ? "Finge que conoces la palabra..." : "Da una pista sutil..."}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSubmitClue()
                  }}
                  maxLength={100}
                />
                <Button onClick={handleSubmitClue} disabled={!clueText.trim()}>
                  <Send size={20} />
                </Button>
              </div>
              <p className="text-white/40 text-xs">
                {isImpostor()
                  ? '⚠️ No conoces la palabra. Usa las pistas de otros para fingir.'
                  : '💡 Sé sutil. No reveles la palabra directamente.'
                }
              </p>
            </div>
          </Card>
        )}

        {/* Lista de pistas */}
        <Card>
          <h3 className="text-xl font-bold text-white mb-4">
            Pistas dadas ({clues.length})
          </h3>

          {clues.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              Aún no hay pistas. ¡Empieza a jugar!
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {clues.map((clue, index) => (
                <ClueCard key={index} clue={clue} index={index} />
              ))}
            </div>
          )}
        </Card>

        {/* Botón ir a votación (solo para testing en modo offline) */}
        {roomId === 'OFFLINE' && currentRound === maxRounds && (
          <Button
            size="lg"
            variant="danger"
            onClick={() => navigate(`/voting/${roomId}`)}
            className="w-full"
          >
            Ir a Votación
          </Button>
        )}
      </div>
    </Container>
  )
}

export default Game
