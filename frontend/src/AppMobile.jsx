import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import GameBoardMobile from './components/mobile/GameBoardMobile'
import DiceRollerMobile from './components/mobile/DiceRollerMobile'
import PairingSelectorMobile from './components/mobile/PairingSelectorMobile'
import PlayerInfoMobile from './components/mobile/PlayerInfoMobile'
import PlayerIndicator from './components/mobile/PlayerIndicator'
import FloatingActionButton from './components/mobile/FloatingActionButton'
import BottomSheet from './components/mobile/BottomSheet'
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
  const [showQuickMenu, setShowQuickMenu] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

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
      const isBottomSheet = event.target.closest('.bottom-sheet')
      const isButton = event.target.closest('.mobile-menu-btn')
      const isProbSidebar = event.target.closest('.mobile-prob-panel')

      if (!isDropdown && !isBottomSheet && !isButton && !isProbSidebar) {
        setShowGameMenu(false)
        setShowSettings(false)
        setShowQuickMenu(false)
      }
    }

    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Scroll detection for collapsible header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show header when scrolling up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setHeaderVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Hide header when scrolling down
        setHeaderVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

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
      {/* Header removed - everything in FAB menu */}

      {/* Game Menu Bottom Sheet */}
      <BottomSheet
        visible={showGameMenu}
        onClose={() => setShowGameMenu(false)}
        title="Game Menu"
      >
        <div className="quick-menu-options">
          <button
            className="quick-menu-option"
            onClick={() => { createNewGame(); setShowGameMenu(false); }}
            disabled={loading}
          >
            <span className="quick-menu-icon">🎮</span>
            <span className="quick-menu-label">New Game</span>
          </button>
          <button
            className="quick-menu-option"
            onClick={() => { saveGame(); setShowGameMenu(false); }}
            disabled={loading || !gameId}
          >
            <span className="quick-menu-icon">💾</span>
            <span className="quick-menu-label">Save Game</span>
          </button>
          <label className="quick-menu-option" style={{ cursor: 'pointer' }}>
            <span className="quick-menu-icon">📂</span>
            <span className="quick-menu-label">Load Game</span>
            <input
              type="file"
              accept=".csp,.json"
              onChange={loadGame}
              style={{ display: 'none' }}
              disabled={loading}
            />
          </label>
        </div>
      </BottomSheet>

      {/* Settings Bottom Sheet */}
      <BottomSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
      >
        <div className="quick-menu-options">
          <button
            className="quick-menu-option"
            onClick={() => setDarkMode(!darkMode)}
          >
            <span className="quick-menu-icon">{darkMode ? '☼' : '☾'}</span>
            <span className="quick-menu-label">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </BottomSheet>

      {/* Player indicator removed - access via FAB menu */}

      {/* Player Info Bottom Sheet */}
      <BottomSheet
        visible={showPlayerInfo}
        onClose={() => setShowPlayerInfo(false)}
        title="Player Details"
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
        <div style={{ height: '1.5rem' }} />
        <PlayerInfoMobile
          playerNumber={2}
          playerName={player2Name}
          permanent={gameState.player2_permanent}
          completed={gameState.player2_completed}
          isActive={currentPlayer === 2}
          columnLengths={gameState.column_lengths}
          setPlayerName={setPlayer2Name}
        />
      </BottomSheet>

      {/* Main Game - Full Screen Layout */}
      <main className="mobile-game-fullscreen">
        {/* Game Board - Scaled to fit */}
        <div className="mobile-board-scaled">
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

        {/* Compact Controls - Inline */}
        {!gameState.game_over && (
          <div className="mobile-controls-compact">
            {/* Dice - Inline, Small */}
            <div className="mobile-dice-inline">
              {(lastDice || gameState.current_dice) ? (
                <div className="dice-mini-grid">
                  {(lastDice || gameState.current_dice).map((value, idx) => (
                    <div key={idx} className="die-mini">{value}</div>
                  ))}
                </div>
              ) : (
                <div className="dice-placeholder">🎲</div>
              )}
            </div>

            {/* Pairings - Compact Grid */}
            {hasPairings && (
              <div className="mobile-pairings-compact">
                {gameState.available_pairings.map((pairing, index) => {
                  const validIdx = gameState.valid_pairings?.findIndex(
                    vp => vp[0] === pairing[0] && vp[1] === pairing[1]
                  ) ?? -1
                  const isValid = validIdx >= 0
                  const isChosen = gameState.last_chosen_pairing_index === validIdx

                  return (
                    <button
                      key={index}
                      className={`pairing-compact ${isValid ? 'valid' : 'invalid'} ${isChosen ? 'chosen' : ''}`}
                      onClick={() => isValid && !isChosen && !gameState.is_bust && selectSum(validIdx, null)}
                      disabled={!isValid || isChosen || gameState.is_bust}
                    >
                      {pairing[0]}+{pairing[1]}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Action Buttons - Compact */}
            <div className="mobile-actions-compact">
              <button
                className="btn-compact btn-roll"
                onClick={rollDice}
                disabled={!(canRollPlayer1 || canRollPlayer2) || loading}
              >
                ROLL
              </button>
              <button
                className="btn-compact btn-stop"
                onClick={stopTurn}
                disabled={!(canStopPlayer1 || canStopPlayer2) || loading}
              >
                STOP
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bust Probability - Centered Popup */}
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
              <h3>🧠 Bust Probability</h3>
              <div className="popup-content">
                {/* Simple probability display */}
                <div className="prob-simple">
                  <div className="prob-label">Current bust chance:</div>
                  <div className="prob-value">{Math.round((gameState.bust_probability || 0) * 100)}%</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Single FAB - All Actions */}
      {!gameState.game_over && (
        <FloatingActionButton
          icon="⋮"
          onClick={() => setShowQuickMenu(true)}
          position={{ bottom: 10, right: 10 }}
          ariaLabel="Open menu"
        />
      )}

      {/* Quick Menu Bottom Sheet */}
      <BottomSheet
        visible={showQuickMenu}
        onClose={() => setShowQuickMenu(false)}
        title="Menu"
      >
        <div className="quick-menu-options">
          <button
            className="quick-menu-option"
            onClick={() => {
              setShowQuickMenu(false)
              setShowPlayerInfo(true)
            }}
          >
            <span className="quick-menu-icon">👥</span>
            <span className="quick-menu-label">Player Info</span>
          </button>

          <button
            className="quick-menu-option"
            onClick={() => {
              setShowQuickMenu(false)
              setShowProbSidebar(true)
            }}
          >
            <span className="quick-menu-icon">🧠</span>
            <span className="quick-menu-label">Bust Probability</span>
          </button>

          {gameState.can_undo && (
            <button
              className="quick-menu-option"
              onClick={() => {
                setShowQuickMenu(false)
                handleUndo()
              }}
            >
              <span className="quick-menu-icon">↶</span>
              <span className="quick-menu-label">Undo</span>
            </button>
          )}

          {gameState.can_redo && (
            <button
              className="quick-menu-option"
              onClick={() => {
                setShowQuickMenu(false)
                handleRedo()
              }}
            >
              <span className="quick-menu-icon">↷</span>
              <span className="quick-menu-label">Redo</span>
            </button>
          )}

          <button
            className="quick-menu-option"
            onClick={() => {
              setShowQuickMenu(false)
              setShowGameMenu(true)
            }}
          >
            <span className="quick-menu-icon">☰</span>
            <span className="quick-menu-label">Game Menu</span>
          </button>

          <button
            className="quick-menu-option"
            onClick={() => {
              setShowQuickMenu(false)
              setShowSettings(true)
            }}
          >
            <span className="quick-menu-icon">⚙</span>
            <span className="quick-menu-label">Settings</span>
          </button>
        </div>
      </BottomSheet>

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
