import React, { useState } from 'react'
import './BustProbability.css'

const BustProbability = ({ gameState, visible, onMouseEnter, onMouseLeave, hoveredPairing = null, hoveredSum = null, sumColorMap = {} }) => {
  const [showEVInfo, setShowEVInfo] = useState(false)
  const [showSafeInfo, setShowSafeInfo] = useState(false)

  if (!gameState || !visible) return null

  // Determine which columns are being hovered and their colors
  const getHoveredColumnsData = () => {
    if (hoveredSum !== null) {
      return [{ column: hoveredSum, color: sumColorMap[hoveredSum] }]
    } else if (hoveredPairing !== null) {
      const availablePairings = gameState.available_pairings || []
      if (hoveredPairing >= 0 && hoveredPairing < availablePairings.length) {
        const pairing = availablePairings[hoveredPairing]
        return pairing ? pairing.map(col => ({ column: col, color: sumColorMap[col] })) : []
      }
    }
    return []
  }

  const hoveredColumnsData = getHoveredColumnsData()
  const hoveredColumns = hoveredColumnsData.map(d => d.column)

  // Helper function to calculate probability of rolling specific sums
  const calculateProbabilities = (activeRunners, completedColumns) => {

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

    // Breakdown of safe outcomes
    let safeWithOneValidPairing = 0
    let safeWithTwoValidPairings = 0
    let safeWithThreeValidPairings = 0
    let safeAdvancesActiveOnly = 0
    let safeStartsNewOnly = 0
    let safeBoth = 0

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
            let validPairingCount = 0
            let advancesActive = false
            let startsNew = false

            for (const [sum1, sum2] of pairings) {
              const sum1Available = availableColumns.includes(sum1)
              const sum2Available = availableColumns.includes(sum2)
              const sum1Active = activeRunners.includes(sum1)
              const sum2Active = activeRunners.includes(sum2)

              const pairingValid = sum1Available || sum2Available
              if (pairingValid) {
                hasValidPairing = true
                validPairingCount++
                onlyCompleted = false
                onlyUnavailable = false

                // Check if this pairing advances active columns
                if ((sum1Available && sum1Active) || (sum2Available && sum2Active)) {
                  advancesActive = true
                }
                // Check if this pairing starts new columns
                if ((sum1Available && !sum1Active) || (sum2Available && !sum2Active)) {
                  startsNew = true
                }
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

            if (hasValidPairing) {
              atLeastOneValidPairing++

              // Track breakdown of safe outcomes
              if (validPairingCount === 1) safeWithOneValidPairing++
              else if (validPairingCount === 2) safeWithTwoValidPairings++
              else if (validPairingCount === 3) safeWithThreeValidPairings++

              // Track what type of moves are available
              if (advancesActive && !startsNew) safeAdvancesActiveOnly++
              else if (!advancesActive && startsNew) safeStartsNewOnly++
              else if (advancesActive && startsNew) safeBoth++
            }

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
      bustProb: ((totalOutcomes - atLeastOneValidPairing) / totalOutcomes * 100).toFixed(0),
      safeProb: (atLeastOneValidPairing / totalOutcomes * 100).toFixed(0),
      continuesActiveProb: (continuesActive / totalOutcomes * 100).toFixed(0),
      allCompletedProb: (allCompleted / totalOutcomes * 100).toFixed(0),
      allUnavailableProb: (allUnavailable / totalOutcomes * 100).toFixed(0),
      activeRunners,
      completedColumns,
      availableColumns,
      unavailableNewColumns,
      // Breakdown details
      safeOutcomes: atLeastOneValidPairing,
      totalOutcomes,
      safeWithOneValidPairing,
      safeWithTwoValidPairings,
      safeWithThreeValidPairings,
      safeAdvancesActiveOnly,
      safeStartsNewOnly,
      safeBoth
    }
  }

  const currentPlayer = gameState.current_player
  // Use ALL completed columns (from both players) since they're unavailable to everyone
  const allCompletedColumns = [
    ...(gameState.player1_completed || []),
    ...(gameState.player2_completed || [])
  ]
  const currentActiveRunners = gameState.active_runners || []

  const probs = calculateProbabilities(currentActiveRunners, allCompletedColumns)

  // Calculate probability of busting within N rolls
  // P(bust within N rolls) = 1 - P(survive N rolls)
  // P(survive N rolls) = (1 - bustProb)^N
  const bustProb = parseFloat(probs.bustProb) / 100
  const bustIn1 = (bustProb * 100).toFixed(0)
  const bustIn2 = ((1 - Math.pow(1 - bustProb, 2)) * 100).toFixed(0)
  const bustIn3 = ((1 - Math.pow(1 - bustProb, 3)) * 100).toFixed(0)

  // Calculate probabilities for relevant columns (active + potential from pairings)
  const calculateColumnProbabilities = () => {
    const activeRunners = gameState.active_runners || []
    const availablePairings = gameState.available_pairings || []
    const currentPlayer = gameState.current_player
    const completedColumns = [
      ...(gameState.player1_completed || []),
      ...(gameState.player2_completed || [])
    ]

    // Collect all relevant columns: active + columns from available pairings
    const relevantColumns = new Set(activeRunners)

    // Add columns from available pairings (potential new columns)
    availablePairings.forEach(pairing => {
      pairing.forEach(sum => {
        if (!completedColumns.includes(sum)) {
          relevantColumns.add(sum)
        }
      })
    })

    if (relevantColumns.size === 0) return []

    const permanentProgress = currentPlayer === 1
      ? gameState.player1_permanent
      : gameState.player2_permanent
    const tempProgress = gameState.temp_progress || {}
    const columnLengths = gameState.column_lengths

    return Array.from(relevantColumns).sort((a, b) => a - b).map(col => {
      const permanent = permanentProgress[col] || 0
      const temp = tempProgress[col] || 0
      const currentProgress = permanent + temp
      const totalSteps = columnLengths[col]
      const stepsRemaining = totalSteps - currentProgress
      const isActive = activeRunners.includes(col)

      // Calculate probability of advancing this column on next roll
      // Must account for completed columns and runner limits
      let advancingOutcomes = 0
      const totalOutcomes = 1296 // 6^4
      const allSums = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

      for (let d1 = 1; d1 <= 6; d1++) {
        for (let d2 = 1; d2 <= 6; d2++) {
          for (let d3 = 1; d3 <= 6; d3++) {
            for (let d4 = 1; d4 <= 6; d4++) {
              const pairings = [
                [d1 + d2, d3 + d4],
                [d1 + d3, d2 + d4],
                [d1 + d4, d2 + d3]
              ]

              // Check if any pairing allows advancing this column
              let canAdvanceThisColumn = false

              for (const [s1, s2] of pairings) {
                // Check if this pairing is playable
                const s1Completed = completedColumns.includes(s1)
                const s2Completed = completedColumns.includes(s2)
                const s1Active = activeRunners.includes(s1)
                const s2Active = activeRunners.includes(s2)

                // A sum is playable if it's not completed AND either:
                // - It's already active, OR
                // - We have room for new runners (< 3 active)
                const s1Playable = !s1Completed && (s1Active || activeRunners.length < 3)
                const s2Playable = !s2Completed && (s2Active || activeRunners.length < 3)

                // The pairing is valid if at least one sum is playable
                const pairingValid = s1Playable || s2Playable

                // Check if this valid pairing includes our target column
                if (pairingValid) {
                  if ((s1 === col && s1Playable) || (s2 === col && s2Playable)) {
                    canAdvanceThisColumn = true
                    break
                  }
                }
              }

              if (canAdvanceThisColumn) advancingOutcomes++
            }
          }
        }
      }

      const advanceProb = advancingOutcomes / totalOutcomes
      const completionProb = stepsRemaining === 0 ? 100 :
        Math.pow(advanceProb / (advanceProb + bustProb), stepsRemaining) * 100

      return {
        column: col,
        stepsRemaining,
        advanceProb: (advanceProb * 100).toFixed(0),
        completionProb: completionProb.toFixed(0),
        isActive
      }
    })
  }

  const columnProbs = calculateColumnProbabilities()

  // Calculate Expected Value (EV)
  const calculateEV = (activeRunners, tempProgress, completedColumns) => {
    // U = Unsaved progress (sum of all temp_progress)
    const U = Object.values(tempProgress).reduce((sum, val) => sum + val, 0)

    // Calculate probabilities for this state
    const stateProbs = calculateProbabilities(activeRunners, completedColumns)
    const stateBustProb = parseFloat(stateProbs.bustProb) / 100

    // Q = Expected gain if roll succeeds
    // Calculate average steps advanced per successful roll
    // Must consider ALL available columns (active + new if room), not just active runners
    let totalGain = 0
    let successOutcomes = 0
    const totalOutcomes = 1296 // 6^4

    if (activeRunners.length === 0) {
      // First roll of the turn - use the already calculated safe probability
      // Average case: start 2 columns, typically get around 2 steps
      const Q_first = 2.0 // Expected steps gained on first roll
      const P_success = parseFloat(stateProbs.safeProb) / 100
      const P_bust = stateBustProb
      const EV_first = P_success * Q_first // U = 0 on first roll
      return { EV: EV_first, U: 0, Q: Q_first, P_success, P_bust }
    }

    for (let d1 = 1; d1 <= 6; d1++) {
      for (let d2 = 1; d2 <= 6; d2++) {
        for (let d3 = 1; d3 <= 6; d3++) {
          for (let d4 = 1; d4 <= 6; d4++) {
            const pairings = [
              [d1 + d2, d3 + d4],
              [d1 + d3, d2 + d4],
              [d1 + d4, d2 + d3]
            ]

            // Find best pairing (one that advances most available columns)
            let bestGain = 0
            let hasValidPairing = false

            for (const [sum1, sum2] of pairings) {
              // A column is playable if it's not completed AND either:
              // - It's already active, OR
              // - We have room for new runners (< 3 active)
              const sum1Playable = !completedColumns.includes(sum1) &&
                                   (activeRunners.includes(sum1) || activeRunners.length < 3)
              const sum2Playable = !completedColumns.includes(sum2) &&
                                   (activeRunners.includes(sum2) || activeRunners.length < 3)

              if (sum1Playable || sum2Playable) {
                hasValidPairing = true
                // Count how many steps we'd advance (1 or 2 depending on pairing)
                const gain = (sum1Playable ? 1 : 0) + (sum2Playable ? 1 : 0)
                bestGain = Math.max(bestGain, gain)
              }
            }

            if (hasValidPairing) {
              successOutcomes++
              totalGain += bestGain
            }
          }
        }
      }
    }

    const Q = successOutcomes > 0 ? totalGain / successOutcomes : 0
    const P_success = parseFloat(stateProbs.safeProb) / 100
    const P_bust = stateBustProb

    // EV = P(success) × Q - P(bust) × U
    const EV = P_success * Q - P_bust * U

    return { EV, U, Q, P_success, P_bust }
  }

  const evData = calculateEV(currentActiveRunners, gameState.temp_progress || {}, allCompletedColumns)

  // Pre-calculate EV for each possible pairing choice
  const calculateAllConditionalEVs = () => {
    const availablePairings = gameState.available_pairings || []
    const pairingPlayability = gameState.pairing_playability || []
    const activeRunners = gameState.active_runners || []
    const tempProgress = gameState.temp_progress || {}
    // Use ALL completed columns (from both players)
    const completedColumns = [
      ...(gameState.player1_completed || []),
      ...(gameState.player2_completed || [])
    ]

    const conditionalEVs = {}

    // For each pairing, simulate making that choice and calculate EV
    availablePairings.forEach((pairing, pairingIdx) => {
      if (!pairing || pairing.length !== 2) return

      const playability = pairingPlayability[pairingIdx]
      if (!playability) return

      const [sum1, sum2] = pairing
      const sum1Playable = playability.sum1_playable && !completedColumns.includes(sum1)
      const sum2Playable = playability.sum2_playable && !completedColumns.includes(sum2)

      // If needs choice, calculate EV for each sum separately
      if (playability.needs_choice) {
        if (sum1Playable) {
          conditionalEVs[`pairing-${pairingIdx}-sum-${sum1}`] = calculateEVForChoice([sum1], activeRunners, tempProgress, completedColumns)
        }
        if (sum2Playable) {
          conditionalEVs[`pairing-${pairingIdx}-sum-${sum2}`] = calculateEVForChoice([sum2], activeRunners, tempProgress, completedColumns)
        }
      } else {
        // Both can be applied
        const columnsToAdvance = []
        if (sum1Playable) columnsToAdvance.push(sum1)
        if (sum2Playable) columnsToAdvance.push(sum2)

        if (columnsToAdvance.length > 0) {
          conditionalEVs[`pairing-${pairingIdx}`] = calculateEVForChoice(columnsToAdvance, activeRunners, tempProgress, completedColumns)
        }
      }
    })

    return conditionalEVs
  }

  // Helper function to calculate EV for a specific choice
  const calculateEVForChoice = (columnsToAdvance, activeRunners, tempProgress, completedColumns) => {
    // Simulate the move
    const newTempProgress = { ...tempProgress }
    columnsToAdvance.forEach(col => {
      newTempProgress[col] = (newTempProgress[col] || 0) + 1
    })

    const newActiveRunners = Array.from(new Set([...activeRunners, ...columnsToAdvance]))

    // Use the same calculateEV function to ensure identical logic
    return calculateEV(newActiveRunners, newTempProgress, completedColumns)
  }

  const allConditionalEVs = calculateAllConditionalEVs()

  // Look up the conditional EV based on what's being hovered
  const getConditionalEV = () => {
    if (hoveredPairing === null && hoveredSum === null) return null

    if (hoveredSum !== null && hoveredPairing !== null) {
      // Hovering over a specific sum in a pairing
      const key = `pairing-${hoveredPairing}-sum-${hoveredSum}`
      return allConditionalEVs[key] || null
    } else if (hoveredPairing !== null) {
      // Hovering over a pairing (no specific sum)
      const key = `pairing-${hoveredPairing}`
      return allConditionalEVs[key] || null
    }

    return null
  }

  const conditionalEV = getConditionalEV()

  return (
    <div
      className="bust-probability-sidebar"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bust-prob-content">
        {/* Safe Probability and EV - Side by side */}
        <div className="prob-section main-probs-row">
          {/* Safe Probability Card */}
          <div className="prob-item highlight">
            <div className="safe-header">
              <div className="prob-label">Safe Probability</div>
              <div
                className="info-button-wrapper"
                onMouseEnter={() => setShowSafeInfo(true)}
                onMouseLeave={() => setShowSafeInfo(false)}
              >
                <div className="info-button">
                  ⓘ
                </div>
                {/* Info Popup */}
                {showSafeInfo && (
                  <div
                    className="safe-info-popup"
                    onMouseEnter={() => setShowSafeInfo(true)}
                    onMouseLeave={() => setShowSafeInfo(false)}
                  >
                <div className="safe-info-header">Safe Outcome Breakdown</div>
                <div className="safe-info-summary">
                  {probs.safeOutcomes} out of {probs.totalOutcomes} dice outcomes have at least one valid pairing
                </div>

                <div className="safe-breakdown-section">
                  <div className="breakdown-subtitle">By Number of Valid Pairings</div>
                  <div className="breakdown-grid">
                    <div className="breakdown-row">
                      <span className="breakdown-label">1 valid pairing:</span>
                      <span className="breakdown-value">{probs.safeWithOneValidPairing}</span>
                      <span className="breakdown-percent">({((probs.safeWithOneValidPairing / probs.safeOutcomes) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="breakdown-row">
                      <span className="breakdown-label">2 valid pairings:</span>
                      <span className="breakdown-value">{probs.safeWithTwoValidPairings}</span>
                      <span className="breakdown-percent">({((probs.safeWithTwoValidPairings / probs.safeOutcomes) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="breakdown-row">
                      <span className="breakdown-label">3 valid pairings:</span>
                      <span className="breakdown-value">{probs.safeWithThreeValidPairings}</span>
                      <span className="breakdown-percent">({((probs.safeWithThreeValidPairings / probs.safeOutcomes) * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                </div>

                <div className="safe-breakdown-section">
                  <div className="breakdown-subtitle">By Move Type</div>
                  <div className="breakdown-grid">
                    <div className="breakdown-row">
                      <span className="breakdown-label">Active columns only:</span>
                      <span className="breakdown-value">{probs.safeAdvancesActiveOnly}</span>
                      <span className="breakdown-percent">({((probs.safeAdvancesActiveOnly / probs.safeOutcomes) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="breakdown-row">
                      <span className="breakdown-label">New columns only:</span>
                      <span className="breakdown-value">{probs.safeStartsNewOnly}</span>
                      <span className="breakdown-percent">({((probs.safeStartsNewOnly / probs.safeOutcomes) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="breakdown-row">
                      <span className="breakdown-label">Both options:</span>
                      <span className="breakdown-value">{probs.safeBoth}</span>
                      <span className="breakdown-percent">({((probs.safeBoth / probs.safeOutcomes) * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                </div>

                <div className="safe-info-note">
                  <strong>Note:</strong> Outcomes with more valid pairings give you more strategic choices. Having all 3 pairings valid is ideal!
                </div>
                  </div>
                )}
              </div>
            </div>
            <div className="prob-value safe">{probs.safeProb}%</div>
            <div className="prob-desc">At least one valid move</div>
          </div>

          {/* Expected Value Card */}
          <div className="prob-item highlight ev-card">
            <div className="ev-header">
              <div className="prob-label">Expected Value</div>
              <div
                className="info-button-wrapper"
                onMouseEnter={() => setShowEVInfo(true)}
                onMouseLeave={() => setShowEVInfo(false)}
              >
                <div className="info-button">
                  ⓘ
                </div>
                {/* Info Popup */}
                {showEVInfo && (
                  <div
                    className="ev-info-popup"
                    onMouseEnter={() => setShowEVInfo(true)}
                    onMouseLeave={() => setShowEVInfo(false)}
                  >
              <div className="ev-info-header">Expected Value Formula</div>
              <div className="ev-formula">
                <div className="formula-grid">
                  <span className="formula-part">EV</span>
                  <span className="formula-part">=</span>
                  <span className="formula-part">P(safe)</span>
                  <span className="formula-part">×</span>
                  <span className="formula-part">Q</span>
                  <span className="formula-part">-</span>
                  <span className="formula-part">P(bust)</span>
                  <span className="formula-part">×</span>
                  <span className="formula-part">U</span>

                  <span className={`formula-value-cell formula-value ${evData.EV >= 0 ? 'ev-positive' : 'ev-negative'}`}>{evData.EV.toFixed(2)}</span>
                  <span className="formula-value-cell"></span>
                  <span className="formula-value-cell formula-value">{(evData.P_success * 100).toFixed(0)}%</span>
                  <span className="formula-value-cell"></span>
                  <span className="formula-value-cell formula-value">{evData.Q.toFixed(2)}</span>
                  <span className="formula-value-cell"></span>
                  <span className="formula-value-cell formula-value">{(evData.P_bust * 100).toFixed(0)}%</span>
                  <span className="formula-value-cell"></span>
                  <span className="formula-value-cell formula-value">{evData.U}</span>
                </div>
              </div>
              <div className="ev-breakdown">
                <div className="ev-breakdown-item">
                  <span className="breakdown-label">P(safe):</span>
                  <span className="breakdown-desc">Probability of valid move</span>
                  <span className="breakdown-value">{(evData.P_success * 100).toFixed(0)}%</span>
                </div>
                <div className="ev-breakdown-item">
                  <span className="breakdown-label">Q:</span>
                  <span className="breakdown-desc">Expected gain if safe</span>
                  <span className="breakdown-value">{evData.Q.toFixed(2)} steps</span>
                </div>
                <div className="ev-breakdown-item">
                  <span className="breakdown-label">P(bust):</span>
                  <span className="breakdown-desc">Probability of busting</span>
                  <span className="breakdown-value">{(evData.P_bust * 100).toFixed(0)}%</span>
                </div>
                <div className="ev-breakdown-item">
                  <span className="breakdown-label">U:</span>
                  <span className="breakdown-desc">Progress at risk</span>
                  <span className="breakdown-value">{evData.U} steps</span>
                </div>
              </div>
              <div className="ev-interpretation">
                <strong>Interpretation:</strong>
                <p>{evData.EV > 0
                  ? 'Positive EV suggests rolling again has higher expected return.'
                  : evData.EV < 0
                    ? 'Negative EV suggests stopping now is better.'
                    : 'EV is neutral - either choice is equivalent.'
                }</p>
              </div>
                  </div>
                )}
              </div>
            </div>
            <div className="ev-value-container">
              <div className={`prob-value ev ${
                (conditionalEV ? conditionalEV.EV : evData.EV) > 0.2
                  ? 'ev-good'
                  : (conditionalEV ? conditionalEV.EV : evData.EV) < -0.2
                    ? 'ev-bad'
                    : 'ev-neutral'
              }`}>
                {conditionalEV
                  ? `${conditionalEV.EV >= 0 ? '+' : ''}${conditionalEV.EV.toFixed(2)}`
                  : `${evData.EV >= 0 ? '+' : ''}${evData.EV.toFixed(2)}`
                }
              </div>
              <div className="ev-unit-label">steps</div>
            </div>
          </div>
        </div>

        {/* Bust Risk for Next N Rolls */}
        <div className="prob-section">
          <div className="prob-subsection-title">Bust Risk</div>
          <div className="bust-progression">
            <div className="bust-risk-item">
              <span className="risk-label">Next roll:</span>
              <span className="risk-value">{bustIn1}%</span>
            </div>
            <div className="bust-risk-item">
              <span className="risk-label">Next 2 rolls:</span>
              <span className="risk-value">{bustIn2}%</span>
            </div>
            <div className="bust-risk-item">
              <span className="risk-label">Next 3 rolls:</span>
              <span className="risk-value">{bustIn3}%</span>
            </div>
          </div>
        </div>

        {/* Column Probabilities Table */}
        {columnProbs.length > 0 && (
          <div className="prob-section">
            <div className="prob-subsection-title">Column Analysis</div>
            <div className="column-table-wrapper">
              <table className="column-prob-table">
                <thead>
                  <tr>
                    <th className="metric-header"></th>
                    {columnProbs.map(col => {
                      const hoveredData = hoveredColumnsData.find(h => h.column === col.column)
                      const isHovered = hoveredData !== undefined
                      const hoverColor = hoveredData?.color || 'pair1'
                      return (
                        <th
                          key={col.column}
                          className={`column-header ${col.isActive ? 'active-column' : 'potential-column'} ${isHovered ? `hovered-column hovered-${hoverColor}` : ''}`}
                        >
                          <div className="column-number">{col.column}</div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr className="table-row">
                    <td className="metric-label">Steps left</td>
                    {columnProbs.map(col => (
                      <td key={col.column} className="metric-value">
                        {col.stepsRemaining}
                      </td>
                    ))}
                  </tr>
                  <tr className="table-row">
                    <td className="metric-label">Advance %</td>
                    {columnProbs.map(col => (
                      <td key={col.column} className="metric-value advance-value">
                        {col.advanceProb}%
                      </td>
                    ))}
                  </tr>
                  <tr className="table-row">
                    <td className="metric-label">Complete %</td>
                    {columnProbs.map(col => (
                      <td key={col.column} className="metric-value complete-value">
                        {col.completionProb}%
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BustProbability
