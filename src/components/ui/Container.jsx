import { motion } from 'framer-motion'

export const Container = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen flex items-center justify-center p-4 ${className}`}
    >
      <div className="w-full max-w-4xl">
        {children}
      </div>
    </motion.div>
  )
}
