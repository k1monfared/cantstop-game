import { useCallback, useRef } from 'react'

/**
 * Custom hook for detecting long press gestures
 * @param {Function} callback - Function to call when long press is detected
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Time in ms to trigger long press (default: 500)
 * @param {Function} options.onStart - Called when touch/click starts
 * @param {Function} options.onFinish - Called when long press ends
 * @param {Function} options.onCancel - Called when it was just a tap (not long press)
 * @returns {Object} Event handlers to spread on element
 */
export function useLongPress(callback, options = {}) {
  const {
    threshold = 500,
    onStart,
    onFinish,
    onCancel
  } = options

  const timeout = useRef()
  const target = useRef()
  const isLongPress = useRef(false)

  const start = useCallback((event) => {
    // Prevent text selection on long press
    event.preventDefault?.()

    isLongPress.current = false
    target.current = event.target

    onStart?.()

    timeout.current = setTimeout(() => {
      isLongPress.current = true
      callback(event)
    }, threshold)
  }, [callback, threshold, onStart])

  const clear = useCallback((event, shouldCancel = false) => {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }

    if (isLongPress.current) {
      onFinish?.()
    } else if (shouldCancel || !isLongPress.current) {
      onCancel?.()
    }

    isLongPress.current = false
  }, [onFinish, onCancel])

  const handleTouchEnd = useCallback((event) => {
    clear(event, false)
  }, [clear])

  const handleTouchCancel = useCallback((event) => {
    clear(event, true)
  }, [clear])

  const handleMouseUp = useCallback((event) => {
    clear(event, false)
  }, [clear])

  const handleMouseLeave = useCallback((event) => {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }
    isLongPress.current = false
  }, [])

  return {
    onTouchStart: start,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    onMouseDown: start, // For desktop testing
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
  }
}
