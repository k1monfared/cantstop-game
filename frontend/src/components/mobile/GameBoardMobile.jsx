import React from 'react'
import { motion } from 'framer-motion'
import './GameBoardMobile.css'

function GameBoardMobile({ gameState, hoveredPairing, hoveredSum, sumColorMap, onUndo, onRedo, player1Name, player2Name }) {
  const { column_lengths, player1_permanent, player2_permanent, temp_progress, active_runners } = gameState

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

  return (
    <div className="mobile-game-board">
      {/* Undo/Redo buttons - positioned at top */}
      <div className="mobile-history-controls">
        <button
          className="mobile-history-btn"
          onClick={onUndo}
          disabled={!gameState.can_undo}
          title="Undo"
        >
          ←
        </button>
        <button
          className="mobile-history-btn"
          onClick={onRedo}
          disabled={!gameState.can_redo}
          title="Redo"
        >
          →
        </button>
      </div>

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

            return (
              <div key={col} className={`mobile-column ${active ? 'column-active' : ''}`}>
                <div className="mobile-column-header">
                  <span className="mobile-column-number">{col}</span>
                </div>

                <div className="mobile-column-track">
                  {Array.from({ length: height }, (_, i) => {
                    const position = i + 1
                    const hasP1 = position === p1Progress && p1Progress > 0
                    const hasP2 = position === p2Progress && p2Progress > 0
                    const hasTemp = position === permanentProg + tempProg && tempProg > 0

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
