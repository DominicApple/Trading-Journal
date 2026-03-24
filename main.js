const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const url = require("url");
// electron-updater is loaded lazily inside setupAutoUpdater (production only)
let autoUpdater = null;

// electron-store for persistent local storage
let Store;
try {
  Store = require("electron-store");
} catch (e) {
  // Fallback if electron-store fails to load
  Store = class {
    constructor() { this._data = {}; }
    get(key) { return this._data[key]; }
    set(key, val) { this._data[key] = val; }
    delete(key) { delete this._data[key]; }
    get store() { return this._data; }
  };
}

const store = new Store({
  name: "tradelog-data",
  defaults: {
    accounts: [],
    activeAccountId: null,
    allAccountData: {},
  },
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: "TradeLog",
    icon: path.join(__dirname, "build", "icon.png"),
    backgroundColor: "#0a0b0e",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
  });

  // Determine if running in development or production
  const isDev = !app.isPackaged;

  if (isDev) {
    // Development: load from React dev server
    mainWindow.loadURL("http://localhost:3001");
  } else {
    // Production: load from the built React files
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "build", "index.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  }

  // Show window when ready to avoid white flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function registerIpcHandlers() {
  // ── IPC Handlers for shell ──
  ipcMain.handle("open-external", (_event, u) => {
    shell.openExternal(u);
  });

  // ── IPC Handlers for persistent storage ──
  ipcMain.handle("store-get", (_event, key) => {
    return store.get(key);
  });

  ipcMain.handle("store-set", (_event, key, value) => {
    store.set(key, value);
    return true;
  });

  ipcMain.handle("store-delete", (_event, key) => {
    store.delete(key);
    return true;
  });

  ipcMain.handle("store-get-all", () => {
    return store.store;
  });

  // ── IPC: install update & restart ──
  ipcMain.handle("install-update", () => {
    if (autoUpdater) autoUpdater.quitAndInstall();
  });

  // ── IPC: manually check for updates ──
  ipcMain.handle("check-for-updates", () => {
    if (!app.isPackaged) { send("update-not-available", {}); return; }
    if (autoUpdater) autoUpdater.checkForUpdates().catch(err => send("update-error", { message: err.message }));
  });
}

// ── Auto-updater ──
function send(channel, data) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send(channel, data);
  }
}

function setupAutoUpdater() {
  // Only run updater in production
  if (!app.isPackaged) return;

  // Lazy load only in production so dev mode doesn't crash
  autoUpdater = require("electron-updater").autoUpdater;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.checkForUpdates().catch(err => console.error("Update check failed:", err));

  autoUpdater.on("update-available", (info) => {
    send("update-available", {
      version:      info.version,
      releaseNotes: info.releaseNotes || "",
      releaseDate:  info.releaseDate  || "",
    });
  });

  autoUpdater.on("download-progress", (progress) => {
    send("update-progress", {
      percent:       Math.round(progress.percent),
      transferred:   progress.transferred,
      total:         progress.total,
      bytesPerSecond: progress.bytesPerSecond,
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    send("update-downloaded", {
      version:      info.version,
      releaseNotes: info.releaseNotes || "",
    });
  });

  autoUpdater.on("update-not-available", () => {
    send("update-not-available", {});
  });

  autoUpdater.on("error", (err) => {
    console.error("Auto-updater error:", err);
    send("update-error", { message: err.message });
  });
}

// ── App lifecycle ──
app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
  setupAutoUpdater();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});


app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
