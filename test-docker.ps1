# test-docker.ps1 - Testar aplicação Docker no Windows
# Use: .\test-docker.ps1

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🧪 Testando MatchJob Docker" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$TIMEOUT = 30
$INTERVAL = 2

# Função para testar endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Name,
        [int]$ExpectedCode = 200
    )
    
    Write-Host -NoNewline "🔍 Testando $Name ($Url)... "
    
    $elapsed = 0
    while ($elapsed -lt $TIMEOUT) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            $statusCode = $response.StatusCode
            
            if ($statusCode -eq $ExpectedCode) {
                Write-Host "✓ OK (HTTP $statusCode)" -ForegroundColor Green
                return $true
            }
        }
        catch {
            $statusCode = "erro"
        }
        
        $elapsed += $INTERVAL
        Start-Sleep -Seconds $INTERVAL
    }
    
    Write-Host "✗ FALHOU (HTTP $statusCode)" -ForegroundColor Red
    return $false
}

# Função para verificar container
function Test-Container {
    param(
        [string]$Container,
        [string]$Name
    )
    
    $status = docker-compose ps | Select-String $Container
    
    if ($status -match "Up") {
        Write-Host "✓ $Name está rodando" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "✗ $Name não está rodando" -ForegroundColor Red
        return $false
    }
}

Write-Host "📦 Verificando containers..." -ForegroundColor Yellow
Test-Container "sqlserver" "SQL Server" | Out-Null
Test-Container "redis" "Redis" | Out-Null
Test-Container "backend" "Backend API" | Out-Null
Test-Container "frontend" "Frontend Web" | Out-Null

Write-Host ""
Write-Host "🌐 Testando conectividade..." -ForegroundColor Yellow

# Testar Backend
Test-Endpoint "http://localhost:8080/health" "Backend Health Check" 200 | Out-Null
Test-Endpoint "http://localhost:8080/swagger" "Backend Swagger" 200 | Out-Null

# Testar Frontend
Test-Endpoint "http://localhost:3000" "Frontend" 200 | Out-Null

# Testar Database
Write-Host -NoNewline "🔍 Testando SQL Server... "
try {
    $sqlResult = docker-compose exec -T sqlserver cmd /c "@echo off & C:\tools\binn\sqlcmd.exe -S localhost -U sa -P 'MatchJob@2024!' -Q 'SELECT 1'" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ OK" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Falhou" -ForegroundColor Red
    }
}
catch {
    Write-Host "✗ Falhou" -ForegroundColor Red
}

# Testar Redis
Write-Host -NoNewline "🔍 Testando Redis... "
try {
    $redisResult = docker-compose exec -T redis redis-cli ping 2>&1
    if ($redisResult -match "PONG") {
        Write-Host "✓ OK" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Falhou" -ForegroundColor Red
    }
}
catch {
    Write-Host "✗ Falhou" -ForegroundColor Red
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✓ Testes concluídos!" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 URLs para acessar:" -ForegroundColor Cyan
Write-Host "  • Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  • Backend:   http://localhost:8080" -ForegroundColor White
Write-Host "  • Swagger:   http://localhost:8080/swagger" -ForegroundColor White
Write-Host ""
Write-Host "📝 Ver logs:" -ForegroundColor Cyan
Write-Host "  docker-compose logs -f" -ForegroundColor Gray
Write-Host ""
