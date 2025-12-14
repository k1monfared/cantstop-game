import React from 'react'
import { motion } from 'framer-motion'
import './FloatingActionButton.css'

function FloatingActionButton({
  icon,
  onClick,
  position = { bottom: 20, right: 20 },
  ariaLabel,
  disabled = false,
  className = ''
}) {
  const style = {
    bottom: `${position.bottom}px`,
    right: position.right ? `${position.right}px` : undefined,
    left: position.left ? `${position.left}px` : undefined,
  }

  return (
    <motion.button
      className={`fab ${className}`}
      onClick={onClick}
      style={style}
      disabled={disabled}
      aria-label={ariaLabel}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <span className="fab-icon">{icon}</span>
    </motion.button>
  )
}

export default FloatingActionButton
