[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

Clear-Host
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "    أبواب الجنان - المساعد الذكي لرفع التحديثات إلى GitHub" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$gitExe = 'git'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    $candidates = @(
        "C:\Users\hossam\AppData\Local\hermes\tools\git-2.53.0+3-win32-x64\cmd\git.exe",
        "C:\Program Files\Git\cmd\git.exe",
        "C:\Program Files (x86)\Git\cmd\git.exe"
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) {
            $gitExe = $c
            break
        }
    }
}

Set-Location -Path $PSScriptRoot

$currentRemote = (& $gitExe remote get-url origin 2>$null)

if ($currentRemote) {
    Write-Host "[✓] تم العثور على مستودع مرتبط مسبقاً:" -ForegroundColor Green
    Write-Host "    $currentRemote" -ForegroundColor Cyan
    Write-Host ""
    $answer = Read-Host "اضغط Enter للمتابعة والرفع مباشرة، أو اكتب رابطاً جديداً"
    if (-not [string]::IsNullOrWhiteSpace($answer)) {
        $repoUrl = $answer.Trim().Trim('"').Trim("'")
        & $gitExe remote remove origin 2>$null
        & $gitExe remote add origin $repoUrl
    }
} else {
    Write-Host "[1] خطوة ربط المستودع:" -ForegroundColor Green
    Write-Host "الصق رابط المستودع من GitHub هنا (مثال: https://github.com/username/repo.git):"
    $repoUrl = Read-Host "الرابط"
    if ($repoUrl) {
        $repoUrl = $repoUrl.Trim().Trim('"').Trim("'")
    }
    if ([string]::IsNullOrWhiteSpace($repoUrl)) {
        Write-Host "[!] لم يتم إدخال رابط." -ForegroundColor Red
        Read-Host "اضغط Enter للإغلاق"
        exit 1
    }
    & $gitExe remote remove origin 2>$null
    & $gitExe remote add origin $repoUrl
}

Write-Host ""
Write-Host "جاري فحص التعديلات وتجهيز الملفات..." -ForegroundColor Yellow
& $gitExe branch -M main
& $gitExe add .
& $gitExe commit -m "Update: Crescent left, 10 authentic Azkar, GPS prayers, and smart dashboard" 2>$null

Write-Host ""
Write-Host "جاري رفع التحديثات إلى GitHub (Push)..." -ForegroundColor Yellow
& $gitExe push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "  تهانينا! تم رفع كامل التحديثات بنجاح إلى GitHub" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "ماذا يحدث الآن تلقائياً؟" -ForegroundColor Yellow
    Write-Host "1. سيقوم GitHub Pages بتحديث الموقع أونلاين فوراً." -ForegroundColor Cyan
    Write-Host "2. ستبدأ خدمة GitHub Actions ببناء ملف الـ APK المحدث تلقائياً." -ForegroundColor Cyan
    Write-Host "3. يمكنك تحميل الـ APK من تبويب Actions في صفحة المستودع:" -ForegroundColor Cyan
    Write-Host "   https://github.com/ahmedseleem06-creator/abwab-algnan/actions" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[!] حدث خطأ أثناء الرفع." -ForegroundColor Red
    Write-Host "تأكد من اتصالك بالإنترنت وتسجيل الدخول إلى GitHub." -ForegroundColor Red
    Write-Host ""
}

Read-Host "اضغط Enter للإغلاق"
