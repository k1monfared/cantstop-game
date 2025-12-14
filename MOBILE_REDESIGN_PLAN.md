# Can't Stop - Mobile Redesign Plan

## Executive Summary
Transform the mobile version from a shrunk-down desktop view into a true mobile-first experience, optimized for touch interaction, screen real estate, and mobile UX patterns.

---

## Core Principles

1. **Touch-First**: All interactive elements minimum 44x44px (Apple HIG standard)
2. **Screen Real Estate**: Board is the hero - everything else supports it
3. **Progressive Disclosure**: Hide what's not needed, reveal on demand
4. **Reuse Logic**: Import and wrap desktop components, don't recreate
5. **Gesture-Friendly**: Swipe, tap, long-press where appropriate
6. **One-Handed Use**: Key actions accessible with thumb

---

## Layout Strategy

### Screen Orientation
- **Primary**: Portrait (vertical phone in hand)
- **Support**: Landscape (tablets, phones rotated)
- **Implementation**: CSS media queries + orientation API

### Z-Index Hierarchy (top to bottom)
1. Modals/Overlays (z-index: 1000+)
2. Top bar (z-index: 100)
3. Fixed bottom controls (z-index: 50)
4. Game board (z-index: 1)
5. Background (z-index: 0)

---

## Component-by-Component Plan

### 1. Top Bar (Collapsible Header)

**Current State**: Always visible, takes valuable space

**New Design**:
```
┌─────────────────────────────┐
│ ☰  CAN'T STOP!      🧠  ⚙  │ ← Compact, sticky
└─────────────────────────────┘
```

**Behavior**:
- **Default**: Visible
- **On scroll down**: Slide up and hide
- **On scroll up**: Slide down and show
- **On tap top 20% of screen**: Force show

**Changes**:
- Reduce title from "CAN'T STOP!!" to "CAN'T STOP!"
- Smaller font (1.25rem → 1rem)
- Height: 50px → 44px
- Add scroll listener in AppMobile.jsx

**Implementation**:
```jsx
const [headerVisible, setHeaderVisible] = useState(true)
const [lastScrollY, setLastScrollY] = useState(0)

useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY
    setHeaderVisible(currentScrollY < lastScrollY || currentScrollY < 50)
    setLastScrollY(currentScrollY)
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
}, [lastScrollY])
```

---

### 2. Player Info (Current Player Indicator)

**Current State**: Takes up space, shows too much info

**New Design**:
```
┌─────────────────────────────┐
│  [P1: Alice 2/3] vs [P2: Bob 1/3]  │ ← Tap to expand
└─────────────────────────────┘
     ↓ (tap)
┌─────────────────────────────┐
│  🏆 Player Details          │
│  ┌───────────────────────┐  │
│  │ Alice                 │  │
│  │ ✓ Column 7, 8        │  │
│  │ Progress: 2/3         │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Bob                   │  │
│  │ ✓ Column 9           │  │
│  │ Progress: 1/3         │  │
│  └───────────────────────┘  │
│  [Close]                    │
└─────────────────────────────┘
```

**Behavior**:
- **Compact view** (always visible):
  - Show player names (abbreviated if long)
  - Show completed count (2/3)
  - Highlight current player with color/bold
  - Height: 36px

- **Expanded view** (bottom sheet):
  - Slide up from bottom on tap
  - Show full PlayerInfoMobile components
  - Show progress bars
  - Swipe down or tap outside to dismiss
  - Semi-transparent backdrop

**Changes**:
- Replace current `.mobile-current-player` with compact indicator
- Move detailed info into a bottom sheet modal
- Add swipe-down gesture to close

---

### 3. Game Board (The Hero)

**Current State**: Horizontal scroll, not optimized for mobile viewport

**New Design - Portrait**:
```
┌─────────────────────────────┐
│  2  3  4  5  6  7  8  9 ... │ ← Horizontally scrollable
│ ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐    │    if needed, or scale to fit
│ │▓│ │▓│ │ │○│○│ │▓│ │▓│    │
│ │▓│ │▓│●│ │○│○│●│▓│ │▓│    │ ○ = Temp
│ │▓│●│▓│●│●│ │ │●│▓│●│▓│    │ ● = Permanent
│ └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘    │ ▓ = Completed
└─────────────────────────────┘
```

