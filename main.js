const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let mainWindow;
let shutdownTimer = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    },
    resizable: false,
    title: '定时关机软件'
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 定时关机功能
function scheduleShutdown(minutes) {
  if (shutdownTimer) {
    clearTimeout(shutdownTimer);
  }

  const seconds = minutes * 60;
  shutdownTimer = setTimeout(() => {
    // Windows 系统关机命令
    exec('shutdown /s /t 0', (error, stdout, stderr) => {
      if (error) {
        console.error(`执行错误: ${error}`);
        return;
      }
      console.log(`输出: ${stdout}`);
    });
  }, seconds * 1000);

  return seconds;
}

// 取消关机
function cancelShutdown() {
  if (shutdownTimer) {
    clearTimeout(shutdownTimer);
    shutdownTimer = null;
  }
  
  // 取消系统关机命令
  exec('shutdown /a', (error, stdout, stderr) => {
    if (error) {
      console.error(`取消关机错误: ${error}`);
      return;
    }
    console.log(`取消关机成功`);
  });
}

// IPC 通信
ipcMain.handle('schedule-shutdown', (event, minutes) => {
  return scheduleShutdown(minutes);
});

ipcMain.handle('cancel-shutdown', () => {
  cancelShutdown();
  return true;
});

ipcMain.handle('get-timer-status', () => {
  return shutdownTimer ? true : false;
});