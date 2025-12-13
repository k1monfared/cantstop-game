# Can't Stop - Mobile Version

A completely separate, mobile-first responsive version of the Can't Stop game that adapts seamlessly from mobile to desktop.

## Features

### Mobile-First Design
- **Touch-optimized controls**: Large, tap-friendly buttons and interactive elements (minimum 44px touch targets)
- **Responsive layout**: Automatically adapts from mobile (320px+) to tablet (768px+) to desktop (1024px+)
- **Gesture support**: Touch and swipe interactions for mobile devices
- **No pull-to-refresh**: Prevents accidental page refreshes during gameplay
- **Optimized viewport**: Uses dynamic viewport height (dvh) for true full-screen on mobile

### Layout Adaptations
- **Mobile (320px - 767px)**:
  - Sticky header with compact controls
  - Vertically stacked layout
  - Horizontal scrolling game board
  - Fixed controls at bottom
  - Full-screen modals

- **Tablet (768px - 1023px)**:
  - Larger touch targets
  - More comfortable spacing
  - Enhanced grid layouts

- **Desktop (1024px+)**:
  - Max-width container for optimal viewing
  - Hover states enabled
  - Desktop-friendly interactions

### Mobile Components
All components have been rebuilt for mobile:

1. **AppMobile.jsx** - Main mobile app with responsive design
2. **GameBoardMobile** - Horizontally scrollable board
3. **DiceRollerMobile** - Large, tap-friendly dice display
4. **PairingSelectorMobile** - Touch-optimized pairing selection
5. **PlayerInfoMobile** - Compact player progress display
6. **BustProbabilityMobile** - Side panel with probability information

## Development

### Run Mobile Version in Development
```bash
cd frontend
npm run dev:mobile
```

The mobile version will run on `http://localhost:5174` (different port from desktop version).

To test on a mobile device on your local network:
1. Run `npm run dev:mobile`
2. Find your local IP address
3. Access `http://YOUR_LOCAL_IP:5174` from your mobile device

### Build Mobile Version
```bash
cd frontend
npm run build:mobile
```

This creates an optimized build in `frontend/dist-mobile/`.

### Preview Mobile Build
```bash
cd frontend
npm run preview:mobile
```

## File Structure

```
frontend/
├── src/
│   ├── AppMobile.jsx                    # Mobile main app
│   ├── AppMobile.css                    # Mobile-first responsive styles
│   ├── main-mobile.jsx                  # Mobile entry point
│   └── components/
│       └── mobile/
│           ├── GameBoardMobile.jsx      # Mobile game board
│           ├── GameBoardMobile.css
│           ├── DiceRollerMobile.jsx     # Mobile dice roller
│           ├── DiceRollerMobile.css
│           ├── PairingSelectorMobile.jsx # Mobile pairing selector
│           ├── PairingSelectorMobile.css
│           ├── PlayerInfoMobile.jsx     # Mobile player info
│           ├── PlayerInfoMobile.css
│           ├── BustProbabilityMobile.jsx # Mobile probability panel
│           └── BustProbabilityMobile.css
├── index-mobile.html                    # Mobile HTML entry point
└── vite.config.mobile.js               # Mobile Vite configuration
```

## Key Differences from Desktop Version

### Design Philosophy
- **Mobile version**: Touch-first, vertical scrolling, simplified UI
- **Desktop version**: Mouse-first, horizontal layout, detailed UI

### User Experience
- **Mobile**: Bottom sheet controls, hamburger menus, swipe gestures
- **Desktop**: Sidebars, hover states, more screen real estate

### Performance
- Mobile version uses:
  - Simplified animations (faster)
  - Touch event optimization
  - Reduced simultaneous rendering

## Deployment

### Option 1: Separate Deployment
Deploy mobile and desktop versions to different routes:
- Desktop: `https://yourdomain.com/`
- Mobile: `https://yourdomain.com/mobile/`

### Option 2: Same Build with Detection
Use a detection script to redirect mobile users to the mobile version.

### Option 3: Progressive Web App (PWA)
The mobile version is optimized for PWA deployment:
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="theme-color" content="#1a1a2e" />
```

## Browser Support

### Mobile
- iOS Safari 14+
- Chrome for Android 90+
- Samsung Internet 14+
- Firefox for Android 90+

### Desktop
- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## Testing Recommendations

### Mobile Testing
1. **Real Devices**: Test on actual iOS and Android devices
2. **Chrome DevTools**: Use device emulation mode
3. **Network Conditions**: Test on 3G/4G connections
4. **Touch**: Verify all interactions work with touch
5. **Orientation**: Test both portrait and landscape modes

### Responsive Testing
Use these viewport sizes:
- iPhone SE: 375x667
- iPhone 12/13: 390x844
- iPad: 768x1024
- iPad Pro: 1024x1366
- Desktop: 1920x1080

## CSS Variables

Both dark and light modes are supported through CSS variables:

```css
/* Dark Mode (default) */
--bg-primary: #1a1a2e
--bg-secondary: #16213e
--accent-color: #4a9eff

/* Light Mode */
--bg-primary: #f5f5f5
--bg-secondary: #fff
--accent-color: #2196f3
```

## Accessibility

- Minimum touch target size: 44px x 44px
- High contrast ratios for text
- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support (desktop)

## Performance Optimizations

1. **Lazy loading**: Components load on demand
2. **Debounced events**: Touch events are optimized
3. **CSS containment**: Layout containment for better rendering
4. **Reduced motion**: Respects user's motion preferences
5. **Efficient animations**: Using transform and opacity only

## Known Limitations

1. **Offline support**: Not yet implemented (can be added with service workers)
2. **PWA installation**: Manifest not included (can be added)
3. **Advanced probability display**: Simplified on mobile for better UX

## Future Enhancements

- [ ] Add service worker for offline play
- [ ] Add PWA manifest
- [ ] Add haptic feedback for mobile
- [ ] Add landscape mode optimization
- [ ] Add gesture controls (swipe to undo/redo)
- [ ] Add sound effects with volume control

## Contributing

When contributing to the mobile version:
1. Test on real mobile devices
2. Maintain minimum touch target sizes
3. Use mobile-first CSS (start with mobile, add media queries for larger screens)
4. Avoid hover-only interactions
5. Test with touch events, not just mouse events

## License

Same license as the main Can't Stop game project.
