const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronStore", {
  get: (key) => ipcRenderer.invoke("store-get", key),
  set: (key, value) => ipcRenderer.invoke("store-set", key, value),
  delete: (key) => ipcRenderer.invoke("store-delete", key),
  getAll: () => ipcRenderer.invoke("store-get-all"),
});

contextBridge.exposeInMainWorld("electronShell", {
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
});

contextBridge.exposeInMainWorld("electronUpdater", {
  checkForUpdates:  ()  => ipcRenderer.invoke("check-for-updates"),
  installUpdate:    ()  => ipcRenderer.invoke("install-update"),
  onUpdateAvailable:  (cb) => ipcRenderer.on("update-available",   (_e, d) => cb(d)),
  onUpdateProgress:   (cb) => ipcRenderer.on("update-progress",    (_e, d) => cb(d)),
  onUpdateDownloaded: (cb) => ipcRenderer.on("update-downloaded",  (_e, d) => cb(d)),
  onUpdateNotAvailable:(cb)=> ipcRenderer.on("update-not-available",(_e, d) => cb(d)),
  onUpdateError:      (cb) => ipcRenderer.on("update-error",       (_e, d) => cb(d)),
  removeAllListeners: ()  => {
    ["update-available","update-progress","update-downloaded","update-not-available","update-error"]
      .forEach(ch => ipcRenderer.removeAllListeners(ch));
  },
});
