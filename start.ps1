$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $root
try {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw '未找到 Node.js，请先安装 Node.js 18 或更高版本。'
  }
  Write-Host '宠托记 MVP 正在启动...' -ForegroundColor Green
  Write-Host '浏览器打开：http://127.0.0.1:4173'
  node server.mjs
} finally {
  Pop-Location
}