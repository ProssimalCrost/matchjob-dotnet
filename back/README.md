# MatchJob Backend — .NET 8

> API REST com ASP.NET Core 8, Entity Framework Core e PostgreSQL.

---

## Estrutura do Projeto

```
matchjob-dotnet/
├── Controllers/
│   ├── AuthController.cs           ← POST /auth/register | login
│   ├── ProfessionalController.cs   ← GET/POST /professionals
│   ├── ConversationController.cs   ← POST/GET /conversations
│   └── MessageController.cs        ← POST/GET /messages
├── Services/
│   ├── AuthService.cs
│   ├── ProfessionalProfileService.cs
│   ├── ConversationService.cs
│   └── MessageService.cs
├── Models/
│   ├── User.cs
│   ├── ProfessionalProfile.cs
│   ├── Conversation.cs
│   └── Message.cs
├── DTOs/
│   ├── AuthDtos.cs
│   └── OtherDtos.cs
├── Data/
│   ├── AppDbContext.cs              ← EF Core DbContext
│   └── DataSeeder.cs               ← Seed inicial
├── Security/
│   └── JwtService.cs               ← Geração de tokens JWT
├── Properties/
│   └── launchSettings.json         ← Porta 5000
├── Program.cs                      ← Ponto de entrada + DI + Middleware
├── appsettings.json                ← Conexão DB + JWT
├── MatchJob.csproj
├── MatchJob_Postman_Collection_DotNet.json
└── matchjob-app-api.js             ← api.js atualizado para porta 5000
```

---

## Pré-requisitos

| Ferramenta   | Versão | Download                          |
|--------------|--------|-----------------------------------|
| .NET SDK     | 8.0+   | https://dot.net/download          |
| PostgreSQL   | 14+    | https://www.postgresql.org        |

---

## 1. Configurar o Banco de Dados

```sql
-- No psql ou pgAdmin:
CREATE DATABASE matchjob;
```

Se seu PostgreSQL usar usuário/senha diferente de `postgres/postgres`,
edite o arquivo `appsettings.json`:

```json
"DefaultConnection": "Host=localhost;Port=5432;Database=matchjob;Username=SEU_USER;Password=SUA_SENHA"
```

---

## 2. Rodar o Backend

```bash
# Entre na pasta
cd matchjob-dotnet

# Restaura pacotes NuGet e sobe o servidor
dotnet run
```

Primeiro boot: o EF Core cria as tabelas e o seeder popula o banco:

```
✅ MatchJob API rodando!
   Swagger: http://localhost:5000/swagger

🌱 Seed: populando banco com dados iniciais...
✅ Seed concluído!
   Profissional: carlos@matchjob.com / 123456
   Profissional: ana@matchjob.com    / 123456
   Cliente:      joao@matchjob.com   / 123456
```

### Swagger UI

Abra no navegador: **http://localhost:5000/swagger**

Para testar rotas protegidas no Swagger:
1. Clique em **POST /auth/login** → Execute → copie o `Token`
2. Clique em **Authorize** (cadeado no topo) → cole o token → **Authorize**
3. Use qualquer endpoint normalmente

---

## 3. Atualizar o App Mobile

Copie o arquivo `matchjob-app-api.js` para `matchjob-app/services/api.js`
(substitui o arquivo original que apontava para a porta 8080).

```bash
cp matchjob-app-api.js ../matchjob-app/services/api.js
```

> O backend .NET roda na **porta 5000** (em vez de 8080 do Spring).

---

## 4. Endpoints

### Auth (públicos)

| Método | Rota            | Descrição         |
|--------|-----------------|-------------------|
| POST   | /auth/register  | Cadastrar usuário |
| POST   | /auth/login     | Fazer login       |

**Body (PascalCase — padrão .NET):**
```json
{
  "Name": "João Silva",
  "Email": "joao@email.com",
  "Password": "123456",
  "Role": "CLIENT"
}
```

> ⚠️ **Diferença do Spring:** O .NET usa **PascalCase** no JSON (`Name`, `Email`).
> O frontend já trata isso pelo axios — os campos JavaScript em camelCase
> são enviados e o .NET aceita ambos por padrão.

---

### Profissionais (JWT obrigatório)

| Método | Rota                          | Descrição             |
|--------|-------------------------------|-----------------------|
| GET    | /professionals                | Lista todos           |
| GET    | /professionals?category=X     | Filtra por categoria  |
| GET    | /professionals?location=X     | Filtra por cidade     |
| GET    | /professionals?tag=X          | Filtra por habilidade |
| GET    | /professionals/{id}           | Busca por ID          |
| POST   | /professionals?userId=1       | Cria/atualiza perfil  |

### Conversas e Mensagens (JWT obrigatório)

| Método | Rota                        | Descrição                  |
|--------|-----------------------------|----------------------------|
| POST   | /conversations              | Cria conversa              |
| GET    | /conversations/user/{id}    | Conversas do usuário       |
| POST   | /messages                   | Envia mensagem             |
| GET    | /messages/{conversationId}  | Lista mensagens da conversa|

---

## 5. Testando com Postman

1. Importe `MatchJob_Postman_Collection_DotNet.json`
2. Execute **Login — Cliente de teste**
3. Copie o `Token` da resposta
4. Edite a variável `token` da collection e cole o valor
5. Use os demais endpoints

---

## 6. Comparativo Spring Boot vs .NET

| Item               | Spring Boot (Java)       | .NET 8 (C#)                     |
|--------------------|--------------------------|----------------------------------|
| Porta padrão       | 8080                     | 5000                             |
| JSON padrão        | camelCase                | PascalCase                       |
| ORM                | Spring Data JPA          | Entity Framework Core            |
| Autenticação       | Spring Security + JWT    | ASP.NET Auth + JwtBearer         |
| Injeção dependência| @Autowired / @Bean       | AddScoped / AddSingleton         |
| Documentação       | (Springdoc opcional)     | Swagger integrado (/swagger)     |
| Seed de dados      | CommandLineRunner        | IHost + EnsureCreated            |
| Hash de senha      | BCryptPasswordEncoder    | BCrypt.Net-Next                  |

---

## 7. Possíveis Problemas

**`dotnet: command not found`**
→ Instale o .NET SDK em https://dot.net/download

**`Connection refused` no PostgreSQL**
→ Verifique se o PostgreSQL está rodando e se as credenciais no `appsettings.json` estão corretas

**App mobile não conecta**
→ O backend agora é na porta **5000**. Atualize o `api.js` com `http://SEU_IP:5000`

**Erro de migration / tabela não existe**
→ O `EnsureCreated()` cria as tabelas automaticamente. Se der erro, apague o banco e recrie:
```sql
DROP DATABASE matchjob;
CREATE DATABASE matchjob;
```
Depois reinicie com `dotnet run`.

---

*MatchJob MVP — .NET 8 Edition 🚀*
