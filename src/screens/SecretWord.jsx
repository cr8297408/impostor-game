import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useGame } from '@/hooks/useGame'
import { useState } from 'react'

const SecretWord = () => {
  const navigate = useNavigate()
  const { roomId } = useParams()
  const { secretWord, isImpostor, moveToClues } = useGame()
  const [revealed, setRevealed] = useState(false)

  const handleContinue = () => {
    moveToClues()
    navigate(`/game/${roomId}`)
  }

  return (
    <Container>
      <div className="space-y-8 text-center">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Tu Rol
          </h1>
          <p className="text-white/60">
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
              isImpostor() ? 'bg-gradient-to-br from-red-500/20 to-red-900/20' : 'bg-gradient-to-br from-green-500/20 to-green-900/20'
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
                  {isImpostor() ? '👹' : '👨‍🦰'}
                </div>

                <h2 className={`text-3xl font-bold ${
                  isImpostor() ? 'text-red-400' : 'text-green-400'
                }`}>
                  {isImpostor() ? 'ERES EL IMPOSTOR' : 'ERES CIVIL'}
                </h2>

                {!isImpostor() && (
                  <div className="space-y-2">
                    <p className="text-white/60">Tu palabra secreta es:</p>
                    <p className="text-5xl font-bold text-white">
                      {secretWord}
                    </p>
                  </div>
                )}

                {isImpostor() && (
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

        {/* Botón continuar */}
        <Button
          size="lg"
          onClick={handleContinue}
          className="w-full"
          disabled={!revealed}
        >
          Continuar al Juego
          <ArrowRight size={24} className="ml-2" />
        </Button>
      </div>
    </Container>
  )
}

export default SecretWord
