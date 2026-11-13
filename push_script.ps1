[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

Clear-Host
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "    أبواب الجنان - المساعد الذكي لرفع المشروع إلى GitHub" -ForegroundColor Yellow
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

Write-Host "[1] خطوة إنشاء المستودع:" -ForegroundColor Green
Write-Host "إذا لم تكن قد أنشأت مستودعاً بعد، افتح الرابط التالي وأنشئ مستودعاً جديداً:"
Write-Host "https://github.com/new" -ForegroundColor DarkCyan
Write-Host ""

$repoUrl = Read-Host "الصق رابط المستودع من GitHub هنا (URL)"
if ($repoUrl) {
    $repoUrl = $repoUrl.Trim().Trim('"').Trim("'")
}

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host ""
    Write-Host "[!] لم يتم إدخال رابط. يرجى إعادة المحاولة ولصق الرابط." -ForegroundColor Red
    Write-Host ""
    Read-Host "اضغط Enter للإغلاق"
    exit 1
}

Write-Host ""
Write-Host "جاري ربط المستودع ورفع الملفات إلى GitHub..." -ForegroundColor Yellow
Write-Host ""

Set-Location -Path $PSScriptRoot

& $gitExe remote remove origin 2>$null
& $gitExe remote add origin $repoUrl
& $gitExe branch -M main
& $gitExe push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "  تهانينا! تم رفع كامل المشروع بنجاح إلى GitHub" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "الخطوة القادمة لتشغيل التطبيق على الهاتف:" -ForegroundColor Yellow
    Write-Host "1. ادخل إلى صفحة المستودع على GitHub واضغط Settings."
    Write-Host "2. من القائمة الجانبية اختر Pages."
    Write-Host "3. اختر Deploy from a branch، ثم حدد main واضغط Save."
    Write-Host "4. سيظهر لك رابط الموقع خلال دقيقة واحدة، افتحه من هاتفك لتثبيته كـ App فوراً!" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[!] حدث خطأ أثناء الرفع." -ForegroundColor Red
    Write-Host "تأكد من تسجيل الدخول إلى GitHub أو صحة الرابط المُدخل." -ForegroundColor Red
    Write-Host ""
}

Read-Host "اضغط Enter للإغلاق"
