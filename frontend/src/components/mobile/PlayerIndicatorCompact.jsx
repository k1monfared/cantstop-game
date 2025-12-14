import React from 'react'

function PlayerIndicatorCompact({ currentPlayer, player1Name, player2Name, gameState }) {
  const p1Completed = gameState?.player1_completed?.length || 0
  const p2Completed = gameState?.player2_completed?.length || 0

  return (
    <div className="player-indicator-compact">
      <div className={`player-turn-indicator player-${currentPlayer}`}>
        {currentPlayer === 1 ? player1Name : player2Name}'s Turn
      </div>
      <div className="player-names-row">
        <span className={`player-name-item ${currentPlayer === 1 ? 'active' : ''}`}>
          {player1Name} ({p1Completed}/3)
        </span>
        <span>vs</span>
        <span className={`player-name-item ${currentPlayer === 2 ? 'active' : ''}`}>
          {player2Name} ({p2Completed}/3)
        </span>
      </div>
    </div>
  )
}

export default PlayerIndicatorCompact
