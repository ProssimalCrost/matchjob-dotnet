# MatchJob

> Plataforma que conecta profissionais autônomos a clientes.
> Backend .NET 8 · Frontend Next.js · Mobile React Native + Expo

---

## Estrutura do Monorepo

```
matchjob-dotnet/
├── back/                         ← API REST (.NET 8 + PostgreSQL)
│   ├── Controllers/
│   │   ├── AuthController.cs        GET /auth/me | POST /auth/sync-user
│   │   ├── ProfessionalController.cs  GET|POST|PUT /professionals
│   │   ├── ReviewsController.cs     GET|POST /professionals/{id}/reviews
│   │   ├── CategoryController.cs    GET /categories
│   │   ├── TagController.cs         GET /categories/{id}/tags
│   │   ├── FavoriteController.cs    GET|POST|DELETE /favorites
│   │   ├── ConversationController.cs  POST|GET /conversations
│   │   ├── MessageController.cs     POST|GET /messages
│   │   └── ServiceRequestController.cs  CRUD /service-requests
│   ├── Services/
│   ├── Models/
│   ├── DTOs/
│   ├── Data/
│   │   ├── AppDbContext.cs
│   │   └── DataSeeder.cs            ← seed de categorias e tags
│   ├── Migrations/
│   ├── Program.cs                   ← DI + Auth Supabase (JWKS RS256) + CORS
│   └── appsettings.json
│
├── front/                        ← Web (Next.js 16 + React 19 + Supabase SSR)
│   └── src/
│       ├── core/
│       │   ├── api/api.ts           ← axios com interceptor JWT
│       │   └── supabase/            ← client e server Supabase
│       └── features/
│           ├── auth/
│           ├── professionals/
│           ├── reviews/
│           ├── favorites/
│           ├── chat/
│           └── services/
│
├── mobile/                       ← App Mobile (React Native + Expo SDK 51)
│   ├── app/                         ← Expo Router (file-based routing)
│   │   ├── _layout.tsx              AuthProvider + Stack
│   │   ├── index.tsx                guarda de rota
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── complete-profile.tsx     obrigatório após cadastro
│   │   ├── home.tsx
│   │   ├── professionals/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── messages/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── requests/index.tsx
│   │   ├── profile/
│   │   │   ├── index.tsx
│   │   │   └── edit.tsx
│   │   └── settings.tsx
│   └── src/
│       ├── features/auth/context/   AuthContext + useAuth hook
│       ├── services/                api.ts, supabase.ts, *Service.ts
│       ├── types/                   professional, review, message, request…
│       └── shared/components/       Button, Input, Card, StarRating, BottomTabBar…
│
├── docker-compose.yml            ← Backend + Frontend + PostgreSQL + Redis
└── comandos.txt                  ← Referência rápida de comandos
```

---

## Stack

| Camada   | Tecnologia                                         |
|----------|----------------------------------------------------|
| Backend  | .NET 8, ASP.NET Core, EF Core, PostgreSQL          |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS     |
| Mobile   | React Native 0.74, Expo SDK 51, Expo Router v3     |
| Auth     | Supabase Auth (email/senha + Google OAuth)         |
| HTTP     | Axios (frontend/mobile) → JWT Supabase nos headers |

---

## Autenticação

O projeto usa **Supabase Auth** como provedor de identidade.

- Login/cadastro via `supabase.auth.signInWithPassword()` ou `signUp()`
- O `access_token` retornado pelo Supabase é enviado em todas as requisições ao backend: `Authorization: Bearer <token>`
- O backend valida o JWT via **OIDC/JWKS (RS256)** — sem gerar tokens próprios
- Após qualquer login, deve-se chamar `POST /auth/sync-user` para criar/sincronizar o usuário na tabela local
- JSON do backend: **PascalCase** (`PropertyNamingPolicy = null`)

---

## Endpoints principais

### Auth
| Método | Rota               | Auth | Descrição                          |
|--------|--------------------|------|------------------------------------|
| GET    | /auth/me           | ✅   | Retorna/cria usuário local pelo JWT |
| POST   | /auth/sync-user    | ✅   | Alias de /auth/me (POST)           |

