import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Clock, AlertCircle } from 'lucide-react'

export const GameTimer = ({ totalSeconds, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(totalSeconds || 0)
  const hasCompleted = useRef(false)

  useEffect(() => {
    // Reiniciar si cambia totalSeconds
    setTimeLeft(totalSeconds || 0)
    hasCompleted.current = false
  }, [totalSeconds])

  useEffect(() => {
    if (timeLeft <= 0 && !hasCompleted.current) {
      hasCompleted.current = true
      onComplete?.()
      return
    }

    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onComplete])

  // Asegurar que los valores sean válidos para evitar NaN/Infinity
  const safeTimeLeft = Math.max(0, timeLeft || 0)
  const safeTotalSeconds = Math.max(1, totalSeconds || 1)
  
  const minutes = Math.floor(safeTimeLeft / 60)
  const seconds = safeTimeLeft % 60
  const percentage = Math.max(0, Math.min(100, (safeTimeLeft / safeTotalSeconds) * 100))
  const isLow = safeTimeLeft <= 60 && safeTimeLeft > 0 // Último minuto
  const isCritical = safeTimeLeft <= 30 && safeTimeLeft > 0 // Últimos 30 segundos

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl p-6 ${
        isCritical ? 'ring-4 ring-red-500 animate-pulse' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${
            isCritical ? 'bg-red-500/20' : isLow ? 'bg-yellow-500/20' : 'bg-impostor-blue/20'
          }`}>
            {isCritical ? (
              <AlertCircle
                size={28}
                className="text-red-400 animate-pulse"
              />
            ) : (
              <Clock
                size={28}
                className={isLow ? 'text-yellow-400' : 'text-impostor-blue'}
              />
            )}
          </div>

          <div>
            <p className="text-sm text-white/60">Tiempo total restante</p>
            <p className={`text-4xl font-bold tabular-nums ${
              isCritical ? 'text-red-400' :
              isLow ? 'text-yellow-400' : 'text-white'
            }`}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>
        </div>

        {isCritical && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-red-400 text-sm font-bold"
          >
            ¡APÚRATE!
          </motion.div>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="mt-4 h-3 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'linear' }}
          className={`h-full ${
            isCritical ? 'bg-red-500' :
            isLow ? 'bg-yellow-500' : 'gradient-blue-purple'
          }`}
        />
      </div>
    </motion.div>
  )
}
