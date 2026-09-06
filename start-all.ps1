# ==============================================================================
# Smart Attendance & Student Risk Management System - Startup Script
# ==============================================================================

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " Starting Smart Attendance & Student Risk Management System..." -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Cyan

$projectRoot = "C:\Users\acer\Desktop\smart-attendance-system"
$toolsPath = "C:\Users\acer\.tools\nodejs;C:\Users\acer\.tools\python;C:\Users\acer\.tools\python\Scripts;"
$env:Path = $toolsPath + $env:Path

# 1. Start Backend Server
Write-Host "[1/3] Launching FastAPI Backend Server on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle = 'Backend - Smart Attendance API'; cd '$projectRoot\backend'; `$env:Path = '$toolsPath' + `$env:Path; python run.py"

Start-Sleep -Seconds 2

# 2. Start Frontend Server
Write-Host "[2/3] Launching Vite Frontend Portal on http://localhost:3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle = 'Frontend - Smart Attendance UI'; cd '$projectRoot\frontend'; `$env:Path = '$toolsPath' + `$env:Path; npm run dev"

Start-Sleep -Seconds 3

# 3. Open Browser
Write-Host "[3/3] Opening Web Application in Default Browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`nAll services successfully launched!" -ForegroundColor Cyan
Write-Host " - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host " - Backend API: http://127.0.0.1:8000" -ForegroundColor White
Write-Host " - Swagger API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
