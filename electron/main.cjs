const { app, BrowserWindow, shell } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

let mainWindow = null
let pendingFile = null

const supportedFile = (value) => /\.(md|markdown|gloammark)$/i.test(value ?? '')
const fileFromArgs = (args) => args.find((value) => supportedFile(value) && fs.existsSync(value)) ?? null
const sendFile = (filePath) => {
  if (!mainWindow || !filePath || !fs.existsSync(filePath)) return
  const payload = { filename: path.basename(filePath), content: fs.readFileSync(filePath, 'utf8') }
  if (mainWindow.webContents.isLoading()) pendingFile = payload
  else mainWindow.webContents.send('gloammark:open-file', payload)
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 940,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })
  mainWindow.webContents.on('did-finish-load', () => {
    if (pendingFile) {
      mainWindow.webContents.send('gloammark:open-file', pendingFile)
      pendingFile = null
    }
  })
}

const lock = app.requestSingleInstanceLock()
if (!lock) app.quit()
else {
  app.on('second-instance', (_event, argv) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    const file = fileFromArgs(argv)
    if (file) sendFile(file)
  })

  app.on('open-file', (event, filePath) => {
    event.preventDefault()
    if (mainWindow) sendFile(filePath)
    else pendingFile = { filename: path.basename(filePath), content: fs.readFileSync(filePath, 'utf8') }
  })

  app.whenReady().then(() => {
    createWindow()
    const file = fileFromArgs(process.argv.slice(1))
    if (file) sendFile(file)
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
