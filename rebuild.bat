@echo off
echo [1/4] 正在关闭相关进程...
taskkill /f /im "海豚定时关机.exe"

echo [2/4] 清理构建文件夹内容...
if exist dist_electron (del /f /q /s dist_electron\*.* >nul 2>nul && for /d %%i in (dist_electron\*) do rd /s /q "%%i")
if exist dist (del /f /q /s dist\*.* >nul 2>nul && for /d %%i in (dist\*) do rd /s /q "%%i")
if exist dist-packager (del /f /q /s dist-packager\*.* >nul 2>nul && for /d %%i in (dist-packager\*) do rd /s /q "%%i")

echo [3/4] 构建项目...
npm run electron:build

echo [4/4] 打包安装包...
npm run electron:nsis

echo ==========================================
echo 任务完成！请去 dist 查看安装包。
echo ==========================================
pause