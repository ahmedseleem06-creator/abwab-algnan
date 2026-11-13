@echo off
chcp 65001 >nul
echo ========================================================
echo   أبواب الجنان - المساعد لرفع المشروع إلى GitHub
echo ========================================================
echo.
set /p REPO_URL="انسخ رابط المستودع من GitHub (مثال: https://github.com/username/abwab-aljinan.git): "

if "%REPO_URL%"=="" (
    echo لم يتم إدخال رابط! يرجى إعادة المحاولة.
    pause
    exit /b
)

echo.
echo جاري ربط المستودع ورفع الملفات...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git branch -M main
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo تم رفع المشروع بنجاح إلى GitHub!
    echo الآن يمكنك تفعيل GitHub Pages لتشغيل التطبيق على الهاتف:
    echo 1. ادخل إلى Settings في المستودع
    echo 2. اختر Pages من القائمة الجانبية
    echo 3. اختر Branch: main واضغط Save
    echo ========================================================
) else (
    echo.
    echo حدث خطأ أثناء الرفع، تأكد من تسجيل دخولك في Git أو صحة الرابط.
)

pause
