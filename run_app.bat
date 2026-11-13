@echo off
chcp 65001 >nul
title أبواب الجنان - تطبيق الاستعداد لرمضان
echo ==============================================================
echo           🌙 أبواب الجنان - تطبيق الاستعداد لرمضان 🌙
echo ==============================================================
echo.
echo جاري تشغيل السيرفر المحلي وفتح التطبيق في متصفحك...
echo الرابط: http://localhost:8085
echo.

start http://localhost:8085

if exist "C:\Users\hossam\AppData\Local\Programs\Python\Python313\python.exe" (
    "C:\Users\hossam\AppData\Local\Programs\Python\Python313\python.exe" server.py
) else (
    python server.py
)

pause
