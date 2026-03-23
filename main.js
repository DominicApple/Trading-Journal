const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const url = require("url");
const { autoUpdater } = require("electron-updater");

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
    mainWindow.loadURL("http://localhost:3000");
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

// ── IPC Handlers for persistent storage ──
ipcMain.handle("store-get", (event, key) => {
  return store.get(key);
});

ipcMain.handle("store-set", (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle("store-delete", (event, key) => {
  store.delete(key);
  return true;
});

ipcMain.handle("store-get-all", () => {
  return store.store;
});

// ── Auto-updater ──
function setupAutoUpdater() {
  // Only run updater in production
  if (!app.isPackaged) return;

  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on("update-available", () => {
    dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Update Available",
      message: "A new version of TradeLog is available. It will download in the background.",
      buttons: ["OK"],
    });
  });

  autoUpdater.on("update-downloaded", () => {
    dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Update Ready",
      message: "Update downloaded. TradeLog will restart to apply the update.",
      buttons: ["Restart Now"],
    }).then(() => {
      autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.on("error", (err) => {
    console.error("Auto-updater error:", err);
  });
}

// ── App lifecycle ──
app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});


app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
