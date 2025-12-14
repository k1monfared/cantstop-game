import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './BottomSheet.css'

function BottomSheet({
  visible,
  onClose,
  title,
  children,
  className = ''
}) {
  // Handle Android back button
  useEffect(() => {
    if (!visible) return

    const handleBackButton = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleBackButton)
    return () => window.removeEventListener('keydown', handleBackButton)
  }, [visible, onClose])

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="bottom-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className={`bottom-sheet ${className}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              // Close if dragged down more than 150px
              if (info.offset.y > 150) {
                onClose()
              }
            }}
          >
            {/* Handle bar */}
            <div className="bottom-sheet-handle">
              <div className="bottom-sheet-handle-bar" />
            </div>

            {/* Title */}
            {title && (
              <div className="bottom-sheet-header">
                <h3 className="bottom-sheet-title">{title}</h3>
              </div>
            )}

            {/* Content */}
            <div className="bottom-sheet-content">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default BottomSheet
