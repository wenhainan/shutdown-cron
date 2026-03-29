/*
 * @Author: 闻海南 whndeweilai@163.com
 * @Date: 2026-03-25 08:49:09
 * @LastEditors: 闻海南 whndeweilai@163.com
 * @LastEditTime: 2026-03-25 09:29:37
 * @FilePath: \shutdown-cron\main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { app, BrowserWindow, ipcMain, Tray, Menu, shell } = require('electron');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const fs = require('fs');

let mainWindow;
let tray;
let shutdownTimer = null;

// 检查是否已经有实例在运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  // 当另一个实例启动时，恢复当前实例的窗口
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    resizable: false,
    title: '定时关机软件',
    icon: path.join(__dirname, 'logo.png'),
    frame: false,  // 去掉原生工具栏
    transparent: false,  // 非透明窗口
    center: true  // 窗口居中显示
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // 尝试多种可能的路径
    let indexPath = null;

    // 1. 检查应用目录下的 dist
    let appDistPath = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(appDistPath)) {
      indexPath = appDistPath;
    }

    // 2. 检查项目根目录下的 dist（打包后的位置）
    let rootDistPath = path.join(path.dirname(__dirname), 'dist', 'index.html');
    if (!indexPath && fs.existsSync(rootDistPath)) {
      indexPath = rootDistPath;
    }

    // 3. 如果都找不到，直接加载项目根目录的 index.html
    if (!indexPath) {
      indexPath = path.join(__dirname, 'index.html');
    }

    mainWindow.loadFile(indexPath);
  }
}

// 创建系统托盘
function createTray() {
  // 使用默认图标（如果没有logo.png，Electron会使用默认图标）
  const iconPath = path.join(__dirname, 'logo.png');

  tray = new Tray(iconPath);

  // 创建右键菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '关于',
      click: () => {
        shell.openExternal('https://www.waytomilky.com/archives/4532.html') // 可以替换为关于窗口
      }
    },
    {
      label: '退出',
      click: () => {
        if (shutdownTimer) {
          cancelShutdown();
        }
        app.quit();
      }
    }
  ]);

  // 设置托盘提示
  tray.setToolTip('定时关机软件');

  // 设置右键菜单
  tray.setContextMenu(contextMenu);

  // 点击托盘图标切换窗口显示/隐藏
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

// 窗口关闭事件，改为最小化到托盘
app.on('window-all-closed', (event) => {
  // 阻止默认行为，不退出应用
  event.preventDefault();

  // 隐藏主窗口
  if (mainWindow) {
    mainWindow.hide();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else if (mainWindow) {
    mainWindow.show();
  }
});

// 当所有窗口都隐藏时，保持应用运行
app.on('before-quit', () => {
  if (shutdownTimer) {
    cancelShutdown();
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

// 退出应用
ipcMain.handle('exit-app', () => {
  if (shutdownTimer) {
    cancelShutdown();
  }
  app.quit();
  return true;
});

// 窗口控制
ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
  return true;
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
  return true;
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.hide(); // 最小化到托盘
  }
  return true;
});