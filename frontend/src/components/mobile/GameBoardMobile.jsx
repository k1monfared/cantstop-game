import React, { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import './GameBoardMobile.css'

function GameBoardMobile({
  gameState,
  hoveredPairing,
  hoveredSum,
  sumColorMap,
  onUndo,
  onRedo,
  player1Name,
  player2Name,
  selectedPairingSums, // {sums: [sum1, sum2], pairing: {...}}
  onConfirmMove, // Called on double-tap
  onChooseSum // Called when tapping a column in choose-one scenario
}) {
  const { column_lengths, player1_permanent, player2_permanent, temp_progress, active_runners } = gameState
  const [tapCount, setTapCount] = useState(0)
  const tapTimeoutRef = useRef(null)

  const getColumnHeight = (col) => column_lengths[col]

  const getPlayerInitials = (playerName) => {
    const words = playerName.trim().split(/\s+/)
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase()
    }
    return words.slice(0, 3).map(w => w[0]).join('').toUpperCase()
  }

  const getPlayer1Progress = (col) => player1_permanent[col] || 0
  const getPlayer2Progress = (col) => player2_permanent[col] || 0
  const getTempProgress = (col) => temp_progress[col] || 0

  const isCompleted = (col) => {
    return gameState.player1_completed.includes(col) || gameState.player2_completed.includes(col)
  }

  const getCompletedBy = (col) => {
    if (gameState.player1_completed.includes(col)) return 1
    if (gameState.player2_completed.includes(col)) return 2
    return null
  }

  const isActive = (col) => active_runners.includes(col)

  const columns = Object.keys(column_lengths).map(Number)

  // Double-tap handler
  const handleBoardTap = useCallback(() => {
    if (tapTimeoutRef.current) {
      // This is second tap - double tap detected
      clearTimeout(tapTimeoutRef.current)
      tapTimeoutRef.current = null
      setTapCount(0)

      // Trigger move confirmation if we have a pairing selected
      if (selectedPairingSums?.sums) {
        onConfirmMove?.()

        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate([10, 50, 10])
        }
      }
    } else {
      // This is first tap - wait for second tap
      setTapCount(1)
      tapTimeoutRef.current = setTimeout(() => {
        // Timeout expired - single tap, not double tap
        setTapCount(0)
        tapTimeoutRef.current = null
      }, 300) // 300ms window for double tap
    }
  }, [selectedPairingSums, onConfirmMove])

  // Column tap handler for choosing sum
  const handleColumnTap = useCallback((col) => {
    if (selectedPairingSums?.sums?.includes(col)) {
      onChooseSum?.(col)

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }
    }
  }, [selectedPairingSums, onChooseSum])

  // Check if column should show hint dot
  const shouldShowHint = useCallback((col) => {
    return selectedPairingSums?.sums?.includes(col)
  }, [selectedPairingSums])

  // Check if both sums are same (both can be played)
  const isChooseOneScenario = useCallback(() => {
    if (!selectedPairingSums?.sums) return false
    const [sum1, sum2] = selectedPairingSums.sums
    return sum1 === sum2 || (
      // Both are playable but different - need to choose
      selectedPairingSums.sums.length === 2 &&
      sum1 !== sum2
    )
  }, [selectedPairingSums])

  return (
    <div className="mobile-game-board" onClick={handleBoardTap}>
      {/* Hint overlay for double-tap */}
      {selectedPairingSums?.sums && (
        <div className="board-hint-overlay">
          Double-tap board to confirm move
        </div>
      )}

      {/* Columns - scrollable horizontally */}
      <div className="mobile-columns-wrapper">
        <div className="mobile-columns-container">
          {columns.map(col => {
            const height = getColumnHeight(col)
            const p1Progress = getPlayer1Progress(col)
            const p2Progress = getPlayer2Progress(col)
            const tempProg = getTempProgress(col)
            const currentPlayer = gameState.current_player
            const permanentProg = currentPlayer === 1 ? p1Progress : p2Progress
            const completed = isCompleted(col)
            const completedBy = getCompletedBy(col)
            const active = isActive(col)
            const showHint = shouldShowHint(col)
            const isChooseOne = isChooseOneScenario()

            return (
              <div
                key={col}
                className={`mobile-column ${active ? 'column-active' : ''} ${showHint ? 'column-hint' : ''}`}
                onClick={(e) => {
                  if (isChooseOne && showHint) {
                    e.stopPropagation()
                    handleColumnTap(col)
                  }
                }}
              >
                <div className="mobile-column-header">
                  <span className="mobile-column-number">{col}</span>
                </div>

                <div className="mobile-column-track">
                  {Array.from({ length: height }, (_, i) => {
                    const position = i + 1
                    const hasP1 = position === p1Progress && p1Progress > 0
                    const hasP2 = position === p2Progress && p2Progress > 0
                    const hasTemp = position === permanentProg + tempProg && tempProg > 0
                    const isHintPosition = showHint && position === permanentProg + tempProg + 1

                    return (
                      <motion.div
                        key={position}
                        className={`mobile-column-cell ${completed ? 'completed' : ''} ${
                          completedBy === 1 ? 'player-1-completed' : ''
                        } ${completedBy === 2 ? 'player-2-completed' : ''} ${
                          active ? 'cell-active' : ''
                        }`}
                        initial={false}
                      >
                        {hasP1 && (
                          <motion.div
                            className="mobile-cell-marker player-1-marker"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          />
                        )}
                        {hasP2 && (
                          <motion.div
                            className="mobile-cell-marker player-2-marker"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          />
                        )}
                        {hasTemp && (
                          <motion.div
                            layoutId={`temp-marker-col${col}-player${currentPlayer}`}
                            className={`mobile-cell-marker temp-marker player-${currentPlayer}-temp`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            layout
                            transition={{
                              type: 'spring',
                              stiffness: 100,
                              damping: 20,
                              layout: { duration: 1.5 }
                            }}
                          />
                        )}
                        {isHintPosition && (
                          <motion.div
                            className="mobile-hint-dot"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                          />
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                {completed && (
                  <div className={`mobile-completed-badge player-${completedBy}-badge`}>
                    {getPlayerInitials(completedBy === 1 ? player1Name : player2Name)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default GameBoardMobile
