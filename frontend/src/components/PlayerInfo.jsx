import React, { useState } from 'react'
import { motion } from 'framer-motion'
import './PlayerInfo.css'

function PlayerInfo({
  playerNumber,
  permanent,
  completed,
  isActive,
  columnLengths,
  canRoll = false,
  canStop = false,
  onRoll = () => {},
  onStop = () => {},
  loading = false,
  animatingMove = false
}) {
  const [playerName, setPlayerName] = useState(`Player ${playerNumber}`)
  const [isEditing, setIsEditing] = useState(false)

  const totalProgress = Object.entries(permanent)
    .filter(([col]) => !completed.includes(parseInt(col)))
    .reduce((sum, [_, steps]) => sum + steps, 0)

  const columns = Object.keys(columnLengths).map(Number)

  const handleNameClick = () => {
    setIsEditing(true)
  }

  const handleNameChange = (e) => {
    setPlayerName(e.target.value)
  }

  const handleNameBlur = () => {
    setIsEditing(false)
    if (playerName.trim() === '') {
      setPlayerName(`Player ${playerNumber}`)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameBlur()
    }
  }

  return (
    <div className={`player-info player-${playerNumber} ${isActive ? 'active' : ''}`}>
      <div className="player-header">
        {isEditing ? (
          <input
            type="text"
            className="player-name-input"
            value={playerName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            maxLength={20}
          />
        ) : (
          <h2 onClick={handleNameClick} className="player-name-heading">
            {playerName}
          </h2>
        )}
      </div>
    </div>
  )
}

export default PlayerInfo
