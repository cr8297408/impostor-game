import { motion } from 'framer-motion'

export const Card = ({
  children,
  className = '',
  onClick,
  hover = false,
  ...props
}) => {
  const baseClasses = 'glass rounded-2xl shadow-xl p-6'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      onClick={onClick}
      className={`${baseClasses} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
