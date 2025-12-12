import React from 'react'
import './BustProbability.css'

const BustProbability = ({ gameState, visible }) => {
  if (!gameState || !visible) return null

  // Helper function to calculate probability of rolling specific sums
  const calculateProbabilities = () => {
    const activeRunners = gameState.active_runners || []
    const currentPlayer = gameState.current_player
    const completedColumns = currentPlayer === 1
      ? gameState.player1_completed || []
      : gameState.player2_completed || []

    // All possible sums from 2d6
    const allSums = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

    // Number of ways to roll each sum with 2d6
    const waysToRoll = {
      2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6,
      8: 5, 9: 4, 10: 3, 11: 2, 12: 1
    }

    // Categorize columns
    const availableColumns = allSums.filter(s =>
      !completedColumns.includes(s) &&
      (activeRunners.includes(s) || activeRunners.length < 3)
    )

    const completedSums = completedColumns
    const unavailableNewColumns = allSums.filter(s =>
      !completedColumns.includes(s) &&
      !activeRunners.includes(s) &&
      activeRunners.length >= 3
    )

    // Calculate all possible outcomes when rolling 4 dice
    // We'll sample the probability space
    let totalOutcomes = 0
    let atLeastOneValidPairing = 0
    let allCompleted = 0
    let allUnavailable = 0
    let continuesActive = 0

    // Iterate through all possible 4-dice rolls (6^4 = 1296 outcomes)
    for (let d1 = 1; d1 <= 6; d1++) {
      for (let d2 = 1; d2 <= 6; d2++) {
        for (let d3 = 1; d3 <= 6; d3++) {
          for (let d4 = 1; d4 <= 6; d4++) {
            totalOutcomes++
            const dice = [d1, d2, d3, d4]

            // Generate all possible pairings
            const pairings = [
              [dice[0] + dice[1], dice[2] + dice[3]],
              [dice[0] + dice[2], dice[1] + dice[3]],
              [dice[0] + dice[3], dice[1] + dice[2]]
            ]

            // Check if any pairing is valid
            let hasValidPairing = false
            let hasActiveColumn = false
            let onlyCompleted = true
            let onlyUnavailable = true

            for (const [sum1, sum2] of pairings) {
              const sum1Available = availableColumns.includes(sum1)
              const sum2Available = availableColumns.includes(sum2)

              if (sum1Available || sum2Available) {
                hasValidPairing = true
                onlyCompleted = false
                onlyUnavailable = false
              }

              if (sum1Available && sum2Available) {
                // Both available, check if continues active
                if (activeRunners.includes(sum1) || activeRunners.includes(sum2)) {
                  hasActiveColumn = true
                }
              } else if (sum1Available && activeRunners.includes(sum1)) {
                hasActiveColumn = true
              } else if (sum2Available && activeRunners.includes(sum2)) {
                hasActiveColumn = true
              }

              // Check if this pairing only has completed columns
              if (!completedSums.includes(sum1) || !completedSums.includes(sum2)) {
                if (sum1Available || sum2Available) {
                  onlyCompleted = false
                }
              }
            }

            // Check if all pairings are unavailable
            let allPairingsUnavailable = true
            for (const [sum1, sum2] of pairings) {
              if (availableColumns.includes(sum1) || availableColumns.includes(sum2)) {
                allPairingsUnavailable = false
                break
              }
            }

            if (hasValidPairing) atLeastOneValidPairing++
            if (hasActiveColumn) continuesActive++
            if (allPairingsUnavailable && pairings.every(([s1, s2]) =>
              completedSums.includes(s1) && completedSums.includes(s2)
            )) {
              allCompleted++
            }
            if (allPairingsUnavailable) allUnavailable++
          }
        }
      }
    }

    return {
      bustProb: ((totalOutcomes - atLeastOneValidPairing) / totalOutcomes * 100).toFixed(1),
      safeProb: (atLeastOneValidPairing / totalOutcomes * 100).toFixed(1),
      continuesActiveProb: (continuesActive / totalOutcomes * 100).toFixed(1),
      allCompletedProb: (allCompleted / totalOutcomes * 100).toFixed(1),
      allUnavailableProb: (allUnavailable / totalOutcomes * 100).toFixed(1),
      activeRunners,
      completedColumns,
      availableColumns,
      unavailableNewColumns
    }
  }

  const probs = calculateProbabilities()

  return (
    <div className="bust-probability-sidebar">
      <div className="bust-prob-header">
        <h3>Bust Probability Analysis</h3>
      </div>

      <div className="bust-prob-content">
        {/* Main Probabilities */}
        <div className="prob-section main-probs">
          <div className="prob-item highlight">
            <div className="prob-label">Bust Probability</div>
            <div className="prob-value bust">{probs.bustProb}%</div>
            <div className="prob-desc">No valid moves available</div>
          </div>

          <div className="prob-item highlight">
            <div className="prob-label">Safe Probability</div>
            <div className="prob-value safe">{probs.safeProb}%</div>
            <div className="prob-desc">At least one valid move</div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="prob-section">
          <h4>Breakdown</h4>

          <div className="prob-item">
            <div className="prob-label">Continues Active Column</div>
            <div className="prob-value">{probs.continuesActiveProb}%</div>
            <div className="prob-desc">
              Advances column{probs.activeRunners.length !== 1 ? 's' : ''}: {probs.activeRunners.join(', ') || 'None'}
            </div>
          </div>

          {probs.completedColumns.length > 0 && (
            <div className="prob-item">
              <div className="prob-label">All Pairings Completed</div>
              <div className="prob-value warning">{probs.allCompletedProb}%</div>
              <div className="prob-desc">
                Only rolls completed column{probs.completedColumns.length !== 1 ? 's' : ''}: {probs.completedColumns.join(', ')}
              </div>
            </div>
          )}

          {probs.unavailableNewColumns.length > 0 && (
            <div className="prob-item">
              <div className="prob-label">All Pairings Unavailable</div>
              <div className="prob-value warning">{probs.allUnavailableProb}%</div>
              <div className="prob-desc">
                Would need 4th runner or hit completed
              </div>
            </div>
          )}
        </div>

        {/* Current State */}
        <div className="prob-section state-info">
          <h4>Current State</h4>
          <div className="state-item">
            <span className="state-label">Active Columns:</span>
            <span className="state-value">{probs.activeRunners.length}/3</span>
          </div>
          {probs.activeRunners.length > 0 && (
            <div className="state-list">
              {probs.activeRunners.map(col => (
                <span key={col} className="state-chip active">{col}</span>
              ))}
            </div>
          )}

          {probs.completedColumns.length > 0 && (
            <>
              <div className="state-item">
                <span className="state-label">Completed:</span>
                <span className="state-value">{probs.completedColumns.length}</span>
              </div>
              <div className="state-list">
                {probs.completedColumns.map(col => (
                  <span key={col} className="state-chip completed">{col}</span>
                ))}
              </div>
            </>
          )}

          {probs.unavailableNewColumns.length > 0 && (
            <>
              <div className="state-item">
                <span className="state-label">Locked (need 4th):</span>
                <span className="state-value">{probs.unavailableNewColumns.length}</span>
              </div>
              <div className="state-list">
                {probs.unavailableNewColumns.map(col => (
                  <span key={col} className="state-chip locked">{col}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Explanation */}
        <div className="prob-section explanation">
          <h4>How It Works</h4>
          <ul>
            <li><strong>Bust:</strong> All dice pairings lead to completed or unavailable columns</li>
            <li><strong>Active:</strong> Currently advancing {probs.activeRunners.length} runner{probs.activeRunners.length !== 1 ? 's' : ''}</li>
            {probs.activeRunners.length >= 3 && (
              <li><strong>Max runners:</strong> Cannot start new columns (3/3 active)</li>
            )}
            <li><strong>Calculation:</strong> Based on all 1,296 possible 4-dice outcomes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default BustProbability
