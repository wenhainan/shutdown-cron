const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller;
const path = require('path');

async function createInstaller() {
  try {
    console.log('正在生成Windows安装包...');

    await createWindowsInstaller({
      appDirectory: path.join(__dirname, 'dist', 'shutdown-cron-win32-x64'),
      outputDirectory: path.join(__dirname, 'dist', 'installer'),
      authors: 'Your Name',
      exe: 'shutdown-cron.exe',
      name: 'ShutdownCron',
      description: '定时关机软件',
      version: require('./package.json').version,
      noMsi: false,
      setupExe: '定时关机软件安装包.exe',
      createDesktopShortcut: true,
      createStartMenuShortcut: true
    });

    console.log('Windows安装包生成成功！');
  } catch (error) {
    console.error('生成安装包失败:', error.message);
    process.exit(1);
  }
}

createInstaller();