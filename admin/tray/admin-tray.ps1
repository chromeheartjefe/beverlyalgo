# EntrixAlgo Admin - tray launcher (Windows PowerShell 5.1)
#
# Starts the local admin console with no visible window and puts an icon in
# the taskbar notification area (bottom right).
#
# Fast mode (default): builds an optimised production version once
# (npm run admin:build, about a minute, in the background), then serves it
# (npm run admin:start). Pages load much faster and scroll smoother than the
# development server. "Restart server" rebuilds, so code changes are picked up.
# Dev mode (menu toggle): npm run admin, with live reload while editing code.
# If the build fails, it falls back to dev mode and says so.
#
# Right-click the icon: Open, Restart, Dev mode, Show log, Stop. Double-click
# opens the console. Started by admin-tray.vbs (no console flash).
# Keep this file ASCII only: PowerShell 5.1 reads it in the ANSI code page.

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$TrayDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$AdminDir = Split-Path -Parent $TrayDir
$RepoDir  = Split-Path -Parent $AdminDir
$DataDir  = Join-Path $AdminDir "data"
$LogFile  = Join-Path $DataDir "server.log"
$ModeFile = Join-Path $DataDir "tray-mode.txt"
$Url      = "http://127.0.0.1:3100"
$Port     = 3100

# One tray icon at a time: a second launch just opens the console
$created = $false
$mutex = New-Object System.Threading.Mutex($true, "Local\EntrixAlgoAdminTray", [ref]$created)
if (-not $created) {
    Start-Process $Url
    exit
}

New-Item -ItemType Directory -Force -Path $DataDir | Out-Null

function Test-Port {
    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $async = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
        return ($async.AsyncWaitHandle.WaitOne(300) -and $client.Connected)
    } catch {
        return $false
    } finally {
        $client.Close()
    }
}

# Dev mode is remembered between runs
$script:devMode = (Test-Path $ModeFile) -and ((Get-Content $ModeFile -Raw).Trim() -eq "dev")

$script:proc = $null      # the running cmd.exe (build or server)
$script:phase = "idle"    # idle | building | serving | stopped
$script:ready = $false
$script:stopping = $false

