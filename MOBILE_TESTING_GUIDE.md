# Mobile Version Testing Guide

## ⚠️ Important: Clear Your Cache!

If you're seeing the old layout, you need to force a refresh:

### Steps to See New Mobile Layout:

1. **Stop any running servers:**
   ```bash
   # Press Ctrl+C in any terminal running the mobile version
   ```

2. **Clear the build cache:**
   ```bash
   cd frontend
   rm -rf dist-mobile node_modules/.vite
   ```

3. **Start fresh:**
   ```bash
   ./play-mobile.sh
   ```

4. **In your browser:**
   - Press **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)
   - Or: Open DevTools (F12) → Network tab → Check "Disable cache"
   - Or: Clear browser cache manually

---

## ✅ What You Should See

### Header
- **Just the title** "CAN'T STOP!" centered
- **NO** hamburger (☰), brain (🧠), or settings (⚙) buttons
- Header should hide when you scroll down, show when scrolling up

### Player Indicator
- Compact bar below header
- Shows: "Player 1 2/3 vs Player 2 1/3"
- Current player highlighted with purple background
- **Tap it** to see full player details in a bottom sheet

### Floating Action Buttons (FABs)
You should see circular purple buttons:
- **Bottom-right**: ⋮ (menu) - always visible
- **Bottom-left**: ↶ (undo) - only when undo available
- **Bottom-left**: ↷ (redo) - only when redo available

### Quick Menu
Tap the ⋮ FAB to open a bottom sheet with:
- 🧠 Bust Probability
- ☰ Game Menu
- ⚙ Settings

### Long-Press Preview
**Hold** a pairing card for 500ms:
- Card pulses with purple border
- "👁 Preview" badge appears
- Hint dots show on board
- Phone vibrates (if supported)

**Quick tap** still executes immediately

---

## 🐛 Troubleshooting

### Problem: Still seeing old layout

**Solution 1: Hard refresh**
```bash
# In browser, press:
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

**Solution 2: Clear Vite cache**
```bash
cd frontend
rm -rf .vite
npm run dev:mobile
```

**Solution 3: Clear everything**
```bash
cd frontend
rm -rf dist-mobile node_modules/.vite
npm run dev:mobile
```

**Solution 4: Try incognito/private mode**
- Open browser in incognito/private mode
- Go to http://localhost:5174

### Problem: FABs not showing

Check console (F12) for errors. The FABs require:
- FloatingActionButton component
- Framer Motion library
- Proper imports in AppMobile.jsx

### Problem: Bottom sheets not working

Check console for errors. Bottom sheets require:
- BottomSheet component
- Framer Motion library
- AnimatePresence wrapper

### Problem: Long-press not working

- Make sure you're holding for at least 500ms
- Check console for errors
- useLongPress hook must be imported
- PairingSelectorMobile must be updated

---

## 📱 Testing Checklist

### Layout
- [ ] Header is centered with just title
- [ ] No menu buttons in header
- [ ] Player indicator shows both players
- [ ] FAB menu button (⋮) visible bottom-right
- [ ] Board takes up most of screen

### Interactions
- [ ] Scroll down → header hides
- [ ] Scroll up → header shows
- [ ] Tap player indicator → bottom sheet opens
- [ ] Swipe down on sheet → closes
- [ ] Tap ⋮ FAB → quick menu opens
- [ ] Tap menu option → respective modal opens
- [ ] Undo FAB appears when can undo
- [ ] Redo FAB appears when can redo

### Long-Press Preview
- [ ] Hold pairing card → preview activates after 500ms
- [ ] Card shows purple pulsing border
- [ ] "👁 Preview" badge appears
- [ ] Hint dots appear on board
- [ ] Release → preview disappears
- [ ] Quick tap → executes immediately

### Modals
- [ ] Game Menu uses bottom sheet
- [ ] Settings uses bottom sheet
- [ ] Player info uses bottom sheet
- [ ] All sheets can be swiped down
- [ ] Backdrop click closes sheet

---

## 🎨 Visual Differences from Desktop

| Element | Desktop | Mobile |
|---------|---------|--------|
| Header | Full with buttons | Just title |
| Menu Access | Top buttons | FAB → bottom sheet |
| Player Info | Sidebars | Compact bar + sheet |
| Undo/Redo | On board | FABs bottom-left |
| Hover Preview | Mouse hover | Long-press (500ms) |
| Settings | Dropdown | Bottom sheet |
| Game Menu | Dropdown | Bottom sheet |

---

## 🔍 Debug Mode

If nothing works, check the browser console:

```javascript
// Open DevTools (F12) → Console
// Check for errors like:
// ❌ "Cannot find module 'FloatingActionButton'"
// ❌ "useLongPress is not a function"
// ❌ "BottomSheet is not defined"
```

If you see these errors, the build might not have picked up the new files. Try:
```bash
cd frontend
rm -rf dist-mobile
npm run build:mobile
npm run preview:mobile
```

---

## 📊 Success Indicators

You'll know it's working when:

1. ✅ You see only title in header (no buttons)
2. ✅ Purple FAB (⋮) in bottom-right corner
3. ✅ Compact player bar you can tap
4. ✅ Long-press on pairing shows "👁 Preview"
5. ✅ Tapping ⋮ opens a bottom sheet menu

---

## 🆘 Still Not Working?

If after all this you still see the old layout:

1. Check you're on the right URL: **http://localhost:5174** (not 5173 or 3000)
2. Verify the file was actually updated:
   ```bash
   grep "PlayerIndicator" frontend/src/AppMobile.jsx
   # Should show imports and usage
   ```
3. Check build output:
   ```bash
   npm run build:mobile
   # Should complete without errors
   ```
4. Try a different browser
5. Check if service worker is caching (disable in DevTools)

---

**Last updated**: 2025-12-13