### Profissionais
| Método | Rota                          | Auth | Descrição                         |
|--------|-------------------------------|------|-----------------------------------|
| GET    | /professionals                | —    | Lista com filtros + paginação      |
| GET    | /professionals/me             | ✅   | Meu perfil profissional (404 se não criado) |
| POST   | /professionals/me             | ✅   | Cria meu perfil profissional       |
| PUT    | /professionals/me             | ✅   | Atualiza meu perfil                |
| GET    | /professionals/{id}           | —    | Perfil por ID                      |
| GET    | /professionals/{id}/reviews   | —    | Avaliações do profissional         |
| POST   | /professionals/{id}/reviews   | ✅   | Criar avaliação                    |

### Categorias e Tags
| Método | Rota                    | Auth | Descrição             |
|--------|-------------------------|------|-----------------------|
| GET    | /categories             | —    | Todas as categorias   |
| GET    | /categories/{id}/tags   | —    | Tags por categoria    |

### Favoritos
| Método | Rota                                 | Auth | Descrição              |
|--------|--------------------------------------|------|------------------------|
| GET    | /favorites                           | ✅   | Meus favoritos         |
| POST   | /favorites/{professionalProfileId}   | ✅   | Adicionar favorito     |
| DELETE | /favorites/{professionalProfileId}   | ✅   | Remover favorito       |
| GET    | /favorites/{professionalProfileId}/check | ✅ | Verificar se favoritado |

### Mensagens
| Método | Rota                          | Auth | Descrição                     |
|--------|-------------------------------|------|-------------------------------|
| GET    | /conversations/user/{userId}  | ✅   | Minhas conversas               |
| POST   | /conversations                | ✅   | Criar ou buscar conversa       |
| GET    | /messages/{conversationId}    | ✅   | Mensagens de uma conversa      |
| POST   | /messages                     | ✅   | Enviar mensagem                |

### Pedidos de Serviço
| Método | Rota                              | Auth | Descrição                    |
|--------|-----------------------------------|------|------------------------------|
| GET    | /service-requests/me              | ✅   | Meus pedidos                 |
| POST   | /service-requests                 | ✅   | Criar pedido                 |
| PATCH  | /service-requests/{id}/status     | ✅   | Atualizar status             |

**Status possíveis:** `Pending` → `Accepted` / `Rejected` → `InProgress` → `Completed` / `Canceled`

---

## Regra de negócio central

Todo usuário registrado é **simultaneamente cliente e profissional**. Após o cadastro, é obrigatório criar um `ProfessionalProfile` (tela `/complete-profile` no mobile, `/profile/setup` na web) antes de acessar o restante do app.

---

## Rodando em desenvolvimento

Veja o arquivo **`comandos.txt`** na raiz do projeto para todos os comandos passo a passo.

### Resumo rápido

```bash
# 1. Backend
cd back && dotnet run

# 2. Frontend web
cd front && npm install && npm run dev

# 3. Mobile
cd mobile && npm install && npx expo start

# 4. Tudo via Docker
docker compose up --build
```

---

## Variáveis de ambiente

### Backend — `back/appsettings.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=matchjob;Username=postgres;Password=postgres"
  },
  "Supabase": {
    "Url": "https://SEU_PROJETO.supabase.co"
  }
}
```

### Frontend Web — `front/.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-anon-key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Mobile — `mobile/.env`
```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
EXPO_PUBLIC_API_URL=http://localhost:5000
# Android emulator: use http://10.0.2.2:5000 no lugar de localhost
```

---

## Swagger

Com o backend rodando: **http://localhost:5000/swagger**

Para testar rotas protegidas:
1. Faça login no Supabase e copie o `access_token`
2. Clique em **Authorize** → cole o token → **Authorize**

---

## Possíveis problemas

| Problema | Solução |
|---|---|
| `dotnet: command not found` | Instale .NET SDK 8 em https://dot.net/download |
| Falha na conexão com PostgreSQL | Verifique se o serviço está rodando e as credenciais no `appsettings.json` |
| Mobile não conecta ao backend | Use `http://10.0.2.2:5000` no Android emulator ou o IP da máquina no celular físico |
| `expo: command not found` | `npm install -g expo-cli` ou use `npx expo` |
| Tabelas não existem | Rode `dotnet ef database update` ou deixe o `EnsureCreated` criar na primeira execução |
| Porta 5000 ocupada | Edite `back/Properties/launchSettings.json` → troque para 5001 |

---

*MatchJob — .NET 8 + Next.js + Expo 🚀*
