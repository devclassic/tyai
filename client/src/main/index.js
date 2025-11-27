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
} from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { join, basename, dirname } from 'path'
import Screenshots from 'electron-screenshots'
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
    width: 800,
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
    await win.webContents.executeJavaScript('setTimeout(() => { location.hash = "#/about" }, 10)')
    win.show()
  })

  const devurl = process.env['ELECTRON_RENDERER_URL']
  if (is.dev && devurl) {
    win.loadURL(`${devurl}/portable.html#/about`)
  } else {
    win.loadFile(join(__dirname, '../renderer/portable.html'))
  }

  return win
}

// 创建剪贴板窗口
const createClipboardWindow = () => {
  const win = new BrowserWindow({
    width: 800,
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
const showPortableWindow = async () => {
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
      portableWindow.close()
    })
    portableWindow.on('closed', () => {
      portableWindow = null
    })
  }
}

let clipboardWindow = null
const showClipboardWindow = async () => {
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
      clipboardWindow.close()
    })
    clipboardWindow.on('closed', () => {
      clipboardWindow = null
    })
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

  // 主窗口
  const mainWindow = createMainWindow()

  // 截图功能
  const screenshots = new Screenshots()
  screenshots.on('ok', (e, buffer, bounds) => {
    console.log('ok')
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

  ipcMain.on('download', async (e, url) => {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: basename(url),
    })
    if (canceled || !filePath) return
    const ses = session.fromPartition(`download_${Date.now()}`)
    ses.once('will-download', (e, item) => {
      item.setSavePath(filePath)
      item.once('done', async (e, state) => {
        if (state === 'completed') {
          shell.openPath(dirname(filePath))
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
      label: '灵犀版（Alt+C）',
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
