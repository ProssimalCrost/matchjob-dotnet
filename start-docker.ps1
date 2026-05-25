# Script para iniciar Docker e construir imagens do MatchJob

$dockerPath = "C:\Program Files\Docker\Docker\Docker.exe"
$projectDir = "c:\Users\asseit.SESI\Documents\matchjob-dotnet"

# Verifica se Docker está instalado
if (-not (Test-Path $dockerPath)) {
    Write-Host "❌ Docker não encontrado em: $dockerPath" -ForegroundColor Red
    Write-Host "Por favor, instale Docker Desktop em: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host "🐳 Iniciando Docker Desktop..." -ForegroundColor Cyan
Start-Process -FilePath $dockerPath

# Aguarda o Docker ficar pronto
Write-Host "⏳ Aguardando Docker estar pronto..." -ForegroundColor Yellow
$retries = 0
$maxRetries = 30

while ($retries -lt $maxRetries) {
    try {
        docker ps | Out-Null
        Write-Host "✓ Docker está pronto!" -ForegroundColor Green
        break
    }
    catch {
        $retries++
        if ($retries -eq $maxRetries) {
            Write-Host "❌ Docker não ficou pronto após $maxRetries tentativas" -ForegroundColor Red
            exit 1
        }
        Write-Host "  Tentativa $retries/$maxRetries..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

# Navega para o diretório
Set-Location -Path $projectDir
Write-Host "📁 Diretório: $(Get-Location)" -ForegroundColor Cyan

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔨 Construindo imagens Docker..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
docker-compose build

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Iniciando containers..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 Status dos containers..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Conclusão!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Cyan
Write-Host "  • Frontend (Next.js):  http://localhost:3000" -ForegroundColor White
Write-Host "  • Backend API (.NET):   http://localhost:8080" -ForegroundColor White
Write-Host "  • SQL Server:           localhost:1433" -ForegroundColor White
Write-Host "  • Redis:                localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "📝 Comandos úteis:" -ForegroundColor Cyan
Write-Host "  Ver logs:        docker-compose logs -f" -ForegroundColor Gray
Write-Host "  Parar containers: docker-compose down" -ForegroundColor Gray
Write-Host "  Logs backend:    docker-compose logs -f backend" -ForegroundColor Gray
Write-Host "  Logs frontend:   docker-compose logs -f frontend" -ForegroundColor Gray
Write-Host ""
