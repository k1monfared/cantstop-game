import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import GameBoardMobile from './components/mobile/GameBoardMobile'
import DiceAreaNew from './components/mobile/DiceAreaNew'
import PlayerIndicatorCompact from './components/mobile/PlayerIndicatorCompact'
import UnifiedMenu from './components/mobile/UnifiedMenu'
import BottomSheet from './components/mobile/BottomSheet'
import BustProbabilityMobile from './components/mobile/BustProbabilityMobile'
import { HamburgerIcon, UndoIcon, RedoIcon } from './components/mobile/IconsSVG'
import { API_BASE_URL } from './config'
import './AppMobile.css'

const API_BASE = API_BASE_URL

function AppMobileRedesigned() {
  const [gameId, setGameId] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [player1Name, setPlayer1Name] = useState('Player 1')
  const [player2Name, setPlayer2Name] = useState('Player 2')

  // UI state
  const [showUnifiedMenu, setShowUnifiedMenu] = useState(false)
  const [showProbSidebar, setShowProbSidebar] = useState(false)

  // Game interaction state
  const [selectedPairingSums, setSelectedPairingSums] = useState(null) // {sums: [7, 8], pairing: {...}}
  const [animatingMove, setAnimatingMove] = useState(false)

  // Helper function to normalize game state
  const normalizeGameState = (state) => {
    const normalized = { ...state }
    if (normalized.player1_permanent) {
      normalized.player1_permanent = Object.fromEntries(
        Object.entries(normalized.player1_permanent).map(([k, v]) => [parseInt(k), v])
      )
    }
    if (normalized.player2_permanent) {
      normalized.player2_permanent = Object.fromEntries(
        Object.entries(normalized.player2_permanent).map(([k, v]) => [parseInt(k), v])
      )
    }
    if (normalized.temp_progress) {
      normalized.temp_progress = Object.fromEntries(
        Object.entries(normalized.temp_progress).map(([k, v]) => [parseInt(k), v])
      )
    }
    return normalized
  }

  // Create new game on mount
  useEffect(() => {
    createNewGame()
  }, [])

  const createNewGame = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE}/games`, {
        player1_name: player1Name,
        player2_name: player2Name
      })
      setGameId(response.data.game_id)
      setGameState(normalizeGameState(response.data.state))
      setSelectedPairingSums(null)
      if (response.data.state.player1_name) setPlayer1Name(response.data.state.player1_name)
      if (response.data.state.player2_name) setPlayer2Name(response.data.state.player2_name)
    } catch (error) {
      console.error('Error creating game:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveGame = async () => {
    if (!gameId) return

    try {
      const response = await axios.get(`${API_BASE}/games/${gameId}/save`)
      const { filename, data } = response.data

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error saving game:', error)
      alert('Failed to save game')
    }
  }

  const loadGame = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(`${API_BASE}/games/load`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setGameId(response.data.game_id)
      const normalizedState = normalizeGameState(response.data.state)
      setGameState(normalizedState)
      setSelectedPairingSums(null)
      if (normalizedState.player1_name) setPlayer1Name(normalizedState.player1_name)
      if (normalizedState.player2_name) setPlayer2Name(normalizedState.player2_name)

      alert('Game loaded successfully!')
    } catch (error) {
      console.error('Error loading game:', error)
      alert(`Failed to load game: ${error.response?.data?.detail || error.message}`)
    } finally {
      setLoading(false)
      event.target.value = null
    }
  }

  const rollDice = async () => {
    if (!gameId || animatingMove) return

    setLoading(true)
    setSelectedPairingSums(null)

    try {
      const response = await axios.post(`${API_BASE}/games/${gameId}/roll`)
      setGameState(normalizeGameState(response.data.state))
    } catch (error) {
      console.error('Error rolling dice:', error)
    } finally {
      setLoading(false)
    }
  }

  const confirmMove = async (chosenSum = null) => {
    if (animatingMove || !selectedPairingSums) return

    setAnimatingMove(true)

    try {
      // Find the pairing index from available_pairings that matches our selected sums
      const pairingToUse = selectedPairingSums.sums
      const pairingIndex = gameState.available_pairings?.findIndex(
        p => (p[0] === pairingToUse[0] && p[1] === pairingToUse[1]) ||
             (p[0] === pairingToUse[1] && p[1] === pairingToUse[0])
      )

      if (pairingIndex === -1) {
        console.error('Could not find pairing index')
        return
      }

      const response = await axios.post(`${API_BASE}/games/${gameId}/choose`, {
        pairing_index: pairingIndex,
        chosen_number: chosenSum
      })

      await new Promise(resolve => setTimeout(resolve, 600))

      setGameState(normalizeGameState(response.data.state))
      setSelectedPairingSums(null)
    } catch (error) {
      console.error('Error choosing pairing:', error)
    } finally {
      setAnimatingMove(false)
    }
  }

  const stopTurn = async () => {
    if (!gameId || animatingMove) return

    setLoading(true)

    try {
      const response = await axios.post(`${API_BASE}/games/${gameId}/stop`)
      setGameState(normalizeGameState(response.data.state))
      setSelectedPairingSums(null)
    } catch (error) {
      console.error('Error stopping turn:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUndo = async () => {
    if (!gameId || animatingMove) return

    setLoading(true)

    try {
      const response = await axios.post(`${API_BASE}/games/${gameId}/undo`)
      setGameState(normalizeGameState(response.data.state))
      setSelectedPairingSums(null)
    } catch (error) {
      console.error('Error undoing:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRedo = async () => {
    if (!gameId || animatingMove) return

    setLoading(true)

    try {
      const response = await axios.post(`${API_BASE}/games/${gameId}/redo`)
      setGameState(normalizeGameState(response.data.state))
      setSelectedPairingSums(null)
    } catch (error) {
      console.error('Error redoing:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePairingChange = (data) => {
    setSelectedPairingSums(data)
  }

  const handleChooseSum = (sum) => {
    // When user taps a column in choose-one scenario
    confirmMove(sum)
  }

  if (!gameState) {
    return (
      <div className={`mobile-app ${darkMode ? 'dark-mode' : ''}`}>
        <div className="mobile-loading">
          <div>
            <div>Loading game...</div>
            <div style={{ fontSize: '0.9rem', marginTop: '1rem', opacity: 0.8 }}>
              Note: This app is hosted on a free server, so it may take a minute to start up.
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentPlayer = gameState.current_player
  const hasDice = gameState.current_dice !== null && gameState.current_dice !== undefined
  const hasTempProgress = Object.keys(gameState.temp_progress).length > 0
  const hasChosenPairing = gameState.last_chosen_pairing_index !== null && gameState.last_chosen_pairing_index !== undefined

  const canRoll = !gameState.game_over && !animatingMove && (!hasDice || hasChosenPairing)
  const canStop = hasTempProgress && !gameState.is_bust && !animatingMove && (!hasDice || hasChosenPairing)

  return (
    <div className={`mobile-app ${darkMode ? 'dark-mode' : ''}`}>
      <div className="mobile-fullscreen-container">
        {/* Top-left: Player Indicator */}
        <div className="mobile-corner-top-left">
          <PlayerIndicatorCompact
            currentPlayer={currentPlayer}
            player1Name={player1Name}
            player2Name={player2Name}
            gameState={gameState}
          />
        </div>

        {/* Top-right: Hamburger Menu */}
        <div className="mobile-corner-top-right" onClick={() => setShowUnifiedMenu(true)}>
          <HamburgerIcon size={24} />
        </div>

        {/* Center: Game Board */}
        <div className="mobile-board-area">
          <div className="mobile-board-wrapper">
            <GameBoardMobile
              gameState={gameState}
              player1Name={player1Name}
              player2Name={player2Name}
              selectedPairingSums={selectedPairingSums}
              onConfirmMove={() => confirmMove()}
              onChooseSum={handleChooseSum}
            />
          </div>
        </div>

        {/* Bottom-left: Dice Area */}
        {!gameState.game_over && (
          <div className="mobile-corner-bottom-left">
            <DiceAreaNew
              dice={gameState.current_dice}
              canRoll={canRoll}
              canStop={canStop}
              onRoll={rollDice}
              onStop={stopTurn}
              onPairingChange={handlePairingChange}
              loading={loading}
            />
          </div>
        )}

        {/* Bottom-right: Undo/Redo */}
        {!gameState.game_over && (
          <div className="mobile-corner-bottom-right">
            <div className="undo-redo-buttons">
              <button
                className="undo-redo-btn"
                onClick={handleUndo}
                disabled={!gameState.can_undo || loading}
                aria-label="Undo"
              >
                <UndoIcon size={20} />
              </button>
              <button
                className="undo-redo-btn"
                onClick={handleRedo}
                disabled={!gameState.can_redo || loading}
                aria-label="Redo"
              >
                <RedoIcon size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Unified Menu */}
      <UnifiedMenu
        visible={showUnifiedMenu}
        onClose={() => setShowUnifiedMenu(false)}
        darkMode={darkMode}
        onNewGame={createNewGame}
        onSaveGame={saveGame}
        onLoadGame={loadGame}
        onShowBrain={() => setShowProbSidebar(true)}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        loading={loading}
      />

      {/* Probability Sidebar */}
      <AnimatePresence>
        {showProbSidebar && (
          <>
            <motion.div
              className="popup-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProbSidebar(false)}
            />
            <motion.div
              className="popup-brain"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
            >
              <button className="popup-close" onClick={() => setShowProbSidebar(false)}>✕</button>
              <h3>Bust Probability</h3>
              <div className="popup-content">
                <div className="prob-simple">
                  <div className="prob-label">Current bust chance:</div>
                  <div className="prob-value">{Math.round((gameState.bust_probability || 0) * 100)}%</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Winner overlay */}
      {gameState.game_over && (
        <>
          <motion.div
            className={`mobile-winner-overlay player-${gameState.winner}-wins`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.1, 1], opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="winner-name">
              {gameState.winner === 1 ? player1Name : player2Name}
            </div>
            <div className="winner-text">wins!</div>
          </motion.div>
          <motion.button
            className="mobile-play-again-btn"
            onClick={createNewGame}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            Play Again
          </motion.button>
        </>
      )}
    </div>
  )
}

export default AppMobileRedesigned
