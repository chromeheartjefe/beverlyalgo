@echo off
rem Starts the EntrixAlgo admin console hidden, with a tray icon (bottom right).
rem Right-click the tray icon to open, restart, see the log, or stop it.
rem Works from this folder or copied anywhere (falls back to the repo path).
set "TRAY=%~dp0"
if not exist "%TRAY%admin-tray.vbs" set "TRAY=D:\EntrixAlgo\Website\EntrixAlgo\admin\tray\"
start "" wscript.exe "%TRAY%admin-tray.vbs"
