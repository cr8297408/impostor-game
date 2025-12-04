import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

export const Timer = ({ seconds, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(seconds)

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onComplete])

  const percentage = (timeLeft / seconds) * 100
  const isLow = timeLeft <= 10

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="glass rounded-2xl p-4"
    >
      <div className="flex items-center justify-center space-x-3">
        <Clock
          size={24}
          className={`${isLow ? 'text-red-400 animate-pulse' : 'text-impostor-blue'}`}
        />
        <div className="text-center">
          <p className="text-sm text-white/60">Tiempo restante</p>
          <p className={`text-3xl font-bold ${isLow ? 'text-red-400' : 'text-white'}`}>
            {timeLeft}s
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'linear' }}
          className={`h-full ${
            isLow ? 'bg-red-500' : 'gradient-blue-purple'
          }`}
        />
      </div>
    </motion.div>
  )
}
