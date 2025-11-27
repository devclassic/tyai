import { app, Tray, Menu, BrowserWindow, globalShortcut, ipcMain, dialog } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { join } from 'path'
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

// 创建剪贴板窗口
const createClipboardWindow = () => {
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

  const devurl = process.env['ELECTRON_RENDERER_URL']
  if (is.dev && devurl) {
    win.loadURL(`${devurl}/portable.html`)
  } else {
    win.loadFile(join(__dirname, '../renderer/portable.html'))
  }

  return win
}

let clipboardWindow = null

app.whenReady().then(() => {
  electronApp.setAppUserModelId('ink.epoint.client')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })

  // 截图功能
  const screenshots = new Screenshots()
  screenshots.on('ok', (e, buffer, bounds) => {
    console.log('ok')
  })

  // 全局快捷键
  globalShortcut.register('alt+z', () => {
    screenshots.startCapture()
  })

  globalShortcut.register('alt+c', () => {
    if (clipboardWindow) {
      clipboardWindow.show()
      clipboardWindow.focus()
    } else {
      clipboardWindow = createClipboardWindow()
      clipboardWindow.on('closed', () => {
        clipboardWindow = null
      })
    }
  })

  // 主窗口
  const mainWindow = createMainWindow()

  // IPC通信
  ipcMain.on('minimize', () => {
    BrowserWindow.getFocusedWindow().minimize()
  })

  ipcMain.on('close', () => {
    BrowserWindow.getFocusedWindow().close()
  })

  ipcMain.on('download', async (e, url) => {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: path.basename(url),
    })
    if (canceled || !filePath) return
    const ses = session.fromPartition(`download_${Date.now()}`)
    ses.once('will-download', (e, item) => {
      item.setSavePath(filePath)
      item.once('done', async (e, state) => {
        if (state === 'completed') {
          shell.openPath(path.dirname(filePath))
        }
      })
    })
    ses.downloadURL(url)
  })

  // 系统托盘
  const menus = Menu.buildFromTemplate([
    {
      label: '主窗口',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      },
    },
    {
      label: '便携窗口',
      click: () => {},
    },
    {
      label: '应用桥',
      click: () => {
        if (clipboardWindow) {
          clipboardWindow.show()
          clipboardWindow.focus()
        } else {
          clipboardWindow = createClipboardWindow()
          clipboardWindow.on('closed', () => {
            clipboardWindow = null
          })
        }
      },
    },
    {
      label: '截图',
      click: () => {
        screenshots.startCapture()
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
