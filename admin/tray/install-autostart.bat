@echo off
rem Adds the admin console to Windows startup: a shortcut in your Startup
rem folder that launches it hidden with a tray icon when you sign in.
set "TRAY=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$s = (New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Startup') + '\EntrixAlgo Admin.lnk');" ^
  "$s.TargetPath = 'wscript.exe';" ^
  "$s.Arguments = '\"%TRAY%admin-tray.vbs\"';" ^
  "$s.WorkingDirectory = '%TRAY%';" ^
  "$s.Description = 'EntrixAlgo admin console (tray)';" ^
  "$s.Save()"
if errorlevel 1 (
  echo Could not create the startup shortcut.
) else (
  echo Done. The admin console will start hidden with a tray icon each time you sign in.
  echo Starting it now as well...
  start "" wscript.exe "%TRAY%admin-tray.vbs"
)
pause