**New Design - Landscape**:
```
┌──────────────────────────────────────┐
│  All columns visible, no scroll      │
│  Wider layout, more breathing room   │
└──────────────────────────────────────┘
```

**Behavior**:
- **Portrait**:
  - Auto-scale to fit width if possible
  - Horizontal scroll if needed (snap to columns)
  - Column width: Minimum 40px, maximum 60px

- **Landscape**:
  - All columns visible
  - Use full width
  - Larger touch targets

**Changes**:
- Add dynamic column width calculation
- Implement snap scrolling
- Add touch feedback (haptic if available)
- Larger column numbers (easier to read)
- Better highlighting for hovered sums

**Undo/Redo Buttons**:
- **Current**: Top of board
- **New**: Floating Action Buttons (FAB)
  - Position: Bottom-left and bottom-right corners
  - Above the control area
  - Circular buttons, 56px diameter
  - Icons: ↶ (undo) and ↷ (redo)
  - Only show when can_undo/can_redo is true

---

### 4. Dice Roller

**Current State**: Compact but could be better

**New Design**:
```
┌─────────────────────────────┐
│  🎲 🎲 🎲 🎲               │ ← Dice (colored based on pairing)
│  [  ROLL  ] [  STOP  ]      │ ← Large buttons
└─────────────────────────────┘
```

**Behavior**:
- Fixed to bottom of screen (above pairing selector)
- Dice should be larger, easier to see
- Roll/Stop buttons:
  - Full width (each 50% width)
  - Height: 56px (larger touch target)
  - Clear disabled state
  - Haptic feedback on tap

**Changes**:
- Increase dice size
- Make buttons full-width split
- Add dice roll animation
- Color dice based on hovered pairing (reuse desktop logic)

---

### 5. Pairing Selector

**Current State**: Vertical cards, could be more compact

**New Design**:
```
┌─────────────────────────────┐
│ Choose a pairing:            │
│ ┌─────────┐ ┌─────────┐     │ ← Horizontal scroll
│ │ 7 + 8   │ │ 6 + 9   │     │    if needed
│ │  ✓      │ │  ✓      │     │
│ └─────────┘ └─────────┘     │
│     ← swipe for more →       │
└─────────────────────────────┘
```

**Behavior**:
- Horizontal scrolling cards
- Snap to each card
- Larger cards (easier to tap)
- Clear visual feedback
- For "choose-one" situations:
  - Show both sums as separate tappable areas
  - Highlight playable vs non-playable clearly

**Changes**:
- Switch from vertical to horizontal layout
- Implement snap scrolling
- Increase card size
- Better visual hierarchy

---

### 6. Brain/Probability Panel

**Current State**: Full overlay, but not optimized for mobile

**New Design - Bottom Sheet**:
```
                              ← Swipe up to expand
┌─────────────────────────────┐
│         ━━━━━               │ ← Handle bar
│  🧠 Bust Probability         │
│  ┌───────────────────────┐  │
│  │ Current: 45%          │  │
│  │ After 7+8: 62%        │  │ ← Scrollable content
│  │ After 6+9: 38%        │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
     ↓ (swipe up)
┌─────────────────────────────┐
│         ━━━━━               │
│  🧠 Bust Probability         │
│                             │
│  [Full screen content]      │ ← Expands to full screen
│  [Scrollable]               │
│  [Detailed tables]          │
│                             │
│  [Swipe down to close]      │
└─────────────────────────────┘
```

**Behavior**:
- Opens as bottom sheet (starts at ~40% screen height)
- Can swipe up to expand to full screen
- Can swipe down to minimize or close
- Tap backdrop to close
- Scrollable content
- Responds to Android back button

**Implementation**:
- Use Framer Motion for smooth animations
- Three states: closed, peek (40%), full (100%)
- Swipe threshold: 50px
- Add momentum to swipes

**Changes**:
- Replace current modal with bottom sheet
- Add swipe gestures
- Add handle bar (visual affordance)
- Implement three-state system
- Add back button handler

---

### 7. Game Menu

**Current State**: Dropdown from top

