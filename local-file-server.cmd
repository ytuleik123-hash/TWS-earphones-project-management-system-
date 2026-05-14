@echo off
REM TWS Material Tracker - 本地文件打开助手
REM 在运行 vite preview 的同时，双击运行此脚本
start /B "" "%~dp0node.exe" "%~dp0local-file-server.js" 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo 未找到 node.exe，尝试使用系统 PATH 中的 node
  start /B "" node "%~dp0local-file-server.js"
)
echo 本地文件打开助手已启动 (端口 3456)
echo 关闭此窗口即可停止助手
pause
