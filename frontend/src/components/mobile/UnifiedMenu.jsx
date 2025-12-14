import React from 'react'
import BottomSheet from './BottomSheet'
import {
  GameIcon,
  SaveIcon,
  LoadIcon,
  NewGameIcon,
  BrainIcon,
  SettingsIcon,
  InfoIcon,
  LightModeIcon,
  DarkModeIcon
} from './IconsSVG'

function UnifiedMenu({
  visible,
  onClose,
  darkMode,
  onNewGame,
  onSaveGame,
  onLoadGame,
  onShowBrain,
  onToggleDarkMode,
  loading
}) {
  const handleMenuItemClick = (action) => {
    onClose()
    // Small delay to let the bottom sheet close before action
    setTimeout(action, 150)
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Menu">
      <div className="unified-menu-grid">
        {/* New Game */}
        <button
          className="unified-menu-item"
          onClick={() => handleMenuItemClick(onNewGame)}
          disabled={loading}
        >
          <div className="unified-menu-icon">
            <NewGameIcon size={32} />
          </div>
          <div className="unified-menu-label">New Game</div>
        </button>

        {/* Save Game */}
        <button
          className="unified-menu-item"
          onClick={() => handleMenuItemClick(onSaveGame)}
          disabled={loading}
        >
          <div className="unified-menu-icon">
            <SaveIcon size={32} />
          </div>
          <div className="unified-menu-label">Save Game</div>
        </button>

        {/* Load Game */}
        <label className="unified-menu-item">
          <div className="unified-menu-icon">
            <LoadIcon size={32} />
          </div>
          <div className="unified-menu-label">Load Game</div>
          <input
            type="file"
            accept=".csp,.json"
            onChange={(e) => {
              onLoadGame(e)
              onClose()
            }}
            style={{ display: 'none' }}
            disabled={loading}
          />
        </label>

        {/* Brain/Probability */}
        <button
          className="unified-menu-item"
          onClick={() => handleMenuItemClick(onShowBrain)}
        >
          <div className="unified-menu-icon">
            <BrainIcon size={32} />
          </div>
          <div className="unified-menu-label">Probabilities</div>
        </button>

        {/* Dark Mode Toggle */}
        <button
          className="unified-menu-item"
          onClick={() => handleMenuItemClick(onToggleDarkMode)}
        >
          <div className="unified-menu-icon">
            {darkMode ? <LightModeIcon size={32} /> : <DarkModeIcon size={32} />}
          </div>
          <div className="unified-menu-label">
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </div>
        </button>

        {/* Settings / Info (placeholder for future) */}
        <button className="unified-menu-item" disabled>
          <div className="unified-menu-icon">
            <InfoIcon size={32} />
          </div>
          <div className="unified-menu-label">How to Play</div>
        </button>
      </div>

      {/* Credits */}
      <div className="unified-menu-credits">
        Created by{' '}
        <a
          href="https://mathweb.ucsd.edu/~kedlaya/games/cantstop.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Kiran Kedlaya
        </a>
        <br />
        Mobile interface redesigned with gesture controls
      </div>
    </BottomSheet>
  )
}

export default UnifiedMenu
