const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller;
const path = require('path');
const fs = require('fs');

async function createInstaller() {
  try {
    console.log('正在生成Windows安装包...');

    // 获取应用目录路径（优先检查 dist 目录）
    let appDir = path.join(__dirname, 'dist', 'shutdown-cron-win32-x64');

    // 如果 dist 目录下没有，尝试 build 目录下
    if (!fs.existsSync(appDir)) {
      appDir = path.join(__dirname, 'build', 'shutdown-cron-win32-x64');
    }

    // 检查应用目录是否存在
    if (!fs.existsSync(appDir)) {
      throw new Error('应用目录不存在，请先运行 electron:package 命令');
    }

    await createWindowsInstaller({
      appDirectory: appDir,
      outputDirectory: path.join(__dirname, 'dist', 'installer'),
      authors: 'Wen Hainan',
      exe: 'shutdown-cron.exe',
      name: 'ShutdownCron',
      description: 'Shutdown Timer',
      version: require('./package.json').version,
      noMsi: true,
      setupExe: 'ShutdownCronSetup.exe',
      createDesktopShortcut: true,
      createStartMenuShortcut: true,
      shortcutName: 'ShutdownCron'
    });

    console.log('Windows安装包生成成功！');
  } catch (error) {
    console.error('生成安装包失败:', error.message);
    process.exit(1);
  }
}

createInstaller();