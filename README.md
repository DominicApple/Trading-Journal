# ⚡ TradeLog — Personal Trading Journal

A desktop trading journal that stores everything locally on your computer. No internet required. No accounts. Just you and your trades.

## Prerequisites

Make sure you have these installed:

- **Node.js** (v18 or later) — https://nodejs.org
- **npm** (comes with Node.js)
- **VS Code** (recommended editor)

## Quick Start

### 1. Open the project in VS Code

```bash
cd tradelog-app
code .
```

### 2. Install dependencies

Open a terminal in VS Code (`` Ctrl+` ``) and run:

```bash
npm install
```

This installs React, Electron, and all dependencies. Takes 1-2 minutes.

### 3. Run the app in development mode

```bash
npm run dev
```

This starts the React dev server and opens the Electron window. Hot-reloading is enabled — any code changes update instantly.

### 4. Build a standalone executable (optional)

To create a distributable app you can double-click to open:

**Windows:**
```bash
npm run build-win
```

**macOS:**
```bash
npm run build-mac
```

**Linux:**
```bash
npm run build-linux
```

The built app will be in the `dist/` folder.

## Project Structure

```
tradelog-app/
├── build/              # App icons
│   ├── icon.png        # 512x512 app icon
│   ├── icon.svg        # Vector source
│   └── icon-*.png      # Various sizes
├── public/
│   ├── index.html      # HTML template
│   └── favicon.png     # Browser tab icon
├── src/
│   ├── App.jsx         # The entire app (all components)
│   └── index.js        # React entry point
├── main.js             # Electron main process
├── preload.js          # Secure bridge between Electron and React
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## How Data is Stored

- **In Electron (production):** Data is saved via `electron-store` to a JSON file on your local disk. The file location depends on your OS:
  - **Windows:** `%APPDATA%/tradelog/tradelog-data.json`
  - **macOS:** `~/Library/Application Support/tradelog/tradelog-data.json`
  - **Linux:** `~/.config/tradelog/tradelog-data.json`

- **In browser (development):** Data is saved to `localStorage` as a fallback.

All data stays on your machine. Nothing is sent to the internet.

## Features

- **Multi-Account Support** — Add unlimited trading accounts with custom IDs from your platform
- **Account Dashboard** — P&L, equity curve, emotion tracking, trade report, trade counter
- **Trade Entry** — Log trades with pair, direction, lot size, entry/exit, confluences (HTF Orderflow, FVG, IFVG, Order Block, SMT, Breaker), emotions, rating
- **Trade Journal** — Write detailed thought process for each trade
- **Trade System** — Document your entry model, rules, psychology, risk management
- **Weekly Projections** — Plan your week with bias, key levels, setups
- **Backtest Recaps** — Book-style weekly recaps with day-by-day tabs
- **Trade Counter** — Track total trades taken with increment/decrement
- **TradingView & Forex Factory** — Quick links from the homescreen
- **Persistent Storage** — All data saved locally, survives app restart
- **Dark Theme** — Neon blue/purple aesthetic throughout

## Troubleshooting

**App won't start?**
- Make sure Node.js v18+ is installed: `node --version`
- Delete `node_modules` and run `npm install` again

**Data disappeared?**
- In dev mode, data is in localStorage (cleared if you clear browser data)
- In production, data is in the electron-store JSON file (see paths above)

**Icon not showing?**
- The icon files are in `build/`. Make sure they exist after cloning.
