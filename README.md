# 海豚定时关机软件

一个简洁易用的定时关机工具，支持预设时间和自定义倒计时功能。

## 功能特性

- ✅ 支持预设时间（5分钟、10分钟、30分钟、1小时）
- ✅ 支持自定义倒计时（分钟）
- ✅ 支持自定义关机时刻
- ✅ 系统托盘常驻，可随时关闭窗口
- ✅ 单实例应用，防止重复打开
- ✅ 支持窗口最小化、最大化、关闭操作
- ✅ 免安装版本，直接运行即可

## 技术栈

- Electron 26.6.10
- Vue 3.3.4
- Vite 4.5.14

## 快速开始

### 免安装版本

1. 下载 `海豚定时关机 1.1.0.exe` 文件
2. 双击运行即可，无需安装

### 开发环境

1. 安装依赖
```bash
npm install
```

2. 开发模式运行
```bash
npm run dev
```

3. 构建生产版本
```bash
npm run build
```

4. 启动 Electron 开发模式
```bash
npm run electron:dev
```

5. 打包免安装版本（单个exe文件）
```bash
npm run electron:portable
```

6. 打包安装包版本
```bash
npm run dist
```

## 目录结构

```
shutdown-cron/
├── public/          # 静态资源
│   ├── app.ico     # 应用图标
├── src/             # 源代码
│   ├── App.vue     # 主界面组件
├── main.js          # Electron 主进程
├── preload.js       # 预加载脚本
├── index.html       # 主页面
├── package.json     # 项目配置
└── README.md        # 项目说明
```

## 使用说明

### 预设时间

点击预设按钮（5分钟、10分钟、30分钟、1小时）即可快速设置关机时间。

### 自定义倒计时

1. 在"自定义倒计时"输入框中输入分钟数
2. 点击"开始"按钮启动倒计时

### 自定义时刻

1. 在"自定义时刻"选择小时和分钟
2. 点击"设置"按钮设置关机时间

### 取消关机

点击"取消关机"按钮可以取消已设置的关机任务。

### 系统托盘

- 点击托盘图标可以显示/隐藏主窗口
- 右键托盘图标可以退出软件

## 打包说明

### 免安装版本

使用 `electron-builder` 的 `portable` 目标打包单个 exe 文件：
```bash
npm run electron:portable
```

生成的文件位于 `dist_electron\海豚定时关机 1.1.0.exe`

### 安装包版本

使用 `electron-builder` 的 `nsis` 目标打包安装包：
```bash
npm run dist
```

生成的文件位于 `dist_electron\海豚定时关机_Setup_1.1.0.exe`

## 配置说明

### 修改图标

将 `public/app.ico` 替换为您的自定义图标文件。

### 修改应用名称

在 `package.json` 中修改 `productName` 字段。

### 修改版本号

在 `package.json` 中修改 `version` 字段。

## 注意事项

- 运行软件需要 Windows 操作系统
- 需要管理员权限才能执行关机操作
- 软件会常驻系统托盘，关闭窗口后仍在后台运行

## 许可证

MIT License

## 支持开发者
- 开发者 闻海南
- 联系方式 whndeweilai@163.com
- 支持赞助、定制化服务

## 收款码
![alt text](public/pay.png)