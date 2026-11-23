@echo off
start "ELIA Backend" cmd /k "cd /d C:\Users\esmej\Downloads\ELIA\backend && .venv\Scripts\activate && uvicorn main:app --reload --port 8000"
start "ELIA Frontend" cmd /k "cd /d C:\Users\esmej\Downloads\ELIA\frontend && npm run dev"
timeout /t 4 >nul
start http://localhost:3000