import { motion } from 'framer-motion'
import { User, Crown, X } from 'lucide-react'

export const PlayerCard = ({
  player,
  onClick,
  showRole = false,
  isHost = false,
  votes = 0,
  selected = false,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`glass rounded-2xl p-4 relative transition-all ${
        onClick ? 'cursor-pointer' : ''
      } ${
        selected ? 'ring-4 ring-impostor-purple' : ''
      } ${
        player.isEliminated ? 'opacity-50 grayscale' : ''
      }`}
    >
      {/* Badge de host */}
      {isHost && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1.5">
          <Crown size={16} />
        </div>
      )}

      {/* Badge de eliminado */}
      {player.isEliminated && (
        <div className="absolute -top-2 -left-2 bg-red-500 rounded-full p-1.5">
          <X size={16} />
        </div>
      )}

      {/* Avatar */}
      <div
        className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold border-4"
        style={{
          backgroundColor: player.avatar,
          borderColor: player.avatar,
          filter: 'brightness(1.2)',
        }}
      >
        <User size={32} className="text-white" />
      </div>

      {/* Nombre */}
      <div className="text-center">
        <p className="font-bold text-white text-lg truncate">
          {player.name}
        </p>

        {/* Rol (solo si se muestra) */}
        {showRole && (
          <p className={`text-sm mt-1 font-semibold ${
            player.isImpostor ? 'text-red-400' : 'text-green-400'
          }`}>
            {player.isImpostor ? '👹 Impostor' : '👨‍🦰 Civil'}
          </p>
        )}

        {/* Votos recibidos */}
        {votes > 0 && (
          <div className="mt-2 inline-block bg-red-500/20 px-3 py-1 rounded-full">
            <p className="text-red-400 text-sm font-bold">
              {votes} voto{votes > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
