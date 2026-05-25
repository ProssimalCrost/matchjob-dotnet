# 🐳 Guia de Docker — MatchJob

## ⚙️ Pré-requisitos

- Docker Desktop instalado ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose (incluído no Docker Desktop)

## 🚀 Iniciar com Docker

### Option 1: PowerShell (Recomendado)

```powershell
# Abra o PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\start-docker.ps1
```

### Option 2: CMD (Batch)

```bash
start-docker.bat
```

### Option 3: Manual

```bash
# Navegar até o projeto
cd c:\Users\asseit.SESI\Documents\matchjob-dotnet

# Fazer build das imagens
docker-compose build

# Iniciar os containers
docker-compose up -d

# Verificar status
docker-compose ps
```

## 🌐 Acessar a Aplicação

| Serviço       | URL/Porta           | Descrição               |
|---------------|---------------------|-------------------------|
| Frontend      | http://localhost:3000 | Next.js - Interface web |
| Backend API   | http://localhost:8080 | .NET 8 - API Rest       |
| SQL Server    | localhost:1433      | Banco de dados          |
| Redis         | localhost:6379      | Cache                   |

## 📊 Monitorar Containers

```bash
# Ver logs em tempo real (todos os serviços)
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f sqlserver
docker-compose logs -f redis

# Ver status dos containers
docker-compose ps

# Acessar shell de um container
docker-compose exec backend bash
docker-compose exec frontend sh

# Ver uso de recursos
docker stats
```

## 🛑 Parar os Containers

```bash
# Parar e remover containers (mantém dados)
docker-compose down

# Parar, remover containers E volumes (limpa tudo)
docker-compose down -v

# Parar apenas
docker-compose stop

# Reiniciar
docker-compose restart
```

## 🧪 Testar os Serviços

### Backend API
```bash
# Health check
curl http://localhost:8080/health

# Swagger/OpenAPI
curl http://localhost:8080/swagger
```

### Frontend
```bash
# Apenas acesse http://localhost:3000 no navegador
```

## 🔧 Build Apenas

```bash
# Fazer rebuild das imagens (se houver mudanças no código)
docker-compose build --no-cache

# Build de um serviço específico
docker-compose build backend --no-cache
docker-compose build frontend --no-cache
```

## 📝 Variáveis de Ambiente

As variáveis estão configuradas no `docker-compose.yml`:

### Backend
```env
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Server=sqlserver;Database=MatchJobDb;User Id=sa;Password=MatchJob@2024!;TrustServerCertificate=True
Redis__Connection=redis:6379
Supabase__Url=https://your-project.supabase.co
```

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NODE_ENV=production
```

## ⚠️ Troubleshooting

### Docker não inicia
- Verifique se Docker Desktop está instalado
- Reinicie Docker Desktop
- Verifique se o hyper-V está ativado (Windows)

### Port 3000 ou 8080 já em uso
```bash
# Encontrar o processo usando a porta
netstat -ano | findstr :3000

# Matar o processo
taskkill /PID <PID> /F

# Ou mudar a porta no docker-compose.yml
```

### Banco de dados não conecta
```bash
# Verificar logs do SQL Server
docker-compose logs sqlserver

# Reconectar ao banco
docker-compose restart sqlserver
```

### Rebuild completo (limpar cache)
```bash
# Remove tudo e começa do zero
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 📦 Imagens Docker

As imagens usam multi-stage build para otimização:

- **Backend**: `mcr.microsoft.com/dotnet/aspnet:8.0` (~500MB)
- **Frontend**: `node:20-alpine` (~170MB)
- **Database**: `mcr.microsoft.com/mssql/server:2022-latest` (~1.5GB)
- **Cache**: `redis:7-alpine` (~30MB)

## 🔒 Segurança

Em produção:
- Altere as senhas padrão (especialmente SQL Server)
- Use secrets gerenciados (Azure Key Vault, Docker Secrets)
- Configure HTTPS/TLS
- Use usuários não-root nos containers
- Configure network policies adequadas

## 📚 Referências

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [.NET 8 Docker Images](https://hub.docker.com/_/microsoft-dotnet)
- [Node.js Docker Images](https://hub.docker.com/_/node)