# Runs an npm script hidden, appending its output to the log
function Start-Npm([string]$name, [bool]$fresh) {
    $redirect = if ($fresh) { ">" } else { ">>" }
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "cmd.exe"
    $psi.Arguments = "/d /c npm run $name $redirect `"$LogFile`" 2>&1"
    $psi.WorkingDirectory = $RepoDir
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    return [System.Diagnostics.Process]::Start($psi)
}

function Start-Server {
    $script:stopping = $false
    $script:ready = $false
    if (Test-Port) {
        $script:phase = "serving"
        $script:ready = $true
        Set-Status "EntrixAlgo Admin: already running"
        return
    }
    if ($script:devMode) {
        $script:proc = Start-Npm "admin" $true
        $script:phase = "serving"
        Set-Status "EntrixAlgo Admin: starting (dev mode)..."
    } else {
        $script:proc = Start-Npm "admin:build" $true
        $script:phase = "building"
        Set-Status "EntrixAlgo Admin: building fast version..."
    }
}

function Stop-Server {
    $script:stopping = $true
    if ($script:proc -and -not $script:proc.HasExited) {
        # cmd -> npm -> node and its workers: kill the whole tree
        & taskkill.exe /PID $script:proc.Id /T /F 2>$null | Out-Null
    }
    # Anything else still holding the port (e.g. started before this tray)
    try {
        Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
            ForEach-Object { & taskkill.exe /PID $_.OwningProcess /T /F 2>$null | Out-Null }
    } catch {}
    $script:proc = $null
    $script:ready = $false
    $script:phase = "idle"
}

# Tray icon: the logo colours, a green rounded square with an "E"
function New-TrayIcon {
    $bmp = New-Object System.Drawing.Bitmap 32, 32
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $rect = New-Object System.Drawing.Rectangle 1, 1, 30, 30
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(45, 212, 191), [System.Drawing.Color]::FromArgb(132, 204, 22), 45)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $r = 8
    $path.AddArc(1, 1, $r, $r, 180, 90)
    $path.AddArc(31 - $r, 1, $r, $r, 270, 90)
    $path.AddArc(31 - $r, 31 - $r, $r, $r, 0, 90)
    $path.AddArc(1, 31 - $r, $r, $r, 90, 90)
    $path.CloseFigure()
    $g.FillPath($brush, $path)
    $font = New-Object System.Drawing.Font("Segoe UI", 15, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = [System.Drawing.StringAlignment]::Center
    $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString("E", $font, [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF 0, 1, 32, 32), $fmt)
    $g.Dispose()
    return [System.Drawing.Icon]::FromHandle($bmp.GetHicon())
}

$tray = New-Object System.Windows.Forms.NotifyIcon
$tray.Icon = New-TrayIcon
$tray.Visible = $true

function Set-Status([string]$text) {
    # NotifyIcon tooltips are limited to 63 characters
    if ($text.Length -gt 63) { $text = $text.Substring(0, 63) }
    $tray.Text = $text
}

function Show-Tip([string]$title, [string]$text, $icon) {
    $tray.ShowBalloonTip(4000, $title, $text, $icon)
}

$menu = New-Object System.Windows.Forms.ContextMenuStrip

$openItem = $menu.Items.Add("Open admin console")
$openItem.Font = New-Object System.Drawing.Font($openItem.Font, [System.Drawing.FontStyle]::Bold)
$openItem.add_Click({ Start-Process $Url })

$restartItem = $menu.Items.Add("Restart server (rebuild)")
$restartItem.add_Click({
    Stop-Server
    Start-Sleep -Milliseconds 800
    Start-Server
})

$devItem = New-Object System.Windows.Forms.ToolStripMenuItem("Dev mode (live reload, slower)")
$devItem.CheckOnClick = $true
$devItem.Checked = $script:devMode
$devItem.add_Click({
    $script:devMode = $devItem.Checked
    Set-Content -Path $ModeFile -Value ($(if ($script:devMode) { "dev" } else { "fast" })) -Encoding ascii
    Stop-Server
    Start-Sleep -Milliseconds 800
    Start-Server
})
[void]$menu.Items.Add($devItem)

$logItem = $menu.Items.Add("Show server log")
$logItem.add_Click({
    if (Test-Path $LogFile) { Start-Process notepad.exe $LogFile }
})

[void]$menu.Items.Add((New-Object System.Windows.Forms.ToolStripSeparator))

$quitItem = $menu.Items.Add("Stop admin and exit")
$quitItem.add_Click({
    $timer.Stop()
    Stop-Server
    $tray.Visible = $false
    $tray.Dispose()
    [System.Windows.Forms.Application]::Exit()
})

$tray.ContextMenuStrip = $menu
$tray.add_DoubleClick({ Start-Process $Url })

# Drives build -> serve, announces readiness, notices crashes
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 1500
$timer.add_Tick({
    if ($script:stopping) { return }

    if ($script:phase -eq "building" -and $script:proc -and $script:proc.HasExited) {
        if ($script:proc.ExitCode -eq 0) {
            $script:proc = Start-Npm "admin:start" $false
            $script:phase = "serving"
            Set-Status "EntrixAlgo Admin: starting..."
        } else {
            # Build failed: keep the console usable in dev mode
            $script:proc = Start-Npm "admin" $false
            $script:phase = "serving"
            Set-Status "EntrixAlgo Admin: build failed, dev mode"
            Show-Tip "EntrixAlgo Admin" "The fast build failed, so it started in dev mode. 'Show server log' has the details." ([System.Windows.Forms.ToolTipIcon]::Warning)
        }
        return
    }

    if ($script:phase -eq "serving" -and -not $script:ready -and (Test-Port)) {
        $script:ready = $true
        $label = if ($script:devMode) { "dev mode" } else { "fast mode" }
        Set-Status "EntrixAlgo Admin: running ($label)"
        Show-Tip "EntrixAlgo Admin" "Running at $Url ($label). Double-click the tray icon to open." ([System.Windows.Forms.ToolTipIcon]::Info)
        return
    }

    if ($script:phase -eq "serving" -and $script:proc -and $script:proc.HasExited) {
        $script:proc = $null
        $script:ready = $false
        $script:phase = "stopped"
        Set-Status "EntrixAlgo Admin: stopped (right-click to restart)"
        Show-Tip "EntrixAlgo Admin stopped" "The server exited. Right-click the tray icon to restart or see the log." ([System.Windows.Forms.ToolTipIcon]::Warning)
    }
})

Start-Server
$timer.Start()

try {
    [System.Windows.Forms.Application]::Run()
} finally {
    Stop-Server
    if ($tray) { $tray.Dispose() }
    $mutex.ReleaseMutex()
}