**New Design - Slide-in Drawer**:
```
┌─────────────────────────────┐
│  ✕  Game Menu               │ ← Slide from left
│                             │
│  🎮 New Game                │
│  💾 Save Game               │
│  📂 Load Game               │
│                             │
│  [Rest of screen dimmed]    │
└─────────────────────────────┘
```

**Behavior**:
- Hamburger button opens drawer
- Slides in from left
- Semi-transparent backdrop
- Tap outside to close
- Swipe left to close
- Android back button closes

**Changes**:
- Convert from dropdown to drawer
- Add slide animation
- Add swipe-to-close
- Larger menu items (easier to tap)

---

### 8. Settings Menu

**Current State**: Small dropdown

**New Design - Bottom Sheet**:
```
┌─────────────────────────────┐
│         ━━━━━               │
│  ⚙ Settings                 │
│                             │
│  🌓 Dark Mode    [Toggle]   │
│  📱 Haptics      [Toggle]   │
│  🔊 Sound        [Toggle]   │
│                             │
│  [Close]                    │
└─────────────────────────────┘
```

**Behavior**:
- Opens as bottom sheet
- Quick toggles
- Instant feedback
- Swipe down to close

---

### 9. Winner/Bust Overlays

**Current State**: Center overlay, but buttons might be small

**Changes**:
- Ensure "Play Again" / "Continue" buttons are large (minimum 56px height)
- Full-width buttons
- Clear visual hierarchy
- Celebratory animations for winner
- Sad animations for bust

---

## Gesture Inventory

| Gesture | Action | Component |
|---------|--------|-----------|
| Tap | Select pairing | PairingSelector |
| Tap | Expand player info | PlayerIndicator |
| Tap | Toggle menu/settings | TopBar buttons |
| Tap | Show header | Top 20% of screen |
| Swipe up | Expand brain panel | BrainPanel |
| Swipe down | Close brain panel | BrainPanel |
| Swipe down | Close player info | PlayerInfo |
| Swipe left | Close menu drawer | GameMenu |
| Swipe left/right | Scroll pairings | PairingSelector |
| Scroll up | Hide header | TopBar |
| Scroll down | Show header | TopBar |
| Back button | Close any modal | All modals |

---

## Touch Target Sizes

All interactive elements must meet minimum sizes:

- **Primary actions** (Roll, Stop): 56px height, full width
- **Secondary actions** (menu items): 48px height
- **Tertiary actions** (undo, redo): 44px minimum
- **Pairing cards**: 80px minimum height
- **Board columns**: 40px minimum width
- **Dice**: 48px minimum size

---

## Animation Strategy

### Header Show/Hide
- Duration: 200ms
- Easing: ease-out
- Transform: translateY

### Bottom Sheets
- Duration: 300ms
- Easing: spring (with Framer Motion)
- Transform: translateY
- Backdrop: fade in/out 200ms

### Drawers
- Duration: 250ms
- Easing: ease-in-out
- Transform: translateX
- Backdrop: fade in/out 200ms

### Dice Roll
- Duration: 600ms
- Animation: rotate + shake
- Haptic: on roll start

### Winner/Bust
- Duration: 600ms
- Animation: scale + fade
- Delay: stagger for dramatic effect

---

## Responsive Breakpoints

```css
/* Small phones */
@media (max-width: 375px) {
  /* Smaller fonts, tighter spacing */
}

/* Standard phones */
@media (min-width: 376px) and (max-width: 767px) {
  /* Base mobile styles */
}

/* Large phones / Small tablets */
@media (min-width: 768px) and (max-width: 1023px) {
  /* Slightly larger everything */
}

/* Tablets / Desktop in mobile mode */
@media (min-width: 1024px) {
  /* Desktop-like mobile (should redirect?) */
}

/* Landscape orientation */
@media (orientation: landscape) and (max-height: 600px) {
  /* Compact header, show all columns */
}
```

---

## Component Reuse Strategy

### Reuse from Desktop (via imports)
1. **BrainIconSVG** - Already reused ✓
2. **Game logic functions** - Import from desktop components
3. **Color schemes** - Import colors.css ✓
4. **Animation variants** - Import and adapt

### Create Mobile Wrappers
Instead of duplicating, wrap desktop components:

