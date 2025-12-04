import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

export const ClueCard = ({ clue, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass rounded-xl p-4 flex items-start space-x-3"
    >
      <div className="bg-impostor-purple/30 rounded-full p-2 flex-shrink-0">
        <MessageCircle size={20} className="text-impostor-purple" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-impostor-purple font-semibold text-sm">
          {clue.playerName} - Ronda {clue.round}
        </p>
        <p className="text-white mt-1 text-base break-words">
          {clue.text}
        </p>
      </div>
    </motion.div>
  )
}
