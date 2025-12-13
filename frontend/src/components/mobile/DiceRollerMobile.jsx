import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './DiceRollerMobile.css'

function DiceRollerMobile({ dice, isBust, onContinue, onRoll, onStop, canRoll, canStop, loading, currentPlayer }) {
  const renderDie = (value, index) => {
    const dots = []

    // Generate dot pattern based on value
    const dotPositions = {
      1: [[50, 50]],
      2: [[25, 25], [75, 75]],
      3: [[25, 25], [50, 50], [75, 75]],
      4: [[25, 25], [25, 75], [75, 25], [75, 75]],
      5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
      6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]]
    }

    const positions = dotPositions[value] || []

    return (
      <motion.div
        key={`die-${index}`}
        className="mobile-die"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: index * 0.1
        }}
      >
        {positions.map((pos, i) => (
          <div
            key={i}
            className="mobile-die-dot"
            style={{ left: `${pos[0]}%`, top: `${pos[1]}%` }}
          />
        ))}
      </motion.div>
    )
  }

  return (
    <div className="mobile-dice-roller">
      {/* Dice Display */}
      <div className="mobile-dice-container">
        {dice && dice.length === 4 ? (
          <div className={`mobile-dice-grid ${isBust ? 'bust' : ''}`}>
            {dice.map((die, idx) => renderDie(die, idx))}
          </div>
        ) : (
          <div className="mobile-no-dice">
            <div className="mobile-roll-prompt">Tap to Roll</div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mobile-dice-actions">
        <AnimatePresence mode="wait">
          {isBust ? (
            <motion.button
              key="continue"
              className="mobile-action-btn continue-btn"
              onClick={onContinue}
              disabled={loading}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileTap={{ scale: 0.95 }}
            >
              BUST! Next Player
            </motion.button>
          ) : (
            <>
              <motion.button
                key="roll"
                className={`mobile-action-btn roll-btn ${canRoll ? 'can-roll' : ''}`}
                onClick={onRoll}
                disabled={!canRoll || loading}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? 'Rolling...' : 'Roll Dice'}
              </motion.button>
              {canStop && (
                <motion.button
                  key="stop"
                  className="mobile-action-btn stop-btn"
                  onClick={onStop}
                  disabled={loading}
                  initial={{ scale: 0.8, opacity: 0, x: 20 }}
                  animate={{ scale: 1, opacity: 1, x: 0 }}
                  exit={{ scale: 0.8, opacity: 0, x: 20 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Stop Turn
                </motion.button>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default DiceRollerMobile
