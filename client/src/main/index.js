import {
  app,
  Tray,
  Menu,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  dialog,
  session,
  shell,
  clipboard,
} from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import path, { join, basename, dirname } from 'path'
import Screenshots from 'electron-screenshots'
import crypto from 'crypto'
import fs from 'fs-extra'
import { v4 as uuidv4 } from 'uuid'
import icon from '../../resources/icon.png?asset'

// 创建主窗口
const createMainWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    frame: false,
    resizable: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  win.on('restore', () => win.webContents.send('win-restored'))

  win.on('close', e => {
    e.preventDefault()
    win.hide()
  })

  const devurl = process.env['ELECTRON_RENDERER_URL']
  if (is.dev && devurl) {
    win.loadURL(`${devurl}/index.html`)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

// 创建便携窗口
const createPortableWindow = () => {
  const win = new BrowserWindow({
    width: 630,
    height: 145,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  win.on('ready-to-show', async () => {
    await win.webContents.executeJavaScript('setTimeout(() => { location.hash = "#/index" }, 10)')
    win.show()
  })

  const devurl = process.env['ELECTRON_RENDERER_URL']
  if (is.dev && devurl) {
    win.loadURL(`${devurl}/portable.html#/index`)
  } else {
    win.loadFile(join(__dirname, '../renderer/portable.html'))
  }

  return win
}

// 创建剪贴板窗口
const createClipboardWindow = () => {
  const win = new BrowserWindow({
    width: 380,
    height: 600,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  win.on('ready-to-show', async () => {
    await win.webContents.executeJavaScript(
      'setTimeout(() => { location.hash = "#/clipboard" }, 10)',
    )
    win.show()
  })

  const devurl = process.env['ELECTRON_RENDERER_URL']
  if (is.dev && devurl) {
    win.loadURL(`${devurl}/portable.html#/clipboard`)
  } else {
    win.loadFile(join(__dirname, '../renderer/portable.html'))
  }
  return win
}

let portableWindow = null
const showPortableWindow = () => {
  if (clipboardWindow) clipboardWindow.close()
  if (portableWindow) {
    if (portableWindow.isVisible()) {
      portableWindow.close()
    } else {
      portableWindow.show()
      portableWindow.focus()
    }
  } else {
    portableWindow = createPortableWindow()
    portableWindow.on('blur', () => {
      // portableWindow.close()
    })
    portableWindow.on('closed', () => {
      portableWindow = null
    })
  }
}

let clipboardWindow = null
const showClipboardWindow = () => {
  if (portableWindow) portableWindow.close()
  if (clipboardWindow) {
    if (clipboardWindow.isVisible()) {
      clipboardWindow.close()
    } else {
      clipboardWindow.show()
      clipboardWindow.focus()
    }
  } else {
    clipboardWindow = createClipboardWindow()
    clipboardWindow.on('blur', () => {
      // clipboardWindow.close()
    })
    clipboardWindow.on('closed', () => {
      clipboardWindow = null
    })
  }
}

const history = []
let lastText = ''
let lastImgHash = ''
const readClip = () => {
  const text = clipboard.readText()
  const img = clipboard.readImage()
  let changed = false
  let record = {
    id: uuidv4(),
    ts: Date.now(),
  }

  if (text && text !== lastText) {
    lastText = text
    record.type = 'text'
    record.payload = text
    changed = true
  }
  if (!img.isEmpty()) {
    const buf = img.toPNG()
    const h = crypto.createHash('md5').update(buf).digest('hex')
    if (h !== lastImgHash) {
      lastImgHash = h
      record.type = 'image'
      record.hash = h
      const fname = `${Date.now()}.png`
      const dir = path.join(__dirname, 'data/img')
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      const fullPath = path.join(dir, fname)
      fs.writeFileSync(fullPath, buf)
      record.payload = fullPath
      changed = true
    }
  }
  if (changed) {
    history.push(record)
    if (clipboardWindow) clipboardWindow.webContents.send('new-clip', record)
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('ink.epoint.client')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })

  // 定时器读取剪贴板
  setInterval(() => {
    readClip()
  }, 500)

  // 主窗口
  const mainWindow = createMainWindow()

  // 截图功能
  const screenshots = new Screenshots()
  let screenshot = null
  screenshots.on('ok', async (e, buffer, bounds) => {
    if (clipboardWindow) clipboardWindow.close()
    if (portableWindow) portableWindow.close()
    const fname = `${Date.now()}.png`
    const dir = path.join(__dirname, 'data/img')
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    const fullPath = path.join(dir, fname)
    await fs.writeFile(fullPath, buffer)
    screenshot = fullPath
    showPortableWindow()
  })

  // 全局快捷键
  globalShortcut.register('alt+z', () => {
    screenshots.startCapture()
  })

  globalShortcut.register('alt+x', () => {
    showPortableWindow()
  })

  globalShortcut.register('alt+c', () => {
    showClipboardWindow()
  })

  globalShortcut.register('alt+v', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  // 通用IPC通信
  ipcMain.on('minimize', () => {
    BrowserWindow.getFocusedWindow().minimize()
  })

  ipcMain.on('close', () => {
    BrowserWindow.getFocusedWindow().close()
  })

  ipcMain.on('show-alert', async (e, { title, message }) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    dialog.showMessageBox(win, {
      title,
      message,
    })
  })

  ipcMain.handle('get-history', () => {
    return history.slice().reverse()
  })

  ipcMain.on('remove-history', (e, id) => {
    const index = history.findIndex(item => item.id === id)
    if (index !== -1) {
      const item = history[index]
      if (lastText === item.payload) {
        lastText = ''
      }
      if (lastImgHash === item.hash) {
        lastImgHash = ''
      }
      history.splice(index, 1)
    }
  })

  ipcMain.on('clear-history', () => {
    lastText = ''
    lastImgHash = ''
    history.length = 0
  })

  ipcMain.handle('read-local-image', async (e, path) => {
    const data = fs.readFileSync(path)
    return `data:image/png;base64,${data.toString('base64')}`
  })

  ipcMain.on('resize-portable', (e, size) => {
    portableWindow.setSize(size.width, size.height)
    portableWindow.center()
  })

  let transJson = null
  ipcMain.on('to-portable', (e, json) => {
    transJson = json
    showPortableWindow()
  })

  ipcMain.on('portable-ready', e => {
    portableWindow.webContents.send('load', transJson)
    transJson = null
  })

  ipcMain.on('portable-screenshot', e => {
    portableWindow.webContents.send('screenshot', screenshot)
    screenshot = null
  })

  ipcMain.on('download', async (e, url, open = false) => {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: basename(url),
    })
    if (canceled || !filePath) return
    const ses = session.fromPartition(`download_${Date.now()}`)
    ses.once('will-download', (e, item) => {
      item.setSavePath(filePath)
      item.once('done', async (e, state) => {
        if (state === 'completed') {
          shell.openPath(open ? filePath : dirname(filePath))
        }
      })
    })
    ses.downloadURL(url)
  })

  // 系统托盘
  const menus = Menu.buildFromTemplate([
    {
      label: '主窗口（Alt+V）',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      },
    },
    {
      label: '便携窗口（Alt+X）',
      click: () => {
        showPortableWindow()
      },
    },
    {
      label: '截图（Alt+Z）',
      click: () => {
        screenshots.startCapture()
      },
    },
    {
      label: '灵犀板（Alt+C）',
      click: () => {
        showClipboardWindow()
      },
    },
    {
      label: '退出',
      click: () => {
        BrowserWindow.getAllWindows().forEach(w => w.destroy())
        app.quit()
        tray.destroy()
      },
    },
  ])

  const tray = new Tray(icon)
  tray.setContextMenu(menus)
  tray.setToolTip('端点科技通用AI客户端')
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
