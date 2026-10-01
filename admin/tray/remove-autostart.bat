@echo off
rem Removes the admin console from Windows startup (does not stop a running one;
rem use the tray icon's "Stop admin and exit" for that).
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\EntrixAlgo Admin.lnk" 2>nul
if exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\EntrixAlgo Admin.lnk" (
  echo Could not remove the shortcut.
) else (
  echo Removed from startup.
)
pause
