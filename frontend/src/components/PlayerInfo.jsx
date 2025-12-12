import React, { useState } from 'react'
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
  const totalProgress = Object.entries(permanent)
    .filter(([col]) => !completed.includes(parseInt(col)))
    .reduce((sum, [_, steps]) => sum + steps, 0)

  const columns = Object.keys(columnLengths).map(Number)

  return (
    <div className={`player-info player-${playerNumber} ${isActive ? 'active' : ''}`}>
      <div className="player-header">
        <h2 className="player-name-heading">
          {playerName}
        </h2>
      </div>
    </div>
  )
}

export default PlayerInfo