```jsx
// GameBoardMobile.jsx
import GameBoard from '../GameBoard'
import { useMobileOptimizations } from '../hooks/useMobile'

function GameBoardMobile(props) {
  const mobileProps = useMobileOptimizations(props)

  return (
    <div className="mobile-board-wrapper">
      <GameBoard {...mobileProps} />
    </div>
  )
}
```

### Shared Utilities
Create `/utils` folder:
- `gameLogic.js` - Shared game calculations
- `probabilities.js` - Bust probability calculations
- `animations.js` - Shared Framer Motion variants
- `gestures.js` - Touch gesture handlers

---

## Implementation Phases

### Phase 1: Core Layout (Foundation)
1. Implement collapsible header with scroll detection
2. Create compact player indicator + bottom sheet
3. Optimize board for mobile viewport
4. Move undo/redo to FABs

**Time estimate**: 3-4 hours
**Priority**: HIGH

### Phase 2: Controls Optimization
1. Redesign dice roller (larger, better buttons)
2. Horizontal pairing selector with snap scroll
3. Improve touch targets across all buttons

**Time estimate**: 2-3 hours
**Priority**: HIGH

### Phase 3: Modals & Gestures
1. Convert brain panel to bottom sheet with swipe
2. Convert game menu to slide-in drawer
3. Convert settings to bottom sheet
4. Add all swipe gestures
5. Add Android back button handling

**Time estimate**: 4-5 hours
**Priority**: MEDIUM

### Phase 4: Polish & Animations
1. Add haptic feedback (where supported)
2. Improve animations (dice roll, winner, bust)
3. Add loading skeletons
4. Optimize for landscape mode
5. Test on various screen sizes

**Time estimate**: 2-3 hours
**Priority**: MEDIUM

### Phase 5: Accessibility & Testing
1. Test with screen readers
2. Add ARIA labels
3. Test on real devices (iOS, Android)
4. Fix any gesture conflicts
5. Performance optimization

**Time estimate**: 2-3 hours
**Priority**: LOW (but important)

---

## Technical Considerations

### Libraries to Add
- `react-spring` or use existing `framer-motion` for gestures
- `react-use-gesture` for better touch handling (optional)
- Consider PWA manifest for install-to-homescreen

### Performance
- Use `will-change` CSS for animated elements
- Implement virtual scrolling if pairing list gets long
- Lazy load modals
- Use CSS transforms (not top/left) for animations
- Debounce scroll events

### Browser Support
- iOS Safari 14+
- Chrome Android 90+
- Samsung Internet 14+
- Test viewport units (vh vs dvh)
- Test safe-area-inset for notched phones

### Testing Checklist
- [ ] iPhone SE (small screen)
- [ ] iPhone 12/13/14 (standard)
- [ ] iPhone 14 Pro Max (large)
- [ ] Android small (Galaxy S10)
- [ ] Android large (Pixel 6)
- [ ] Tablet (iPad)
- [ ] Landscape mode
- [ ] Dark mode
- [ ] Light mode
- [ ] Slow network (loading states)

---

## File Structure

```
frontend/src/
├── components/
│   ├── mobile/
│   │   ├── GameBoardMobile.jsx        [REFACTOR]
│   │   ├── GameBoardMobile.css        [REFACTOR]
│   │   ├── DiceRollerMobile.jsx       [REFACTOR]
│   │   ├── DiceRollerMobile.css       [REFACTOR]
│   │   ├── PairingSelectorMobile.jsx  [REFACTOR]
│   │   ├── PairingSelectorMobile.css  [REFACTOR]
│   │   ├── PlayerIndicator.jsx        [NEW]
│   │   ├── PlayerIndicator.css        [NEW]
│   │   ├── BottomSheet.jsx            [NEW]
│   │   ├── BottomSheet.css            [NEW]
│   │   ├── Drawer.jsx                 [NEW]
│   │   ├── Drawer.css                 [NEW]
│   │   ├── FloatingActionButton.jsx   [NEW]
│   │   ├── FloatingActionButton.css   [NEW]
│   │   └── ...
│   └── ...
├── hooks/
│   ├── useMobile.js                   [NEW]
│   ├── useBottomSheet.js              [NEW]
│   ├── useGestures.js                 [NEW]
│   └── useScrollDirection.js          [NEW]
├── utils/
│   ├── gameLogic.js                   [NEW - extract from components]
│   ├── probabilities.js               [NEW - extract from components]
│   └── gestures.js                    [NEW]
└── AppMobile.jsx                      [REFACTOR]
```

