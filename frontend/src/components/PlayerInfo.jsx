import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './PlayerInfo.css'

function PlayerInfo({
  playerNumber,
  playerName = `Player ${playerNumber}`,
  permanent,
  completed,
  isActive,
  columnLengths,
  canRoll = false,
  canStop = false,
  onRoll = () => {},
  onStop = () => {},
  loading = false,
  animatingMove = false,
  setPlayerName = () => {}
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [localName, setLocalName] = useState(playerName)

  // Update local name when prop changes
  useEffect(() => {
    setLocalName(playerName)
  }, [playerName])

  const totalProgress = Object.entries(permanent)
    .filter(([col]) => !completed.includes(parseInt(col)))
    .reduce((sum, [_, steps]) => sum + steps, 0)

  const columns = Object.keys(columnLengths).map(Number)

  const handleNameClick = () => {
    setIsEditing(true)
  }

  const handleNameChange = (e) => {
    setLocalName(e.target.value)
  }

  const handleNameBlur = () => {
    setIsEditing(false)
    const trimmedName = localName.trim()
    if (trimmedName === '') {
      setLocalName(`Player ${playerNumber}`)
      setPlayerName(`Player ${playerNumber}`)
    } else {
      setPlayerName(trimmedName)
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
            value={localName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            maxLength={30}
          />
        ) : (
          <h2 onClick={handleNameClick} className="player-name-heading" style={{ cursor: 'pointer' }}>
            {playerName}
          </h2>
        )}
      </div>
    </div>
  )
}

export default PlayerInfo
