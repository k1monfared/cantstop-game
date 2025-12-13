import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import GameBoardMobile from './components/mobile/GameBoardMobile'
import DiceRollerMobile from './components/mobile/DiceRollerMobile'
import PairingSelectorMobile from './components/mobile/PairingSelectorMobile'
import PlayerInfoMobile from './components/mobile/PlayerInfoMobile'
import BrainIconSVG from './components/BrainIconSVG'
import BustProbabilityMobile from './components/mobile/BustProbabilityMobile'
import { API_BASE_URL } from './config'
import './AppMobile.css'

const API_BASE = API_BASE_URL

function AppMobile() {
  const [gameId, setGameId] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedPairing, setSelectedPairing] = useState(null)
  const [animatingMove, setAnimatingMove] = useState(false)
  const [lastDice, setLastDice] = useState(null)
  const [darkMode, setDarkMode] = useState(true)
  const [hoveredPairing, setHoveredPairing] = useState(null)
  const [hoveredSum, setHoveredSum] = useState(null)
  const [showProbSidebar, setShowProbSidebar] = useState(false)
  const [player1Name, setPlayer1Name] = useState('Player 1')
  const [player2Name, setPlayer2Name] = useState('Player 2')
  const [showGameMenu, setShowGameMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showPlayerInfo, setShowPlayerInfo] = useState(false)

  // Helper function to convert string keys to integers in game state
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

  // Track last dice whenever game state changes
  useEffect(() => {
    if (gameState?.current_dice) {
      setLastDice(gameState.current_dice)
    }
  }, [gameState?.current_dice])

  // Generate initial random dice on game creation
  useEffect(() => {
    if (gameState && !lastDice) {
      const initialDice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => a - b)
      setLastDice(initialDice)
    }
  }, [gameState, lastDice])

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isDropdown = event.target.closest('.mobile-dropdown-menu')
      const isButton = event.target.closest('.mobile-menu-btn')
      const isProbSidebar = event.target.closest('.mobile-prob-panel')

      if (!isDropdown && !isButton && !isProbSidebar) {
        setShowGameMenu(false)
        setShowSettings(false)
      }
    }

    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('mousedown', handleClickOutside)
    }
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
      setSelectedPairing(null)
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
      setSelectedPairing(null)
      setLastDice(null)
      if (normalizedState.player1_name) setPlayer1Name(normalizedState.player1_name)
      if (normalizedState.player2_name) setPlayer2Name(normalizedState.player2_name)

      setShowGameMenu(false)
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
    setSelectedPairing(null)

    try {
      const response = await axios.post(`${API_BASE}/games/${gameId}/roll`)
      setGameState(normalizeGameState(response.data.state))
    } catch (error) {
      console.error('Error rolling dice:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectSum = async (pairingIndex, sum) => {
    if (animatingMove || gameState.is_bust) return
    setSelectedPairing(pairingIndex)
    await confirmPairingWithIndex(pairingIndex, sum)
  }

  const confirmPairingWithIndex = async (pairingIndex, number) => {
    if (animatingMove) return

    setAnimatingMove(true)

    try {
      const response = await axios.post(`${API_BASE}/games/${gameId}/choose`, {
        pairing_index: pairingIndex,
        chosen_number: number
      })

      await new Promise(resolve => setTimeout(resolve, 600))

      setGameState(normalizeGameState(response.data.state))
      setSelectedPairing(null)
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
      setSelectedPairing(null)
    } catch (error) {
      console.error('Error stopping turn:', error)
    } finally {
      setLoading(false)
    }
  }

  const continueAfterBust = async () => {
    if (!gameId) return

    setLoading(true)

    try {
      const response = await axios.post(`${API_BASE}/games/${gameId}/continue`)
      setGameState(normalizeGameState(response.data.state))
    } catch (error) {
      console.error('Error continuing after bust:', error)
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
      setSelectedPairing(null)
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
      setSelectedPairing(null)
    } catch (error) {
      console.error('Error redoing:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!gameState) {
    return (
      <div className={`mobile-app ${darkMode ? 'dark-mode' : ''}`}>
        <div className="mobile-loading">Loading game...</div>
      </div>
    )
  }

  const currentPlayer = gameState.current_player
  const hasDice = gameState.current_dice !== null && gameState.current_dice !== undefined
  const hasPairings = gameState.available_pairings?.length > 0
  const hasValidMoves = gameState.valid_pairings?.length > 0
  const isBust = gameState.is_bust
  const hasTempProgress = Object.keys(gameState.temp_progress).length > 0
  const hasChosenPairing = gameState.last_chosen_pairing_index !== null && gameState.last_chosen_pairing_index !== undefined

  const canRollPlayer1 = currentPlayer === 1 && !gameState.game_over && !animatingMove && (!hasDice || hasChosenPairing)
  const canRollPlayer2 = currentPlayer === 2 && !gameState.game_over && !animatingMove && (!hasDice || hasChosenPairing)

  const canStopPlayer1 = currentPlayer === 1 && hasTempProgress && !isBust && !animatingMove && (!hasDice || hasChosenPairing)
  const canStopPlayer2 = currentPlayer === 2 && hasTempProgress && !isBust && !animatingMove && (!hasDice || hasChosenPairing)

  // Calculate sum color map for visual feedback
  let sumColorMap = {}
  if (hoveredPairing !== null && !hasChosenPairing) {
    const pairing = gameState.available_pairings?.[hoveredPairing]
    if (pairing) {
      if (pairing[0] === pairing[1]) {
        sumColorMap[pairing[0]] = ['pair1', 'pair2']
      } else {
        sumColorMap[pairing[0]] = 'pair1'
        sumColorMap[pairing[1]] = 'pair2'
      }
    }
  }

  return (
    <div className={`mobile-app ${darkMode ? 'dark-mode' : ''}`}>
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-header-left">
          <button
            className="mobile-menu-btn"
            onClick={() => {
              setShowSettings(false)
              setShowProbSidebar(false)
              setShowGameMenu(!showGameMenu)
            }}
          >
            ☰
          </button>
        </div>

        <h1 className="mobile-title">CAN'T STOP</h1>

        <div className="mobile-header-right">
          <button
            className="mobile-menu-btn"
            onClick={() => {
              setShowGameMenu(false)
              setShowSettings(false)
              setShowProbSidebar(!showProbSidebar)
            }}
          >
            <BrainIconSVG width={20} height={20} />
          </button>
          <button
            className="mobile-menu-btn"
            onClick={() => {
              setShowGameMenu(false)
              setShowProbSidebar(false)
              setShowSettings(!showSettings)
            }}
          >
            ⚙
          </button>
        </div>
      </header>

      {/* Mobile Menus */}
      <AnimatePresence>
        {showGameMenu && (
          <motion.div
            className="mobile-dropdown-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h3>Game Menu</h3>
            <button onClick={() => { createNewGame(); setShowGameMenu(false); }} disabled={loading}>
              New Game
            </button>
            <button onClick={() => { saveGame(); setShowGameMenu(false); }} disabled={loading || !gameId}>
              Save Game
            </button>
            <label className="file-upload-btn">
              Load Game
              <input
                type="file"
                accept=".csp,.json"
                onChange={loadGame}
                style={{ display: 'none' }}
                disabled={loading}
              />
            </label>
          </motion.div>
        )}

        {showSettings && (
          <motion.div
            className="mobile-dropdown-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h3>Settings</h3>
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? 'Light Mode ☼' : 'Dark Mode ☾'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Player Indicator - Mobile optimized */}
      <div className="mobile-current-player">
        <button
          className="mobile-player-card"
          onClick={() => setShowPlayerInfo(!showPlayerInfo)}
        >
          <div className={`mobile-player-indicator ${currentPlayer === 1 ? 'player-1-active' : ''}`}>
            <span className="player-name">{player1Name}</span>
            <span className="completed-count">{gameState.player1_completed.length}/3</span>
          </div>
          <div className="vs-divider">vs</div>
          <div className={`mobile-player-indicator ${currentPlayer === 2 ? 'player-2-active' : ''}`}>
            <span className="player-name">{player2Name}</span>
            <span className="completed-count">{gameState.player2_completed.length}/3</span>
          </div>
        </button>
      </div>

      {/* Player Info Modal */}
      <AnimatePresence>
        {showPlayerInfo && (
          <motion.div
            className="mobile-player-info-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPlayerInfo(false)}
          >
            <motion.div
              className="mobile-player-info-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <PlayerInfoMobile
                playerNumber={1}
                playerName={player1Name}
                permanent={gameState.player1_permanent}
                completed={gameState.player1_completed}
                isActive={currentPlayer === 1}
                columnLengths={gameState.column_lengths}
                setPlayerName={setPlayer1Name}
              />
              <PlayerInfoMobile
                playerNumber={2}
                playerName={player2Name}
                permanent={gameState.player2_permanent}
                completed={gameState.player2_completed}
                isActive={currentPlayer === 2}
                columnLengths={gameState.column_lengths}
                setPlayerName={setPlayer2Name}
              />
              <button className="close-modal-btn" onClick={() => setShowPlayerInfo(false)}>
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Game Area */}
      <main className="mobile-game-area">
        {/* Game Board - Scrollable horizontally on mobile */}
        <div className="mobile-board-container">
          <GameBoardMobile
            gameState={gameState}
            hoveredPairing={hoveredPairing}
            hoveredSum={hoveredSum}
            sumColorMap={sumColorMap}
            onUndo={handleUndo}
            onRedo={handleRedo}
            player1Name={player1Name}
            player2Name={player2Name}
          />
        </div>

        {/* Controls Area - Fixed at bottom on mobile */}
        {!gameState.game_over && (
          <div className="mobile-controls">
            {/* Dice Roller */}
            <DiceRollerMobile
              dice={lastDice || gameState.current_dice}
              isBust={gameState.is_bust}
              onContinue={continueAfterBust}
              onRoll={rollDice}
              onStop={stopTurn}
              canRoll={canRollPlayer1 || canRollPlayer2}
              canStop={canStopPlayer1 || canStopPlayer2}
              loading={loading}
              currentPlayer={currentPlayer}
            />

            {/* Pairing Selector */}
            {hasPairings && (
              <PairingSelectorMobile
                availablePairings={gameState.available_pairings}
                validPairings={gameState.valid_pairings}
                pairingPlayability={gameState.pairing_playability}
                selectedPairing={selectedPairing}
                onSelectSum={selectSum}
                activeRunners={gameState.active_runners}
                allCompleted={[
                  ...gameState.player1_completed,
                  ...gameState.player2_completed
                ]}
                isBust={gameState.is_bust}
                onHoverPairing={setHoveredPairing}
                hoveredPairing={hoveredPairing}
                onHoverSum={setHoveredSum}
                hoveredSum={hoveredSum}
                sumColorMap={sumColorMap}
                lastChosenPairingIndex={gameState.last_chosen_pairing_index}
              />
            )}
          </div>
        )}
      </main>

      {/* Bust Probability Panel */}
      <AnimatePresence>
        {showProbSidebar && (
          <BustProbabilityMobile
            gameState={gameState}
            visible={showProbSidebar}
            hoveredPairing={hoveredPairing}
            hoveredSum={hoveredSum}
            sumColorMap={sumColorMap}
            onClose={() => setShowProbSidebar(false)}
          />
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

export default AppMobile
