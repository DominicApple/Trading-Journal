const { contextBridge, ipcRenderer } = require("electron");

// Expose a safe storage API to the React renderer process
contextBridge.exposeInMainWorld("electronStore", {
  get: (key) => ipcRenderer.invoke("store-get", key),
  set: (key, value) => ipcRenderer.invoke("store-set", key, value),
  delete: (key) => ipcRenderer.invoke("store-delete", key),
  getAll: () => ipcRenderer.invoke("store-get-all"),
});
