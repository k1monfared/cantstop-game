# Can't Stop -- The Push-Your-Luck Dice Game

A full-stack web implementation of Sid Sackson's classic **Can't Stop** board game, built with a Python/FastAPI backend and a React frontend featuring animated dice, interactive pairing selection, real-time probability analysis, and both desktop and mobile layouts.

**[Play the game online](https://cantstop-frontend.onrender.com/)** | **[Read the mathematical analysis](https://github.com/k1monfared/notes/blob/main/blog/20251201_cant_stop_addicted_to_the_shindig.md)**

---

## Table of Contents

- [About the Game](#about-the-game)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [How to Play](#how-to-play)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Strategy Tips](#strategy-tips)
- [Technologies Used](#technologies-used)
- [License](#license)

---

## About the Game

Can't Stop is a push-your-luck dice game for 2 players. On each turn you roll four dice and split them into two pairs, advancing markers up the corresponding columns on the board. The columns are numbered 2 through 12 -- matching every possible sum of two six-sided dice -- and each has a different height: column 7 (the most likely sum) requires 13 steps, while columns 2 and 12 (the rarest sums) require only 3.

The catch: you may only have **three active runners** (columns you are currently advancing) on any given turn. You can keep rolling to push further, but if none of the three possible pairings produces a valid move, you **bust** and lose all unsaved progress for that turn.

The first player to reach the top of any **three columns** wins.

### Column Heights

| Column | 2 | 3 | 4 | 5 | 6 | **7** | 8 | 9 | 10 | 11 | 12 |
|--------|---|---|---|---|---|-------|---|---|----|----|----|
| Steps  | 3 | 5 | 7 | 9 | 11| **13**| 11| 9 | 7  | 5  | 3  |

### Core Rules

1. **Roll** four six-sided dice.
2. **Pair** them into two sums (there are exactly 3 possible pairings from 4 dice).
3. **Advance** your runners in the chosen columns. You may have at most 3 active runners per turn.
4. **Decide**: roll again (risk busting) or stop and save your progress.
5. **Bust**: if no pairing can produce a valid move, all temporary progress for the turn is lost.
6. **Completed columns** are locked -- neither player can use them again.
7. **Win** by completing 3 columns first.

---

## Features

### Gameplay
- Full Can't Stop rules engine with bust detection, 3-runner limit, and win condition
- 2-player hot-seat mode with editable player names
- Undo/redo history for every action
- Save and load games to/from `.csp` files
- Automatic pairing validation -- invalid moves are clearly indicated with reasons

### User Interface
- **Animated dice** with 3D rotation and staggered reveal
- **Interactive pairing selector** with color-coded dice pairs (purple/teal)
- **Live board preview** -- hovering a pairing shows where markers would move before you commit
- **Partial pairing support** -- when only one of two sums can be played, you choose which one directly on the sum badges
- **Dark mode** and light mode with a single toggle
- **Cell number overlay** toggle for learning the board positions
- **Responsive layout** with dedicated desktop and mobile views

### Probability Sidebar (Brain Icon)
- **Real-time bust probability** calculated by exhaustive enumeration of all 1,296 possible four-dice outcomes
- **Expected value (EV)** display with the formula: `EV = P(safe) * Q - P(bust) * U`
- **Bust risk over N rolls** (cumulative probability for 1, 2, and 3 rolls ahead)
- **Per-column analysis**: steps remaining, probability of advancing, and probability of completing each active column
- **Conditional EV**: hover any pairing to see how your EV changes if you choose it
- **Breakdown popups** for safe-outcome details (by number of valid pairings, by move type)

### Visual Feedback
- Orange markers for Player 1, blue markers for Player 2
- Hollow pulsing markers for temporary (unsaved) progress
- Gold highlight on active columns
- "BUST!" label overlay with shake animation
- Winner overlay with player name and "Play Again" button
- Completed columns display the winning player's initials

---

## Project Structure

```
cantstop-game/
├── backend/
│   ├── main.py               # Game engine, state management, and FastAPI endpoints (~900 lines)
│   ├── requirements.txt       # Python dependencies
│   └── saved_games/           # Directory for server-side game saves
├── frontend/
│   ├── index.html             # HTML entry point
│   ├── package.json           # NPM dependencies and scripts
│   ├── vite.config.js         # Vite dev server and proxy config
│   └── src/
│       ├── main.jsx           # React entry point
│       ├── App.jsx            # Main application component (desktop)
│       ├── App.css            # Desktop layout and theme styles
│       ├── AppMobile.jsx      # Mobile application component
│       ├── AppMobile.css      # Mobile layout styles
│       ├── colors.css         # Centralized CSS custom properties for theming
│       ├── index.css          # Global styles
│       ├── config.js          # API base URL configuration
│       ├── hooks/
│       │   └── useLongPress.js
│       └── components/
│           ├── GameBoard.jsx / .css        # 11-column game board with markers
│           ├── DiceRoller.jsx / .css       # 4-dice display with roll animation
│           ├── PairingSelector.jsx / .css  # 3 pairing options with validation
│           ├── PlayerInfo.jsx / .css       # Player name and sidebar info
│           ├── BustProbability.jsx / .css  # Probability analysis sidebar
│           ├── BrainIcon.jsx              # Brain icon component
│           ├── BrainIconSVG.jsx           # Brain icon SVG
│           └── mobile/                    # Mobile-specific components
│               ├── GameBoardMobile.jsx / .css
│               ├── DiceRollerMobile.jsx / .css
│               ├── PairingSelectorMobile.jsx / .css
│               ├── PlayerInfoMobile.jsx / .css
│               ├── BustProbabilityMobile.jsx / .css
│               ├── FloatingActionButton.jsx / .css
│               ├── BottomSheet.jsx / .css
│               ├── PlayerIndicator.jsx / .css
│               ├── PlayerIndicatorCompact.jsx
│               ├── UnifiedMenu.jsx
│               ├── DiceAreaNew.jsx / .css
│               ├── IconsSVG.jsx
│               └── ...
├── play.sh                    # One-command launcher (Linux/macOS)
├── start.sh                   # Startup script with venv setup
├── start.bat                  # Windows startup script
├── run_backend.sh             # Backend-only launcher
├── run_frontend.sh            # Frontend-only launcher
├── render.yaml                # Render.com deployment blueprint
└── .gitignore
```

---

## Getting Started

### Prerequisites

- **Python 3.8+** (for the backend)
- **Node.js 16+** and **npm** (for the frontend)

### Quick Start (One Command)

```bash
./play.sh
```

This installs dependencies, starts both servers, and opens the game in your browser.

### Manual Setup

**Terminal 1 -- Backend:**

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The API server starts on `http://localhost:8000`. Visit `http://localhost:8000/docs` for auto-generated interactive API documentation.

**Terminal 2 -- Frontend:**

```bash
cd frontend
npm install
npm run dev
```

The development server starts on `http://localhost:3000`. The Vite proxy forwards `/api` requests to the backend automatically.

### Production Build

```bash
cd frontend
npm run build     # Outputs optimized files to frontend/dist/
npm run preview   # Preview the production build locally
```

---

## How to Play

1. **Roll Dice** -- Click the dice button (styled as a die face) to roll 4 dice.
2. **Choose a Pairing** -- Three possible pairings appear below the dice. Each shows two column numbers. Dice are color-coded purple and teal to show which dice form which sum.
   - **Valid pairings** are clickable and auto-confirm on click.
   - **Invalid pairings** are grayed out with a reason (e.g., "No room (3 runners)" or "Both completed").
   - **Partial pairings** (where only one of the two sums is playable) show a "Choose One" prompt -- click the specific sum badge you want.
3. **Continue or Stop** -- After confirming a pairing:
   - Click the dice button again to **roll again** (risk busting).
   - Click **STOP** to save all temporary progress and end your turn.
4. **Bust** -- If no valid pairing exists, "BUST!" appears and you lose all unsaved progress. Click **Next Player** to continue.
5. **Win** -- Complete 3 columns. A victory overlay displays the winner's name.

### Additional Controls

| Control | Description |
|---------|-------------|
| **Settings (gear icon)** | Toggle dark/light mode, show/hide cell position numbers |
| **Brain icon** | Open the probability analysis sidebar |
| **Menu (hamburger icon)** | New game, save game, load game |
| **Undo/Redo arrows** | Step backward or forward through game history |
| **Click player name** | Edit the player name inline |

---

## Architecture

### Backend (`backend/main.py`)

The backend is a stateless-per-request Python FastAPI application. It manages game state in memory and exposes a RESTful API.

**Key classes:**

- **`GameMechanics`** -- Pure static methods for game rules: dice rolling, pairing generation, validation, progress application, bust/win detection. No state.
- **`GameState`** -- Holds all data for a single game: player progress (permanent and temporary), active runners, dice, pairings, history snapshots, and metadata. Supports serialization to/from dict for save/load.
- **`GameManager`** -- Orchestrates games: creates new games, rolls dice, applies pairings, stops turns, handles bust continuation, undo/redo, save/load.

**Design decisions:**
- Pairing validation accounts for the 3-runner limit, completed columns, and columns that have reached the top but are not yet saved.
- When both sums in a pairing are individually playable but cannot both be applied (e.g., would need a 4th runner), the backend flags `needs_choice: true` so the frontend can present a "choose one" UI.
- The `playability` payload sent with each valid pairing tells the frontend exactly which sums are playable and whether both can be applied simultaneously.

### Frontend (`frontend/src/`)

The frontend is a React 18 single-page application built with Vite.

**Key components:**

- **`App.jsx`** -- Manages all game state, API calls, hover/preview logic, and modal/overlay rendering. Calculates dice-pair-to-pairing mappings for color-coded highlighting.
- **`GameBoard.jsx`** -- Renders 11 columns with variable heights. Each cell can display permanent markers, temporary markers, and animated preview dots. Supports undo/redo buttons and completed-column badges.
- **`DiceRoller.jsx`** -- Displays 4 dice with Framer Motion 3D rotation animations. Each die can be highlighted purple or teal based on the hovered pairing. Includes the Roll and Stop buttons.
- **`PairingSelector.jsx`** -- Shows all 3 available pairings with valid/invalid/selected states. Supports hover-to-preview, click-to-confirm, and click-on-sum for partial pairings. Follows cursor tooltip for "Choose One" scenarios.
- **`BustProbability.jsx`** -- Exhaustively enumerates all 6^4 = 1,296 dice outcomes to compute exact bust probability, safe-outcome breakdown, per-column advance probability, and expected value. Updates in real time as game state changes and on pairing hover.

**State flow:**
1. `App` creates a game via `POST /api/games` on mount.
2. User clicks Roll -- `POST /api/games/{id}/roll` returns new dice, all pairings, and valid pairings with playability info.
3. User hovers a pairing -- frontend calculates preview column positions and dice highlights locally (no API call).
4. User clicks a pairing -- `POST /api/games/{id}/choose` applies it; frontend waits 800ms for animation then updates state.
5. User clicks Stop -- `POST /api/games/{id}/stop` commits progress, switches player.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/games` | Create a new game. Body: `{ player1_name?, player2_name? }` |
| `GET` | `/api/games/{id}` | Get current game state |
| `POST` | `/api/games/{id}/roll` | Roll 4 dice for the current player |
| `POST` | `/api/games/{id}/choose` | Choose a pairing. Body: `{ pairing_index, chosen_number? }` |
| `POST` | `/api/games/{id}/stop` | Stop turn and commit progress |
| `POST` | `/api/games/{id}/continue` | Clear bust state and switch to next player |
| `POST` | `/api/games/{id}/undo` | Undo to previous state |
| `POST` | `/api/games/{id}/redo` | Redo to next state |
| `GET` | `/api/games/{id}/save` | Get save data (filename + JSON) for download |
| `POST` | `/api/games/load` | Load game from uploaded `.csp`/`.json` file |
| `GET` | `/api/health` | Health check endpoint |

When the backend is running, visit `http://localhost:8000/docs` for the full interactive Swagger UI.

---

## Deployment

The game is deployed on **Render.com** (free tier):

- **Backend**: Python web service running `uvicorn main:app`
- **Frontend**: Static site built by `vite build`, served from `frontend/dist/`

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions to deploy your own instance on Render (no credit card required).

### Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `PYTHON_VERSION` | Backend | Python version for Render (e.g., `3.11.0`) |
| `VITE_API_URL` | Frontend | Backend URL (e.g., `https://cantstop-backend.onrender.com`) |

---

## Strategy Tips

- **Middle columns (6, 7, 8)** are easiest to roll but require the most steps. Good for steady progress.
- **Outer columns (2, 3, 11, 12)** are short but hard to hit. High risk, high reward.
- **Watch the 3-runner limit** -- having 3 unrelated runners dramatically increases bust probability.
- **Use the probability sidebar** to make informed decisions about when to stop.
- **Positive EV** means rolling again is mathematically favorable; **negative EV** means you should stop.
- **Block your opponent** -- completing a column they need can be decisive.

---

## Technologies Used

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | Python 3.8+ | Language |
| Backend | FastAPI 0.104 | Web framework with auto-generated docs |
| Backend | Uvicorn 0.24 | ASGI server |
| Backend | Pydantic 2.5 | Request/response validation |
| Frontend | React 18 | UI framework |
| Frontend | Vite 5 | Build tool and dev server |
| Frontend | Framer Motion 10 | Animations (dice, markers, overlays) |
| Frontend | Axios 1.6 | HTTP client |
| Styling | CSS3 | Custom properties, grid, flexbox, animations |
| Deployment | Render.com | Free-tier hosting |

---

## License

MIT License -- free to use and modify.

## Credits

- **Game design**: "Can't Stop" by Sid Sackson
- **Implementation**: [k1monfared](https://github.com/k1monfared)
