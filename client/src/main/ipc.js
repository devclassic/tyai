import { ipcMain, BrowserWindow, dialog, session, shell } from 'electron'
import path from 'path'
import open from 'open'

const init = win => {
  ipcMain.on('minimize', () => {
    BrowserWindow.getFocusedWindow().minimize()
  })

  ipcMain.on('close', () => {
    BrowserWindow.getFocusedWindow().close()
  })

  ipcMain.on('download', async (e, url) => {
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      defaultPath: path.basename(url),
    })
    if (canceled || !filePath) return
    const ses = session.fromPartition(`download_${Date.now()}`)
    ses.once('will-download', (e, item) => {
      item.setSavePath(filePath) // 把文件写到用户选的位置
      item.once('done', async (e, state) => {
        if (state === 'completed') {
          // dialog.showMessageBox(win, {
          //   type: 'info',
          //   title: '下载完成',
          //   message: `${path.basename(filePath)} 已下载成功！`,
          // })
          shell.openPath(path.dirname(filePath))
        }
      })
    })
    ses.downloadURL(url)
  })
}

export default { init }
