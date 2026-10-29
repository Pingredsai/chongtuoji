param(
  [int]$Port = 4173
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $root
try {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw '未找到 Node.js，请先安装 Node.js 18 或更高版本。'
  }

  $candidates = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -match '^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)' -and
      $_.PrefixOrigin -ne 'WellKnown' -and
      $_.InterfaceAlias -notmatch 'Loopback|vEthernet|WSL|Docker|Meta|Hyper-V|蓝牙|本地连接'
    }

  $preferred = $candidates |
    Where-Object { $_.InterfaceAlias -match 'WLAN|Wi-Fi|Wireless|无线' } |
    Select-Object -First 1
  if (-not $preferred) {
    $preferred = $candidates | Where-Object { $_.InterfaceAlias -match '以太网|Ethernet' } | Select-Object -First 1
  }
  if (-not $preferred) {
    $preferred = $candidates | Select-Object -First 1
  }
  if (-not $preferred) {
    throw '未找到局域网 IPv4 地址，请确认电脑已连接 Wi-Fi 或局域网。'
  }
  $ip = $preferred.IPAddress
  $otherIps = $candidates | Select-Object -ExpandProperty IPAddress -Unique | Where-Object { $_ -ne $ip }

  $env:HOST = '0.0.0.0'
  $env:PORT = [string]$Port
  Write-Host ''
  Write-Host '宠托记手机试玩已启动' -ForegroundColor Green
  Write-Host "电脑访问：http://127.0.0.1:$Port"
  Write-Host "手机访问：http://${ip}:$Port" -ForegroundColor Cyan
  if ($otherIps) {
    Write-Host "如果打不开，也可以尝试：$((($otherIps | ForEach-Object { "http://${_}:$Port" }) -join '  '))" -ForegroundColor DarkGray
  }
  Write-Host ''
  Write-Host '手机和电脑必须连接同一个 Wi-Fi。' -ForegroundColor Yellow
  Write-Host '如果 Windows 防火墙弹窗，请只允许“专用网络”。' -ForegroundColor Yellow
  Write-Host '按 Ctrl+C 停止服务。'
  Write-Host ''
  node server.mjs
} finally {
  Pop-Location
}