---

## Success Metrics

The redesign is successful when:

1. ✓ All interactive elements are minimum 44x44px
2. ✓ Game board fits in viewport without awkward scrolling
3. ✓ All modals use mobile-appropriate patterns (bottom sheets, drawers)
4. ✓ Header intelligently shows/hides based on scroll
5. ✓ Brain panel is accessible and doesn't block gameplay
6. ✓ Can play entire game one-handed (portrait mode)
7. ✓ Animations feel smooth (60fps)
8. ✓ Works on real iOS and Android devices
9. ✓ No desktop code duplication (logic is shared)
10. ✓ Passes manual testing on 5+ different phone sizes

---

## ADDENDUM: Critical UX Improvements

### A1. Mobile "Hover" - Long Press Preview

**Problem**: Desktop has hover to preview pairing effects on board. Mobile has no hover.

**Solution**: Long Press Gesture

**How it works**:
```
User Action                    Visual Feedback
──────────────────────────────────────────────
Tap pairing card          →    Select & execute (current behavior)

Long press (500ms+)       →    Preview mode:
hold on pairing card           - Show hint dots on board
                               - Highlight dice with colors
                               - Visual pulse on card
                               - Haptic feedback (light)
                               - Does NOT execute

Release finger            →    Preview disappears
                               - Hint dots fade out
                               - Dice colors reset

Long press THEN slide     →    Preview updates as finger moves
to another card                - New card shows preview
                               - Like scrubbing through options
```

**Implementation**:
```jsx
// In PairingSelectorMobile.jsx
const handleTouchStart = (pairingIndex, e) => {
  const touch = e.touches[0]
  const longPressTimer = setTimeout(() => {
    // Enable preview mode
    setPreviewMode(true)
    setHoveredPairing(pairingIndex)
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10) // Subtle haptic
    }
  }, 500) // 500ms to trigger preview

  setCurrentLongPressTimer(longPressTimer)
}

const handleTouchMove = (e) => {
  if (!previewMode) return

  // Find which card is under finger now
  const touch = e.touches[0]
  const element = document.elementFromPoint(touch.clientX, touch.clientY)
  const cardIndex = element?.closest('[data-pairing-index]')?.dataset.pairingIndex

  if (cardIndex !== null) {
    setHoveredPairing(parseInt(cardIndex))
  }
}

const handleTouchEnd = (pairingIndex) => {
  clearTimeout(currentLongPressTimer)

  if (previewMode) {
    // Was long press - just cancel preview
    setPreviewMode(false)
    setHoveredPairing(null)
  } else {
    // Was short tap - execute selection
    onSelectPairing(pairingIndex)
  }
}
```

**Visual Indicators**:
- Card gets a pulsing border during long press
- "👁 Preview" text appears briefly
- Hint dots on board are semi-transparent with pulse animation
- Dice show colored outlines (same as desktop hover)

**Edge Cases**:
- If user long-presses then drags off card: cancel preview
- If user long-presses during animation: ignore
- If user long-presses on invalid pairing: show red X hints
- If user long-presses on bust state: disable preview

**CSS**:
```css
.pairing-card.previewing {
  animation: previewPulse 1s ease-in-out infinite;
  box-shadow: 0 0 0 3px var(--preview-color);
}

@keyframes previewPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.board-hint-dot.preview {
  opacity: 0.6;
  animation: hintPulse 1s ease-in-out infinite;
}
```

---

### A2. Unified Menu FAB (Replace Top Bar Buttons)

**Problem**: Top bar takes space. Multiple buttons confusing. Bottom bar suggestion needs clarification.

**Solution**: Single Floating Action Button (FAB) with radial menu

**Current Top Bar** (to remove):
```
┌─────────────────────────────┐
│ ☰  CAN'T STOP!      🧠  ⚙  │ ← Remove ☰, 🧠, ⚙
└─────────────────────────────┘
```

