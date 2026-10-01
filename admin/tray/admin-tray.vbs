' Runs admin-tray.ps1 with no console window at all (not even a flash).
' This is what the Windows startup shortcut points to.
Set fso = CreateObject("Scripting.FileSystemObject")
here = fso.GetParentFolderName(WScript.ScriptFullName)
ps1 = here & "\admin-tray.ps1"
CreateObject("WScript.Shell").Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -STA -File """ & ps1 & """", 0, False
