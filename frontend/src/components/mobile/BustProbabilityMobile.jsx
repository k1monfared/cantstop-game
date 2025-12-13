import React from 'react'
import { motion } from 'framer-motion'
import './BustProbabilityMobile.css'

function BustProbabilityMobile({ gameState, visible, hoveredPairing, hoveredSum, sumColorMap, onClose }) {
  if (!gameState || !visible) return null

  // Helper function to calculate probability of rolling specific sums
  const calculateProbabilities = (activeRunners, completedColumns) => {
    const allSums = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

    const availableColumns = allSums.filter(s =>
      !completedColumns.includes(s) &&
      (activeRunners.includes(s) || activeRunners.length < 3)
    )

    let totalOutcomes = 0
    let atLeastOneValidPairing = 0

    // Iterate through all possible 4-dice rolls (6^4 = 1296 outcomes)
    for (let d1 = 1; d1 <= 6; d1++) {
      for (let d2 = 1; d2 <= 6; d2++) {
        for (let d3 = 1; d3 <= 6; d3++) {
          for (let d4 = 1; d4 <= 6; d4++) {
            totalOutcomes++
            const dice = [d1, d2, d3, d4]

            const pairings = [
              [dice[0] + dice[1], dice[2] + dice[3]],
              [dice[0] + dice[2], dice[1] + dice[3]],
              [dice[0] + dice[3], dice[1] + dice[2]]
            ]

            let hasValidPairing = false

            for (const [sum1, sum2] of pairings) {
              const sum1Available = availableColumns.includes(sum1)
              const sum2Available = availableColumns.includes(sum2)

              if (sum1Available || sum2Available) {
                hasValidPairing = true
              }
            }

            if (hasValidPairing) atLeastOneValidPairing++
          }
        }
      }
    }

    return {
      bustProb: ((totalOutcomes - atLeastOneValidPairing) / totalOutcomes * 100).toFixed(0),
      safeProb: (atLeastOneValidPairing / totalOutcomes * 100).toFixed(0)
    }
  }

  const currentPlayer = gameState.current_player
  const currentCompletedColumns = currentPlayer === 1
    ? gameState.player1_completed || []
    : gameState.player2_completed || []
  const currentActiveRunners = gameState.active_runners || []

  const probs = calculateProbabilities(currentActiveRunners, currentCompletedColumns)

  // Calculate probability of busting within N rolls
  const bustProb = parseFloat(probs.bustProb) / 100
  const bustIn1 = (bustProb * 100).toFixed(0)
  const bustIn2 = ((1 - Math.pow(1 - bustProb, 2)) * 100).toFixed(0)
  const bustIn3 = ((1 - Math.pow(1 - bustProb, 3)) * 100).toFixed(0)

  return (
    <motion.div
      className="mobile-prob-panel"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="mobile-prob-header">
        <h3>Probabilities</h3>
        <button className="mobile-prob-close" onClick={onClose}>×</button>
      </div>

      <div className="mobile-prob-content">
        {/* Safe Probability */}
        <div className="mobile-prob-card main-prob">
          <div className="mobile-prob-label">Safe Probability</div>
          <div className="mobile-prob-value safe-value">{probs.safeProb}%</div>
          <div className="mobile-prob-desc">At least one valid move</div>
        </div>

        {/* Bust Risk */}
        <div className="mobile-prob-card">
          <div className="mobile-prob-label">Bust Risk</div>
          <div className="mobile-bust-risks">
            <div className="mobile-risk-row">
              <span className="risk-label">Next roll:</span>
              <span className="risk-value">{bustIn1}%</span>
            </div>
            <div className="mobile-risk-row">
              <span className="risk-label">Next 2 rolls:</span>
              <span className="risk-value">{bustIn2}%</span>
            </div>
            <div className="mobile-risk-row">
              <span className="risk-label">Next 3 rolls:</span>
              <span className="risk-value">{bustIn3}%</span>
            </div>
          </div>
        </div>

        {/* Active Runners */}
        {currentActiveRunners.length > 0 && (
          <div className="mobile-prob-card">
            <div className="mobile-prob-label">Active Columns</div>
            <div className="mobile-active-columns">
              {currentActiveRunners.map(col => (
                <span key={col} className="mobile-active-column-badge">
                  {col}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default BustProbabilityMobile
