@echo off
setlocal
set PROJECT_DIR="haber 2\haber 1\haber"

echo ==========================================
echo       Haber Portali Baslatiliyor
echo ==========================================

if not exist %PROJECT_DIR% (
    echo [HATA] Proje dizini bulunamadi: %PROJECT_DIR%
    pause
    exit /b 1
)

cd %PROJECT_DIR%

if not exist node_modules (
    echo [BILGI] node_modules bulunamadi, paketler yukleniyor...
    call npm install
)

echo [BILGI] Sunucu baslatiliyor (npm run dev)...
call npm run dev

pause
