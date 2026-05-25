#!/bin/bash
# Script para testar a aplicação Docker
# Use: ./test-docker.sh

set -e

echo "════════════════════════════════════════"
echo "🧪 Testando MatchJob Docker"
echo "════════════════════════════════════════"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Timeout em segundos
TIMEOUT=30
INTERVAL=2
ELAPSED=0

# Função para testar endpoint
test_endpoint() {
    local url=$1
    local name=$2
    local expected_code=$3
    
    echo -n "🔍 Testando $name ($url)... "
    
    ELAPSED=0
    while [ $ELAPSED -lt $TIMEOUT ]; do
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
        
        if [ "$response" = "$expected_code" ]; then
            echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
            return 0
        fi
        
        ELAPSED=$((ELAPSED + INTERVAL))
        sleep $INTERVAL
    done
    
    echo -e "${RED}✗ FALHOU${NC} (HTTP $response)"
    return 1
}

# Função para verificar container rodando
check_container() {
    local container=$1
    local name=$2
    
    if docker-compose ps | grep -q "$container.*Up"; then
        echo -e "${GREEN}✓${NC} $name está rodando"
        return 0
    else
        echo -e "${RED}✗${NC} $name não está rodando"
        return 1
    fi
}

echo "📦 Verificando containers..."
check_container "sqlserver" "SQL Server" || exit 1
check_container "redis" "Redis" || exit 1
check_container "backend" "Backend API" || exit 1
check_container "frontend" "Frontend Web" || exit 1

echo ""
echo "🌐 Testando conectividade..."

# Testar Backend
test_endpoint "http://localhost:8080/health" "Backend Health Check" "200" || true
test_endpoint "http://localhost:8080/swagger" "Backend Swagger" "200" || true

# Testar Frontend
test_endpoint "http://localhost:3000" "Frontend" "200" || true

# Testar Database
echo -n "🔍 Testando SQL Server... "
if docker-compose exec -T sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'MatchJob@2024!' -Q 'SELECT 1' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ Falhou${NC}"
fi

# Testar Redis
echo -n "🔍 Testando Redis... "
if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ Falhou${NC}"
fi

echo ""
echo "════════════════════════════════════════"
echo -e "${GREEN}✓ Testes concluídos!${NC}"
echo "════════════════════════════════════════"
echo ""
echo "🌐 URLs para acessar:"
echo "  • Frontend:  http://localhost:3000"
echo "  • Backend:   http://localhost:8080"
echo "  • Swagger:   http://localhost:8080/swagger"
echo ""
echo "📝 Ver logs:"
echo "  docker-compose logs -f"
echo ""
