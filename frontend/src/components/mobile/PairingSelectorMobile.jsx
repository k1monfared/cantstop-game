import React from 'react'
import { motion } from 'framer-motion'
import './PairingSelectorMobile.css'

function PairingSelectorMobile({
  availablePairings,
  validPairings,
  pairingPlayability,
  selectedPairing,
  onSelectSum,
  activeRunners,
  allCompleted,
  isBust,
  onHoverPairing,
  hoveredPairing,
  onHoverSum,
  hoveredSum,
  sumColorMap,
  lastChosenPairingIndex
}) {
  const isValidPairing = (pairing) => {
    return validPairings?.some(vp => vp[0] === pairing[0] && vp[1] === pairing[1])
  }

  const getValidPairingIndex = (pairing) => {
    return validPairings?.findIndex(vp => vp[0] === pairing[0] && vp[1] === pairing[1]) ?? -1
  }

  const handleSumClick = (pairingIndex, sum, event) => {
    event.stopPropagation()
    if (isBust || lastChosenPairingIndex !== null) return

    const validIdx = getValidPairingIndex(availablePairings[pairingIndex])
    if (validIdx >= 0) {
      onSelectSum(validIdx, sum)
    }
  }

  return (
    <div className="mobile-pairing-selector">
      <div className="mobile-pairing-header">Choose Your Move</div>
      <div className="mobile-pairings-grid">
        {availablePairings.map((pairing, index) => {
          const isValid = isValidPairing(pairing)
          const validIdx = getValidPairingIndex(pairing)
          const playability = validIdx >= 0 ? pairingPlayability[validIdx] : null
          const isChosen = lastChosenPairingIndex === validIdx
          const needsChoice = playability?.needs_choice

          return (
            <motion.div
              key={index}
              className={`mobile-pairing-card ${isValid ? 'valid' : 'invalid'} ${
                isChosen ? 'chosen' : ''
              } ${isBust ? 'bust' : ''}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              onTouchStart={() => onHoverPairing(index)}
              onTouchEnd={() => onHoverPairing(null)}
              onMouseEnter={() => onHoverPairing(index)}
              onMouseLeave={() => onHoverPairing(null)}
            >
              <div className="mobile-pairing-sums">
                {/* Sum 1 */}
                <div
                  className={`mobile-sum-box ${
                    allCompleted.includes(pairing[0]) ? 'completed' : ''
                  } ${activeRunners.includes(pairing[0]) ? 'active' : ''} ${
                    playability && !playability.sum1_playable ? 'unplayable' : ''
                  } ${needsChoice ? 'clickable' : ''}`}
                  onClick={(e) => needsChoice && handleSumClick(index, pairing[0], e)}
                  onTouchStart={() => needsChoice && onHoverSum(pairing[0])}
                  onTouchEnd={() => needsChoice && onHoverSum(null)}
                >
                  <div className="mobile-sum-number">{pairing[0]}</div>
                  {activeRunners.includes(pairing[0]) && (
                    <div className="mobile-runner-indicator">●</div>
                  )}
                </div>

                <div className="mobile-plus">+</div>

                {/* Sum 2 */}
                <div
                  className={`mobile-sum-box ${
                    allCompleted.includes(pairing[1]) ? 'completed' : ''
                  } ${activeRunners.includes(pairing[1]) ? 'active' : ''} ${
                    playability && !playability.sum2_playable ? 'unplayable' : ''
                  } ${needsChoice ? 'clickable' : ''}`}
                  onClick={(e) => needsChoice && handleSumClick(index, pairing[1], e)}
                  onTouchStart={() => needsChoice && onHoverSum(pairing[1])}
                  onTouchEnd={() => needsChoice && onHoverSum(null)}
                >
                  <div className="mobile-sum-number">{pairing[1]}</div>
                  {activeRunners.includes(pairing[1]) && (
                    <div className="mobile-runner-indicator">●</div>
                  )}
                </div>
              </div>

              {/* Auto-confirm for non-choice pairings */}
              {!needsChoice && isValid && !isChosen && !isBust && (
                <button
                  className="mobile-confirm-btn"
                  onClick={() => onSelectSum(validIdx, null)}
                >
                  Select
                </button>
              )}

              {needsChoice && isValid && (
                <div className="mobile-choice-hint">Tap one sum</div>
              )}

              {isChosen && (
                <div className="mobile-chosen-indicator">✓ Selected</div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default PairingSelectorMobile
