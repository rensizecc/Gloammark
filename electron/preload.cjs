const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('gloammarkDesktop', {
  platform: process.platform,
  onOpenFile: (callback) => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('gloammark:open-file', listener)
    return () => ipcRenderer.removeListener('gloammark:open-file', listener)
  }
})
