@echo off
REM Script para iniciar Docker e construir imagens do MatchJob

echo Iniciando Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker.exe"

REM Aguarda o Docker ficar pronto
timeout /t 15 /nobreak
echo Aguardando Docker estar pronto...
:wait_docker
docker ps >nul 2>&1
if errorlevel 1 (
    echo Docker ainda não está pronto, aguardando...
    timeout /t 5 /nobreak
    goto wait_docker
)

echo Docker está pronto!
echo.
echo Navegando para o diretório do projeto...
cd /d c:\Users\asseit.SESI\Documents\matchjob-dotnet

echo.
echo ========================================
echo Construindo imagens Docker...
echo ========================================
docker-compose build

echo.
echo ========================================
echo Iniciando containers...
echo ========================================
docker-compose up -d

echo.
echo ========================================
echo Verificando status dos containers...
echo ========================================
docker-compose ps

echo.
echo ========================================
echo ✓ Conclusão!
echo ========================================
echo.
echo URLs:
echo - Frontend (Next.js): http://localhost:3000
echo - Backend API (.NET):  http://localhost:8080
echo - SQL Server:          localhost:1433
echo - Redis:               localhost:6379
echo.
echo Para ver logs:
echo   docker-compose logs -f
echo.
echo Para parar os containers:
echo   docker-compose down
echo.

pause
