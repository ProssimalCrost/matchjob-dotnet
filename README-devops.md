# MatchJob — Infraestrutura DevOps

## Estrutura de arquivos

```
matchjob/
├── docker/
│   ├── frontend/Dockerfile        # Next.js (multi-stage)
│   └── backend/Dockerfile         # .NET 8 (multi-stage)
├── docker-compose.yml             # Ambiente local completo
├── k8s/
│   ├── namespace.yaml
│   ├── configmap-secrets.yaml
│   ├── ingress.yaml
│   ├── backend/deployment.yaml    # Deployment + Service + HPA
│   └── frontend/deployment.yaml   # Deployment + Service + HPA
├── .github/workflows/
│   ├── ci.yml                     # CI: testes + build + push imagem
│   └── cd.yml                     # CD: deploy no AKS
└── tests/
    ├── backend/                   # xUnit + Moq + FluentAssertions
    └── frontend/                  # Jest + React Testing Library
```

## Pré-requisitos

| Ferramenta  | Versão mín. |
|-------------|-------------|
| Docker      | 24+         |
| kubectl     | 1.29+       |
| Azure CLI   | 2.57+       |
| .NET SDK    | 8.0         |
| Node.js     | 20 LTS      |

---

## Desenvolvimento local

```bash
# Subir todos os serviços (DB + Redis + Backend + Frontend)
docker compose up -d

# Ver logs em tempo real
docker compose logs -f backend

# Rodar testes localmente
dotnet test tests/backend/
npm test --prefix tests/frontend
```

---

## Azure — Configuração única

### 1. Criar recursos Azure

```bash
# Login
az login

# Resource Group
az group create --name rg-matchjob-prod --location brazilsouth

# Azure Container Registry
az acr create --resource-group rg-matchjob-prod \
              --name matchjobacr \
              --sku Basic

# AKS
az aks create \
  --resource-group rg-matchjob-prod \
  --name aks-matchjob-prod \
  --node-count 2 \
  --node-vm-size Standard_B2s \
  --attach-acr matchjobacr \
  --generate-ssh-keys
```

### 2. Aplicar manifests Kubernetes

```bash
# Configurar kubectl
az aks get-credentials --resource-group rg-matchjob-prod --name aks-matchjob-prod

# Criar namespace e recursos base
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap-secrets.yaml

# Deploy backend e frontend
kubectl apply -f k8s/backend/deployment.yaml
kubectl apply -f k8s/frontend/deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

### 3. Criar Secret para o ACR no cluster

```bash
kubectl create secret docker-registry acr-secret \
  --docker-server=matchjobacr.azurecr.io \
  --docker-username=$(az acr credential show -n matchjobacr --query username -o tsv) \
  --docker-password=$(az acr credential show -n matchjobacr --query passwords[0].value -o tsv) \
  -n matchjob
```

---

## GitHub Actions — Secrets necessários

Configure em **Settings > Secrets and variables > Actions**:

| Secret           | Descrição                                          |
|------------------|----------------------------------------------------|
| `AZURE_CREDENTIALS` | JSON do Service Principal (`az ad sp create-for-rbac`) |
| `ACR_USERNAME`   | Usuário do ACR                                     |
| `ACR_PASSWORD`   | Senha do ACR                                       |

### Criar Service Principal para o CI/CD

```bash
az ad sp create-for-rbac \
  --name sp-matchjob-cicd \
  --role contributor \
  --scopes /subscriptions/<SUB_ID>/resourceGroups/rg-matchjob-prod \
  --json-auth
```
Cole o JSON inteiro na secret `AZURE_CREDENTIALS`.

---

## Pipeline CI/CD — Fluxo

```
Pull Request → CI (testes + lint + build)
                        ↓ aprovado
Push main   → CI (testes + build imagem + push ACR)
                        ↓ sucesso
             CD (aprovação manual) → kubectl rolling update → AKS
                        ↓ falha
                     Rollback automático
```
