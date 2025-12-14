import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLongPress } from '../../hooks/useLongPress'
import './DiceAreaNew.css'

function DiceAreaNew({
  dice,
  canRoll,
  canStop,
  onRoll,
  onStop,
  onPairingChange,
  loading
}) {
  const [isRolling, setIsRolling] = useState(false)
  const [selectedDice, setSelectedDice] = useState([])
  const [pairing, setPairing] = useState(null) // {first: [0,1], second: [2,3]}
  const [diceRotations, setDiceRotations] = useState([0, 0, 0, 0])
  const containerRef = useRef(null)
  const [touchStart, setTouchStart] = useState(null)

  // Generate random rotations on dice change
  useEffect(() => {
    if (dice) {
      setDiceRotations([
        Math.random() * 20 - 10,
        Math.random() * 20 - 10,
        Math.random() * 20 - 10,
        Math.random() * 20 - 10
      ])
    }
  }, [dice])

  // Long press handlers for rolling
  const longPressHandlers = useLongPress(
    () => {
      if (canRoll && !loading) {
        // Vibrate feedback
        if (navigator.vibrate) {
          navigator.vibrate(30)
        }
        handleRoll()
      }
    },
    {
      threshold: 800, // 800ms long press to roll
      onStart: () => {
        // Visual feedback that long press started
        if (canRoll) {
          // Could add a progress indicator here
        }
      }
    }
  )

  const handleRoll = async () => {
    setIsRolling(true)
    setPairing(null)
    setSelectedDice([])
    await onRoll()
    setTimeout(() => setIsRolling(false), 1500)
  }

  // Touch handlers for slide-to-pair
  const handleTouchStart = (e, index) => {
    if (!dice || isRolling || !canRoll) return
    setTouchStart({ index, x: e.touches[0].clientX, y: e.touches[0].clientY })
    setSelectedDice([index])
  }

  const handleTouchMove = (e) => {
    if (!touchStart || isRolling) return

    const touch = e.touches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    const dieElement = element?.closest('[data-die-index]')

    if (dieElement) {
      const targetIndex = parseInt(dieElement.dataset.dieIndex)
      if (targetIndex !== touchStart.index && !selectedDice.includes(targetIndex)) {
        // User dragged to another die - create pairing
        const firstPair = [touchStart.index, targetIndex].sort()
        const remaining = [0, 1, 2, 3].filter(i => !firstPair.includes(i))
        const newPairing = {
          first: firstPair,
          second: remaining
        }
        setPairing(newPairing)
        setSelectedDice([...firstPair])

        // Notify parent of pairing change
        if (dice) {
          const sum1 = dice[firstPair[0]] + dice[firstPair[1]]
          const sum2 = dice[remaining[0]] + dice[remaining[1]]
          onPairingChange?.({ pairing: newPairing, sums: [sum1, sum2] })
        }

        // Vibrate feedback
        if (navigator.vibrate) {
          navigator.vibrate(10)
        }
      }
    }
  }

  const handleTouchEnd = () => {
    setTouchStart(null)
    // Keep pairing selected, don't clear it
  }

  const renderDie = (value, index) => {
    const isPaired = pairing && (
      pairing.first.includes(index) || pairing.second.includes(index)
    )
    const pairGroup = pairing?.first.includes(index) ? 'first' :
                      pairing?.second.includes(index) ? 'second' : null

    const positions = getDotPositions(value)

    // Calculate position offset for paired dice
    let offsetX = 0
    let offsetY = 0
    if (pairing) {
      if (pairing.first.includes(index)) {
        // Move first pair closer together
        if (index === pairing.first[0]) offsetX = 5
        if (index === pairing.first[1]) offsetX = -5
      } else {
        // Move second pair closer together
        if (index === pairing.second[0]) offsetX = 5
        if (index === pairing.second[1]) offsetX = -5
      }
    }

    return (
      <motion.div
        key={index}
        className={`die-container ${isPaired ? `paired paired-${pairGroup}` : ''}`}
        data-die-index={index}
        onTouchStart={(e) => handleTouchStart(e, index)}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        animate={{
          rotate: diceRotations[index],
          x: offsetX,
          y: offsetY
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20
        }}
      >
        <motion.div
          className={`die ${isRolling ? 'rolling' : ''} ${isPaired ? 'paired' : ''}`}
          animate={isRolling ? {
            rotate: [0, 360, 720, 1080],
            scale: [1, 1.1, 1, 0.95, 1]
          } : {}}
          transition={isRolling ? {
            duration: 1.2,
            ease: [0.43, 0.13, 0.23, 0.96] // Fast start, slow end
          } : {}}
        >
          {positions.map((pos, i) => (
            <div
              key={i}
              className="die-dot"
              style={{ left: `${pos[0]}%`, top: `${pos[1]}%` }}
            />
          ))}
        </motion.div>
      </motion.div>
    )
  }

  const getDotPositions = (value) => {
    const dotPatterns = {
      1: [[50, 50]],
      2: [[25, 25], [75, 75]],
      3: [[25, 25], [50, 50], [75, 75]],
      4: [[25, 25], [25, 75], [75, 25], [75, 75]],
      5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
      6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]]
    }
    return dotPatterns[value] || []
  }

  return (
    <div className="dice-area-new">
      <div className="dice-grid-container" ref={containerRef}>
        {!dice || dice.length === 0 ? (
          <div className="dice-placeholder" {...longPressHandlers}>
            <div className="dice-placeholder-text">Long tap to roll</div>
          </div>
        ) : (
          <div className="dice-grid" {...(canRoll ? longPressHandlers : {})}>
            {dice.map((value, index) => renderDie(value, index))}
          </div>
        )}
      </div>

      {/* Stop button */}
      <AnimatePresence>
        {canStop && (
          <motion.button
            className="stop-btn"
            onClick={onStop}
            disabled={loading}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            STOP
          </motion.button>
        )}
      </AnimatePresence>

      {/* Rolling indicator */}
      {isRolling && (
        <div className="rolling-overlay">
          <div className="rolling-text">Rolling...</div>
        </div>
      )}

      {/* Hint text */}
      {!pairing && dice && dice.length > 0 && canRoll && !isRolling && (
        <div className="dice-hint">Slide across two dice to pair them</div>
      )}
    </div>
  )
}

function getDotPositions(value) {
  const dotPatterns = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [25, 75], [75, 25], [75, 75]],
    5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
    6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]]
  }
  return dotPatterns[value] || []
}

export default DiceAreaNew