**New Top Bar** (minimal):
```
┌─────────────────────────────┐
│        CAN'T STOP!           │ ← Just title, no buttons
└─────────────────────────────┘
```

**New FAB** (bottom-right corner):
```
                          ┌───┐
                          │ ⋮ │ ← FAB
                          └───┘
     ↓ (tap)
              ┌─────┐
              │  🧠 │ Brain
         ┌────┴─────┴────┐
         │  ⚙  │  ☰     │ Settings / Menu
         └──────┴────────┘
     ↓ (tap any option)
Opens respective modal/sheet
```

**Alternative: Bottom Sheet Menu**
```
                          ┌───┐
                          │ ⋮ │ ← FAB
                          └───┘
     ↓ (tap)
┌─────────────────────────────┐
│         ━━━━━               │
│  Quick Menu                 │
│                             │
│  🧠 Bust Probability        │
│  ☰ Game Menu                │
│  ⚙ Settings                 │
│  ℹ️ How to Play             │
│                             │
└─────────────────────────────┘
```

**Recommended: Bottom Sheet Menu (simpler, more mobile-native)**

**Behavior**:
- FAB always visible, bottom-right corner
- Above game controls (z-index: 60)
- Icon: "⋮" (vertical dots) or "+"
- Tap to open bottom sheet menu
- Menu shows:
  - 🧠 Bust Probability
  - ☰ Game Menu (New, Save, Load)
  - ⚙ Settings (Dark mode, etc.)
  - ℹ️ How to Play (optional tutorial)
- Tap option → opens respective modal
- Tap outside or back button → closes menu

**Position**:
```css
.menu-fab {
  position: fixed;
  bottom: 180px; /* Above controls area */
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 60;
}
```

**Implementation**:
```jsx
// AppMobile.jsx
const [showQuickMenu, setShowQuickMenu] = useState(false)

<FloatingActionButton
  icon="⋮"
  onClick={() => setShowQuickMenu(true)}
  position={{ bottom: 180, right: 20 }}
/>

<AnimatePresence>
  {showQuickMenu && (
    <BottomSheet
      title="Quick Menu"
      onClose={() => setShowQuickMenu(false)}
    >
      <MenuOption
        icon="🧠"
        label="Bust Probability"
        onClick={() => {
          setShowQuickMenu(false)
          setShowProbSidebar(true)
        }}
      />
      <MenuOption
        icon="☰"
        label="Game Menu"
        onClick={() => {
          setShowQuickMenu(false)
          setShowGameMenu(true)
        }}
      />
      <MenuOption
        icon="⚙"
        label="Settings"
        onClick={() => {
          setShowQuickMenu(false)
          setShowSettings(true)
        }}
      />
    </BottomSheet>
  )}
</AnimatePresence>
```

**Game Controls Stay Visible**:
Important clarification - the bottom area with dice, roll/stop buttons, and pairing selector is NOT removed. These are core gameplay and must stay accessible. Only the menu/settings buttons move to the FAB.

**Layout After Changes**:
```
┌─────────────────────────────┐
│        CAN'T STOP!           │ ← Minimal header (collapsible)
├─────────────────────────────┤
│  Alice 2/3  vs  Bob 1/3     │ ← Player indicator (tap to expand)
├─────────────────────────────┤
│                             │
│                             │
│   [Game Board]              │ ← Main focus
│                             │
│                             │
├─────────────────────────────┤
│  🎲 🎲 🎲 🎲               │ ← Dice (always visible)
│  [  ROLL  ] [  STOP  ]      │ ← Buttons (always visible)
├─────────────────────────────┤
│  [7+8] [6+9] [5+10] →       │ ← Pairings (always visible)
└─────────────────────────────┘
        ↶              ⋮ ← FABs (undo)  (menu)
```

---

### A3. Updated Gesture Inventory

| Gesture | Duration | Action | Component |
|---------|----------|--------|-----------|
| **Tap** | <200ms | Select & execute pairing | PairingSelector |
| **Long press** | 500ms+ | Preview pairing effects | PairingSelector |
| **Long press + drag** | 500ms+ hold, then move | Preview while scrubbing | PairingSelector |
| **Tap** | <200ms | Expand player info | PlayerIndicator |
| **Tap** | <200ms | Open quick menu | FAB |
| **Swipe up** | - | Expand brain panel | BrainPanel |
| **Swipe down** | - | Close brain panel | BrainPanel |
| **Swipe down** | - | Close player info | PlayerInfo |
| **Scroll up** | - | Hide header | TopBar |
| **Scroll down** | - | Show header | TopBar |
| **Back button** | - | Close any modal | All modals |

