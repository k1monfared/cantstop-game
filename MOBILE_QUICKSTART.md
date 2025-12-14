# Mobile Version Quick Start Guide

## Running the Mobile Version

### Development Mode

```bash
# Start the backend (in one terminal)
cd backend
python main.py

# Start the mobile frontend (in another terminal)
cd frontend
npm run dev:mobile
```

The mobile version will be available at `http://localhost:5174`

### Testing on Your Phone

1. Make sure your phone and computer are on the same network
2. Find your computer's IP address:
   - Mac/Linux: `ifconfig` or `ip addr`
   - Windows: `ipconfig`
3. Open `http://YOUR_IP:5174` on your phone's browser

### Production Build

```bash
cd frontend
npm run build:mobile
```

Built files will be in `frontend/dist-mobile/`

## How to Play (New Gesture Controls)

### Rolling Dice
- **Long-tap** (press and hold for ~1 second) on the dice area to roll
- No roll button needed!

### Pairing Dice
- **Slide** your finger from one die to another to pair them
- The other two dice automatically pair together
- Paired dice move closer and show color highlights:
  - Purple = first pair
  - Teal = second pair

### Making Your Move
1. After pairing dice, **hint dots** appear on the board showing where pegs would move
2. **Double-tap** anywhere on the board to confirm your move
3. If both sums are the same or both playable, **tap the column** you want to choose

### Stopping Your Turn
- Tap the red **STOP** button that appears near the dice

### Menu & Settings
- Tap the **hamburger icon** (≡) in top-right corner
- Access:
  - New Game
  - Save/Load Game
  - Bust Probability
  - Dark Mode Toggle

### Undo/Redo
- Buttons in bottom-right corner
- Tap to undo or redo moves

## Orientation Support

### Landscape Mode (Recommended)
```
┌─────────────────────────────────────┐
│ Players      [BOARD]    ≡           │
│                                      │
│ 🎲🎲                        ↶ ↷     │
│ 🎲🎲                                 │
└─────────────────────────────────────┘
```

### Portrait Mode
```
┌──────────┐
│ Players  │
│    ≡     │
├──────────┤
│          │
│ [BOARD]  │
│          │
├──────────┤
│ 🎲 🎲   │
│ 🎲 🎲   │
├──────────┤
│  ↶  ↷   │
└──────────┘
```

## Troubleshooting

### Dice Won't Roll
- Make sure you're **holding** for at least 1 second (long-tap)
- Quick taps won't work - it's intentional to prevent accidental rolls

### Can't Pair Dice
- Make sure dice have been rolled first
- Try sliding more slowly and deliberately
- Ensure you're dragging from one die to another

### Double-tap Not Working
- Tap twice quickly (within 300ms)
- Try tapping in the center of the board
- Make sure you've paired dice first (hint dots should be showing)

### Board Not Filling Screen
- Try refreshing the page
- Check that you're using a modern browser
- Rotate your device to see different layouts

### Haptic Feedback Not Working
- Not all browsers/devices support haptic feedback
- iOS Safari and Chrome Android should support it
- It's a nice-to-have feature, game works fine without it

## Browser Compatibility

### Recommended
- iOS Safari 14+
- Chrome Android 90+
- Samsung Internet 14+

### Works But Not Optimal
- Desktop Chrome/Firefox (use mobile emulation mode)
- Older mobile browsers (some gestures may not work)

## Development Tips

### Testing Gestures on Desktop
- Use Chrome DevTools mobile emulation
- Enable touch simulation
- Set device type to "iPhone 12 Pro" or similar
- Reload page after enabling

### Hot Reload
- Changes to JSX/CSS auto-reload
- No need to manually refresh
- If something breaks, hard refresh (Cmd/Ctrl + Shift + R)

### Checking Console
- Open DevTools on mobile: `chrome://inspect` (Android) or Safari > Develop menu (iOS)
- Look for errors in console
- Check Network tab for API issues

## Files to Know

### Main App
- `frontend/src/AppMobileRedesigned.jsx` - Main app component
- `frontend/src/AppMobile.css` - Layout and corner styles

### Components
- `frontend/src/components/mobile/DiceAreaNew.jsx` - Dice with gestures
- `frontend/src/components/mobile/GameBoardMobile.jsx` - Board with hints
- `frontend/src/components/mobile/UnifiedMenu.jsx` - Menu system
- `frontend/src/components/mobile/IconsSVG.jsx` - All icons

### Entry Point
- `frontend/src/main-mobile.jsx` - App entry point
- `frontend/index-mobile.html` - HTML template

## Need Help?

Check the detailed implementation summary:
- `MOBILE_REDESIGN_SUMMARY.md` - Full technical documentation
- `MOBILE_REDESIGN_PLAN.md` - Original design plan (different from implementation)

Report issues at: https://github.com/k1monfared/cantstop-game/issues
