import React from 'react'
import './PlayerInfoMobile.css'

function PlayerInfoMobile({ playerNumber, playerName, permanent, completed, isActive, columnLengths }) {
  const getProgress = (col) => permanent[col] || 0
  const isCompleted = (col) => completed.includes(col)

  const columns = Object.keys(columnLengths).map(Number)

  return (
    <div className={`mobile-player-info player-${playerNumber} ${isActive ? 'active' : ''}`}>
      <div className="mobile-player-header">
        <h3 className="mobile-player-name">{playerName}</h3>
        <div className="mobile-completion-status">
          {completed.length}/3 Columns
        </div>
      </div>

      <div className="mobile-progress-grid">
        {columns.map(col => {
          const progress = getProgress(col)
          const maxHeight = columnLengths[col]
          const percentage = (progress / maxHeight) * 100
          const complete = isCompleted(col)

          return (
            <div key={col} className="mobile-progress-item">
              <div className="mobile-progress-label">{col}</div>
              <div className="mobile-progress-bar-container">
                <div
                  className={`mobile-progress-bar player-${playerNumber}-bar ${
                    complete ? 'completed' : ''
                  }`}
                  style={{ height: `${percentage}%` }}
                >
                  {progress > 0 && (
                    <div className="mobile-progress-text">
                      {progress}/{maxHeight}
                    </div>
                  )}
                </div>
              </div>
              {complete && <div className="mobile-complete-check">✓</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PlayerInfoMobile