---

### A4. Updated File Structure

```
frontend/src/
├── components/
│   ├── mobile/
│   │   ├── FloatingActionButton.jsx   [NEW]
│   │   ├── FloatingActionButton.css   [NEW]
│   │   ├── QuickMenu.jsx              [NEW]
│   │   ├── QuickMenu.css              [NEW]
│   │   ├── MenuOption.jsx             [NEW]
│   │   ├── MenuOption.css             [NEW]
│   │   └── ...
├── hooks/
│   ├── useLongPress.js                [NEW]
│   └── ...
```

---

### A5. Long Press Implementation Details

**Custom Hook**:
```jsx
// hooks/useLongPress.js
export function useLongPress(
  callback,
  options = {}
) {
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
    isLongPress.current = false
    target.current = event.target

    timeout.current = setTimeout(() => {
      isLongPress.current = true
      onStart?.()
      callback(event)
    }, threshold)
  }, [callback, threshold, onStart])

  const clear = useCallback((event) => {
    timeout.current && clearTimeout(timeout.current)

    if (isLongPress.current) {
      onFinish?.()
    } else {
      onCancel?.()
    }
  }, [onFinish, onCancel])

  return {
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchCancel: clear,
    onMouseDown: start, // Desktop testing
    onMouseUp: clear,
    onMouseLeave: clear,
  }
}
```

**Usage in PairingSelectorMobile**:
```jsx
const longPressHandlers = useLongPress(
  (e) => {
    // Long press confirmed - enter preview mode
    setPreviewMode(true)
    setHoveredPairing(pairingIndex)
    navigator.vibrate?.(10)
  },
  {
    threshold: 500,
    onStart: () => {
      // Visual feedback that long press is starting
      setPressingCard(pairingIndex)
    },
    onFinish: () => {
      // Long press ended - exit preview mode
      setPreviewMode(false)
      setHoveredPairing(null)
      setPressingCard(null)
    },
    onCancel: () => {
      // Was a short tap - execute selection
      setPressingCard(null)
      if (!gameState.is_bust) {
        onSelectSum(pairingIndex, sum)
      }
    }
  }
)

return (
  <div
    className={`pairing-card ${previewMode && pressingCard === pairingIndex ? 'previewing' : ''}`}
    {...longPressHandlers}
  >
    {/* Card content */}
  </div>
)
```

**Visual Feedback States**:
```css
/* Normal state */
.pairing-card {
  transition: all 0.2s ease;
}

/* Pressing (finger down, before long press triggers) */
.pairing-card.pressing {
  transform: scale(0.98);
  opacity: 0.9;
}

/* Previewing (long press active) */
.pairing-card.previewing {
  border: 3px solid var(--preview-color);
  animation: previewPulse 1s ease-in-out infinite;
  box-shadow: 0 0 20px var(--preview-glow);
}

/* Preview indicator text */
.pairing-card.previewing::after {
  content: '👁 Preview';
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--tooltip-bg);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  animation: fadeIn 0.2s ease-out;
}
```

---

## Open Questions

1. **Sound effects**: Add dice rolling sounds? Button taps?
2. **Haptics**: Vibrate on roll? On win? On bust? On long-press preview?
3. **PWA**: Make installable as app?
4. **Animations**: More elaborate celebrations for wins?
5. **Orientation lock**: Force portrait? Or support both equally?
6. **Accessibility**: Voice control? High contrast mode?
7. **Tutorial**: Add first-time user tutorial explaining long-press preview?

---

## Notes

- This plan prioritizes UX over perfect code - get it working, then refactor
- Test on real devices early and often - emulators lie
- Mobile users are impatient - optimize for speed
- Gestures should feel natural, not clever
- When in doubt, look at how popular mobile games handle similar UI

---

**Last Updated**: 2025-12-13
**Status**: DRAFT - Ready for implementation
