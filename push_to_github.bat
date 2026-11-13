@echo off
title Push Abwab Al-Jinan to GitHub
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0push_script.ps1"
if %ERRORLEVEL% neq 0 (
    echo.
    pause
)
