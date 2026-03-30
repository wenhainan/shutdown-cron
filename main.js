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

// 创建日志文件
const logFile = path.join(os.tmpdir(), 'shutdown-cron.log');
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(logFile, logMessage);
}

// 捕获未处理的异常
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`);
  log(error.stack);
  app.quit();
});

// 捕获未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled rejection: ${reason}`);
});

// 检查是否已经有实例在运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  log('Another instance is already running, quitting...');
  app.quit();
} else {
  // 当另一个实例启动时，恢复当前实例的窗口
  app.on('second-instance', () => {
    log('Second instance detected, restoring main window...');
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  try {
    log('Creating window...');

    mainWindow = new BrowserWindow({
      width: 500,
      height: 720,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true
      },
      resizable: false,
      title: '海豚定时关机',
      icon: path.join(__dirname, 'public', 'app.ico'),
      frame: false,  // 去掉原生工具栏
      transparent: false,  // 非透明窗口
      center: true  // 窗口居中显示
    });

    if (process.env.VITE_DEV_SERVER_URL) {
      log(`Loading from dev server: ${process.env.VITE_DEV_SERVER_URL}`);
      mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
      mainWindow.webContents.openDevTools();
    } else {
      // 尝试多种可能的路径
      let indexPath = null;

      log(`Current directory (__dirname): ${__dirname}`);
      log(`Parent directory: ${path.dirname(__dirname)}`);

      // 1. 检查 electron-packager 打包后的路径（resources/dist）
      let packagerDistPath = path.join(path.dirname(__dirname), 'dist', 'index.html');
      log(`Checking packager path: ${packagerDistPath}, exists: ${fs.existsSync(packagerDistPath)}`);
      if (fs.existsSync(packagerDistPath)) {
        indexPath = packagerDistPath;
      }

      // 2. 检查 electron-builder 打包后的路径（app/dist）
      let builderDistPath = path.join(__dirname, 'dist', 'index.html');
      log(`Checking builder path: ${builderDistPath}, exists: ${fs.existsSync(builderDistPath)}`);
      if (!indexPath && fs.existsSync(builderDistPath)) {
        indexPath = builderDistPath;
      }

      // 3. 检查开发模式下的路径（项目根目录/dist）
      let devDistPath = path.join(path.dirname(path.dirname(__dirname)), 'dist', 'index.html');
      log(`Checking dev path: ${devDistPath}, exists: ${fs.existsSync(devDistPath)}`);
      if (!indexPath && fs.existsSync(devDistPath)) {
        indexPath = devDistPath;
      }

      // 4. 如果都找不到，直接加载项目根目录的 index.html
      if (!indexPath) {
        indexPath = path.join(__dirname, 'index.html');
        log(`Using fallback path: ${indexPath}, exists: ${fs.existsSync(indexPath)}`);
      }

      log(`Loading index.html from: ${indexPath}`);
      mainWindow.loadFile(indexPath);
    }
  } catch (error) {
    log(`Error creating window: ${error.message}`);
    log(error.stack);
    app.quit();
  }
}

// 创建系统托盘
function createTray() {
  try {
    log('Creating tray...');

    // 使用默认图标（如果没有app.ico，Electron会使用默认图标）
    const iconPath = path.join(__dirname, 'public', 'app.ico');
    log(`Tray icon path: ${iconPath}, exists: ${fs.existsSync(iconPath)}`);

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

    log('Tray created successfully');
  } catch (error) {
    log(`Error creating tray: ${error.message}`);
    log(error.stack);
  }
}

app.whenReady().then(() => {
  log('App ready, creating window and tray...');
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
      // 如果错误是"没有正在进行的关机操作"或包含错误码1116，则忽略
      if (error.message.includes('1116') || error.message.includes('没有正在进行的关机操作') || error.message.includes('No shutdown in progress')) {
        console.log('没有正在进行的关机操作');
        return;
      }
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