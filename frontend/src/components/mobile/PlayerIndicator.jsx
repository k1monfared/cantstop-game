import React from 'react'
import './PlayerIndicator.css'

function PlayerIndicator({
  player1Name,
  player2Name,
  player1Completed,
  player2Completed,
  currentPlayer,
  onClick
}) {
  const getShortName = (name) => {
    if (name.length <= 10) return name
    return name.substring(0, 9) + '...'
  }

  return (
    <button
      className="player-indicator"
      onClick={onClick}
      aria-label="View player details"
    >
      <div className={`player-indicator-side ${currentPlayer === 1 ? 'active' : ''}`}>
        <span className="player-indicator-name">{getShortName(player1Name)}</span>
        <span className="player-indicator-score">{player1Completed}/3</span>
      </div>

      <div className="player-indicator-divider">vs</div>

      <div className={`player-indicator-side ${currentPlayer === 2 ? 'active' : ''}`}>
        <span className="player-indicator-name">{getShortName(player2Name)}</span>
        <span className="player-indicator-score">{player2Completed}/3</span>
      </div>
    </button>
  )
}

export default PlayerIndicator
