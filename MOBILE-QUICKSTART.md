# Mobile Version - Quick Start Guide

## Run the Mobile Version

### Development Mode
```bash
cd frontend
npm run dev:mobile
```

The mobile version will start at: **http://localhost:5174**

### Test on Your Phone
1. Make sure your phone and computer are on the same WiFi network
2. Find your computer's local IP address:
   - **Mac/Linux**: `ifconfig` or `ip addr`
   - **Windows**: `ipconfig`
3. On your phone, navigate to: `http://YOUR_IP:5174`

Example: `http://192.168.1.100:5174`

## Build for Production

```bash
cd frontend
npm run build:mobile
```

This creates an optimized production build in `frontend/dist-mobile/`

## Preview Production Build

```bash
cd frontend
npm run preview:mobile
```

Preview will be available at: **http://localhost:4174**

## Key Features

### Mobile-First Design (320px+)
- Touch-optimized controls (44px+ touch targets)
- Horizontal scrolling game board
- Bottom sheet controls
- Compact header with hamburger menu
- Full-screen modals

### Tablet Optimized (768px+)
- Larger touch targets
- Better spacing
- Grid layouts for pairings

### Desktop Adapted (1024px+)
- Max-width container (1400px-1600px)
- Hover states
- Enhanced visuals
- Mouse-friendly interactions

## File Structure

```
Mobile Version Files:
├── frontend/
│   ├── src/
│   │   ├── AppMobile.jsx              # Main mobile app
│   │   ├── AppMobile.css              # Mobile styles
│   │   ├── main-mobile.jsx            # Entry point
│   │   └── components/mobile/         # Mobile components
│   │       ├── GameBoardMobile.jsx
│   │       ├── DiceRollerMobile.jsx
│   │       ├── PairingSelectorMobile.jsx
│   │       ├── PlayerInfoMobile.jsx
│   │       └── BustProbabilityMobile.jsx
│   ├── index-mobile.html              # HTML template
│   └── vite.config.mobile.js          # Vite config
```

## Desktop vs Mobile

The mobile version is **completely separate** from the desktop version:

| Feature | Desktop | Mobile |
|---------|---------|--------|
| Entry Point | `index.html` + `main.jsx` | `index-mobile.html` + `main-mobile.jsx` |
| Port | 5173 | 5174 |
| Layout | Sidebar layout | Vertical stacking |
| Board | Fixed grid | Horizontal scroll |
| Controls | Always visible | Bottom sheet |
| Touch Targets | Standard | 44px+ minimum |

## Common Tasks

### Switch Between Versions

**Desktop**:
```bash
npm run dev        # Port 5173
npm run build
```

**Mobile**:
```bash
npm run dev:mobile    # Port 5174
npm run build:mobile
```

### Run Both Simultaneously
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run dev:mobile
```

Desktop: http://localhost:5173
Mobile: http://localhost:5174

## Testing Recommendations

### Browser DevTools
1. Open Chrome DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select device:
   - iPhone SE (375x667)
   - iPhone 12 (390x844)
   - iPad (768x1024)
   - Desktop (1920x1080)

### Real Device Testing
Test on actual devices for best results:
- iPhone (Safari)
- Android phone (Chrome)
- iPad (Safari)
- Android tablet (Chrome)

## Troubleshooting

### Port Already in Use
If port 5174 is busy:
1. Edit `vite.config.mobile.js`
2. Change `port: 5174` to another port
3. Restart dev server

### Can't Access from Phone
1. Check firewall settings
2. Ensure both devices are on same network
3. Try turning off VPN
4. Use IP address, not `localhost`

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist-mobile
npm install
npm run build:mobile
```

## Deploy to Production

### Static Hosting (Netlify, Vercel, etc.)
1. Build: `npm run build:mobile`
2. Upload `dist-mobile/` folder
3. Set build command: `npm run build:mobile`
4. Set publish directory: `dist-mobile`

### Serve with Backend
Copy `dist-mobile/` to your backend's static folder:
```bash
npm run build:mobile
cp -r dist-mobile/* ../backend/static/mobile/
```

### Nginx Configuration
```nginx
# Serve mobile version
location /mobile {
    alias /path/to/dist-mobile;
    try_files $uri $uri/ /mobile/index-mobile.html;
}
```

## Performance Tips

1. **Enable gzip/brotli** compression on your server
2. **Use CDN** for static assets
3. **Enable caching** with proper cache headers
4. **Optimize images** (use WebP format)
5. **Lazy load** non-critical components

## Next Steps

- Read [MOBILE-README.md](./MOBILE-README.md) for detailed documentation
- Check responsive design at different breakpoints
- Test on real devices
- Add PWA features (service worker, manifest)
- Implement offline mode
- Add haptic feedback for mobile devices

## Support

For issues or questions:
1. Check [MOBILE-README.md](./MOBILE-README.md)
2. Review the code in `frontend/src/AppMobile.jsx`
3. Open an issue on GitHub
