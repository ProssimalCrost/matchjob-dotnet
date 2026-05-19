# AI Instruction Guide — MatchJob Real System

## AI Role

You are a senior software engineering AI responsible for transforming the MatchJob project into a fully functional platform with real authentication, relational database support, user creation, professional profile creation, filters, reviews, favorites, chat and complete frontend-backend integration.

The goal is to make the system ready for real-world field testing without relying on mocked frontend data.

Use this document as the main implementation instruction.

---

# 1. Project Goal

MatchJob is a platform where users can find professionals and also offer their own services.

Core business rule:

> Every user is both a client and a professional at the same time.

In other words, any user can hire someone and also be hired by someone else.

The system must support:

- Real user registration.
- Real login.
- Authentication using Supabase.
- Professional profile creation after registration.
- Complete professional profile editing.
- Photo/avatar upload.
- Real categories loaded from the database.
- Tags linked to professional profiles.
- Real professional listings.
- Search with filters.
- Review system.
- Favorites.
- Chat.
- Contact history.
- Profile verification.
- Smart professional ranking.

---

# 2. Mandatory Rules

## 2.1 Remove frontend mocks

The frontend must no longer use mocked arrays for professionals, categories, reviews, favorites, or conversations.

Mocked data may only exist as database seed data, for example:

- Initial categories.
- Initial tags.
- Test users.
- Test professionals.
- Test reviews.

The frontend must consume real data through the API.

---

## 2.2 Clearly separate login and registration

The system currently mixes login and registration flows. Fix this.

Registration flow must:

1. Create the user in Supabase Auth.
2. Create or synchronize the user in the internal `User` table.
3. Redirect to professional profile setup.

Login flow must:

1. Authenticate an existing user using Supabase Auth.
2. Fetch the internal user.
3. Check whether a professional profile already exists.
4. Redirect to the correct page.

Do not mix the two flows.

---

## 2.3 Redirecionamento correto após registro

Após registrar, o usuário deve ir para:

```txt
/profile/setup
```

ou:

```txt
/profile/edit
```

Essa página deve permitir completar o perfil profissional com:

- Foto/avatar.
- Título profissional.
- Bio.
- Categoria.
- Tags.
- Preço.
- Localização.
- Status disponível/ocupado.

---

## 2.4 Corrigir sidebar

Problema atual:

> Ao clicar em `services` ou `perfil`, o sistema volta para login.

Corrigir para que:

- Usuário logado consiga navegar normalmente.
- A sessão não seja perdida ao trocar de página.
- Rotas protegidas aguardem carregamento da sessão antes de redirecionar.
- A sidebar use links corretos.
- Nenhum botão da sidebar chame logout por engano.

---

# 3. Expected Stack

Adapte aos arquivos existentes do projeto, mas siga esta direção:

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase Client
- Arquitetura por features/camadas

## Backend

Pode estar em .NET, Node.js ou Spring Boot, mas deve possuir:

- API REST
- Banco PostgreSQL
- Models/Entities reais
- DTOs
- Services
- Controllers
- Validações
- Migrations
- Relacionamentos reais

## Autenticação

- Supabase Auth
- JWT do Supabase enviado do frontend para o backend
- Backend deve validar usuário autenticado antes de permitir operações privadas

## Storage

- Supabase Storage para avatar e documentos de verificação

---

# 4. Database Modeling

Criar ou ajustar as entidades abaixo.

---

## 4.1 User

Representa o usuário interno do sistema.

Campos:

```txt
id
supabaseUserId
name
email
createdAt
updatedAt
```

Regras:

- `supabaseUserId` deve ser único.
- `email` deve ser único.
- Um usuário pode contratar.
- Um usuário pode ser contratado.
- Um usuário deve possuir no máximo um perfil profissional principal.

Relacionamentos:

```txt
User 1 -> 1 ProfessionalProfile
User 1 -> N Reviews feitas
User 1 -> N Favorites
User 1 -> N Conversations como cliente
User 1 -> N Conversations como profissional
User 1 -> N Messages
```

---

## 4.2 ProfessionalProfile

Representa o perfil profissional do usuário.

Campos:

```txt
id
userId
categoryId
title
bio
price
location
avatarUrl
status
isVerified
createdAt
updatedAt
```

Valores possíveis para `status`:

```txt
available
busy
```

Relacionamentos:

```txt
ProfessionalProfile N -> 1 User
ProfessionalProfile N -> 1 Category
ProfessionalProfile N -> N Tags
ProfessionalProfile 1 -> N Reviews
ProfessionalProfile 1 -> N Favorites
ProfessionalProfile 1 -> N Conversations
```

Regras:

- Todo perfil profissional deve pertencer a um usuário real.
- Todo perfil profissional deve possuir categoria.
- Tags são opcionais, mas recomendadas.
- Avatar pode ser nulo inicialmente.

---

## 4.3 Category

Representa categorias de serviços.

Campos:

```txt
id
name
slug
description
createdAt
updatedAt
```

Exemplos de seed:

```txt
Desenvolvimento
Design
Elétrica
Encanador
Mecânica
Faxina
Aulas particulares
Assistência técnica
Marketing digital
Consultoria
```

Regras:

- Categorias devem vir do banco.
- O frontend não deve ter categorias fixas hardcoded.

---

## 4.4 Tag

Representa habilidades, ferramentas ou tipos de serviço.

Campos:

```txt
id
categoryId
name
slug
createdAt
updatedAt
```

Exemplos:

```txt
React
Node.js
Spring Boot
.NET
Angular
Photoshop
UI Design
Instalação elétrica
Chuveiro
Encanamento
Manutenção de computador
Formatação
```

Relacionamento:

```txt
Tag N -> 1 Category
Tag N -> N ProfessionalProfile
```

---

## 4.5 ProfessionalProfileTag

Tabela pivô entre perfil profissional e tag.

Campos:

```txt
professionalProfileId
tagId
```

Regra:

- Não permitir duplicidade da mesma tag para o mesmo perfil.

---

## 4.6 Review

Representa avaliação de um profissional.

Campos:

```txt
id
reviewerUserId
professionalProfileId
rating
comment
createdAt
updatedAt
```

Regras:

- `rating` deve ser de 1 a 5.
- Um usuário não pode avaliar a si mesmo.
- A média exibida deve ser calculada com base nas avaliações reais.
- O card do profissional deve exibir média e quantidade de avaliações.
- O perfil do profissional deve exibir lista de avaliações.
- Após enviar avaliação, o frontend deve atualizar a média e a lista.

---

## 4.7 Favorite

Representa profissional favoritado por um usuário.

Campos:

```txt
id
userId
professionalProfileId
createdAt
```

Regras:

- Um usuário não pode favoritar o mesmo profissional duas vezes.
- Deve existir botão para favoritar/desfavoritar.
- Deve existir tela/lista de favoritos.

---

## 4.8 Conversation

Representa uma conversa entre dois usuários.

Campos:

```txt
id
clientUserId
professionalUserId
professionalProfileId
lastMessageAt
createdAt
updatedAt
```

Regras:

- `clientUserId` é quem iniciou o contato.
- `professionalUserId` é o dono do perfil profissional.
- Conversas devem ser ordenadas por última mensagem.

---

## 4.9 Message

Representa uma mensagem do chat.

Campos:

```txt
id
conversationId
senderUserId
content
isRead
createdAt
```

Regras:

- Mensagem pertence a uma conversa.
- Deve marcar lida/não lida.
- Lista de conversas deve mostrar última mensagem e status.

---

## 4.10 ContactHistory

Representa histórico de ações entre usuários.

Campos:

```txt
id
requesterUserId
targetProfessionalProfileId
action
createdAt
```

Ações possíveis:

```txt
viewed_profile
started_conversation
clicked_hire
favorited
reviewed
```

---

## 4.11 VerificationRequest

Representa solicitação de verificação de perfil.

Campos:

```txt
id
userId
documentUrl
status
createdAt
updatedAt
```

Status possíveis:

```txt
pending
approved
rejected
```

---

# 5. Supabase Authentication

## 5.1 Configuração

Criar configuração do Supabase no frontend.

Variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Se o backend precisar de acesso administrativo:

```env
SUPABASE_SERVICE_ROLE_KEY=
```

Atenção:

- Nunca usar `SUPABASE_SERVICE_ROLE_KEY` no frontend.
- Validar sessão do usuário antes de acessar rotas privadas.

---

## 5.2 Fluxo de registro

Implementar fluxo real:

1. Usuário acessa `/register`.
2. Preenche nome, email e senha.
3. Frontend chama Supabase Auth para criar conta.
4. Após sucesso, frontend obtém o usuário autenticado.
5. Frontend chama backend para sincronizar/criar usuário interno.
6. Backend cria registro na tabela `User` com `supabaseUserId`.
7. Sistema redireciona para `/profile/setup`.
8. Usuário preenche perfil profissional.
9. Backend salva `ProfessionalProfile`.
10. Frontend redireciona para `/professionals` ou `/profile`.

Critério de aceite:

- Registrar deve criar conta real no Supabase.
- Registrar deve criar usuário real no banco interno.
- Registrar não deve simplesmente fazer login sem perfil.
- Após registro, usuário deve cair na criação do perfil profissional.

---

## 5.3 Fluxo de login

Implementar fluxo real:

1. Usuário acessa `/login`.
2. Preenche email e senha.
3. Frontend chama Supabase Auth para autenticar.
4. Após sucesso, frontend chama `/me` ou `/me/profile`.
5. Se o usuário interno não existir, sincronizar.
6. Se o perfil profissional não existir, redirecionar para `/profile/setup`.
7. Se o perfil existir, redirecionar para `/professionals`.

Critério de aceite:

- Login deve autenticar usuário existente.
- Login não deve criar perfil automaticamente incompleto, exceto se for regra clara de setup.
- Login não deve ser igual ao registro.

---

## 5.4 Fluxo de logout

Implementar:

1. Chamar Supabase Auth `signOut`.
2. Limpar estados locais.
3. Redirecionar para `/login`.

---

# 6. Protected Routes

Criar proteção para:

```txt
/profile
/profile/setup
/profile/edit
/services
/professionals
/favorites
/chat
/conversations
```

Regras:

- Enquanto a sessão carrega, mostrar loading.
- Não redirecionar para login antes de confirmar que não existe sessão.
- Usar sessão do Supabase como fonte principal.
- Backend deve validar o token recebido.

---

# 7. Required Endpoints

Ajustar nomes conforme padrão do backend, mas manter a intenção.

---

## 7.1 Auth/User

```http
GET /me
POST /auth/sync-user
```

### GET /me

Retorna usuário autenticado interno.

Resposta:

```json
{
  "id": "uuid",
  "supabaseUserId": "uuid",
  "name": "Theylon",
  "email": "email@email.com"
}
```

### POST /auth/sync-user

Cria ou atualiza usuário interno com base no Supabase Auth.

Body:

```json
{
  "supabaseUserId": "uuid",
  "name": "Theylon",
  "email": "email@email.com"
}
```

---

## 7.2 Perfil profissional

```http
GET /me/profile
POST /me/profile
PUT /me/profile
GET /professionals
GET /professionals/:id
```

### GET /me/profile

Retorna o perfil profissional do usuário logado.

### POST /me/profile

Cria perfil profissional.

Body:

```json
{
  "title": "Desenvolvedor Fullstack",
  "bio": "Crio sistemas web com React e backend.",
  "price": 80,
  "location": "Ipatinga, MG",
  "categoryId": "uuid",
  "tagIds": ["uuid", "uuid"],
  "status": "available",
  "avatarUrl": "https://..."
}
```

### PUT /me/profile

Atualiza perfil profissional.

### GET /professionals

Lista profissionais com filtros.

Query params:

```txt
search
categoryId
location
minRating
status
tagIds
sort
page
limit
```

Exemplo:

```http
GET /professionals?search=react&categoryId=abc&location=Ipatinga&minRating=4
```

Resposta deve incluir média de avaliação:

```json
{
  "items": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Theylon",
      "title": "Desenvolvedor Fullstack",
      "bio": "Crio sistemas web.",
      "price": 80,
      "location": "Ipatinga, MG",
      "avatarUrl": "https://...",
      "status": "available",
      "category": {
        "id": "uuid",
        "name": "Desenvolvimento"
      },
      "tags": [
        { "id": "uuid", "name": "React" }
      ],
      "ratingAverage": 4.8,
      "ratingCount": 12,
      "isVerified": false
    }
  ],
  "total": 1
}
```

---

## 7.3 Categorias

```http
GET /categories
GET /categories/:id/tags
```

### GET /categories

Retorna categorias do banco.

Resposta:

```json
[
  {
    "id": "uuid",
    "name": "Desenvolvimento",
    "slug": "desenvolvimento",
    "description": "Serviços de desenvolvimento de software"
  }
]
```

### GET /categories/:id/tags

Retorna tags da categoria.

---

## 7.4 Avaliações

```http
GET /professionals/:id/reviews
POST /professionals/:id/reviews
```

### GET /professionals/:id/reviews

Retorna avaliações do profissional.

Resposta:

```json
[
  {
    "id": "uuid",
    "reviewerName": "Maria",
    "rating": 5,
    "comment": "Ótimo profissional.",
    "createdAt": "2026-05-18T10:00:00Z"
  }
]
```

### POST /professionals/:id/reviews

Cria avaliação.

Body:

```json
{
  "rating": 5,
  "comment": "Excelente atendimento."
}
```

Regras:

- Usuário precisa estar autenticado.
- Usuário não pode avaliar a si mesmo.
- Após criar avaliação, retornar média atualizada.

Resposta:

```json
{
  "review": {
    "id": "uuid",
    "rating": 5,
    "comment": "Excelente atendimento."
  },
  "ratingAverage": 4.9,
  "ratingCount": 13
}
```

---

## 7.5 Favoritos

```http
GET /favorites
POST /favorites/:professionalProfileId
DELETE /favorites/:professionalProfileId
```

Regras:

- Usuário precisa estar autenticado.
- Deve impedir duplicidade.
- Card do profissional pode indicar se já está favoritado.

---

## 7.6 Chat

```http
GET /conversations
POST /conversations
GET /conversations/:id/messages
POST /conversations/:id/messages
PATCH /conversations/:id/read
```

### GET /conversations

Deve retornar conversas ordenadas por última mensagem.

Cada conversa deve conter:

- Nome do outro usuário.
- Avatar do profissional, se existir.
- Última mensagem.
- Data da última mensagem.
- Quantidade de não lidas.

---

## 7.7 Histórico

```http
GET /history
POST /history
```

Registrar ações como:

- Perfil visualizado.
- Conversa iniciada.
- Botão contratar clicado.
- Profissional favoritado.

---

## 7.8 Verificação

```http
POST /verification/request
GET /verification/status
```

Regras:

- Upload de documento via Supabase Storage.
- Salvar URL do documento no banco.
- Status inicial deve ser `pending`.

---

# 8. Frontend — Required Pages

## 8.1 /register

Deve conter:

- Nome.
- Email.
- Senha.
- Botão de registrar.
- Link para login.

Comportamento:

- Criar conta no Supabase.
- Sincronizar usuário no backend.
- Redirecionar para `/profile/setup`.

---

## 8.2 /login

Deve conter:

- Email.
- Senha.
- Botão de login.
- Link para registro.

Comportamento:

- Autenticar via Supabase.
- Buscar `/me/profile`.
- Se não tiver perfil, redirecionar para `/profile/setup`.
- Se tiver perfil, redirecionar para `/professionals`.

---

## 8.3 /profile/setup

Primeira configuração do perfil profissional.

Campos:

- Avatar.
- Título.
- Bio.
- Categoria.
- Tags.
- Preço.
- Localização.
- Status.

Comportamento:

- Carregar categorias do banco.
- Carregar tags conforme categoria selecionada.
- Fazer upload de avatar.
- Salvar perfil no banco.
- Redirecionar para `/professionals`.

---

## 8.4 /profile/edit

Editar perfil existente.

Deve carregar dados atuais do backend e permitir alteração.

---

## 8.5 /professionals ou /services

Listagem de profissionais reais.

Deve conter:

- Campo de busca por nome/título.
- Filtro por categoria.
- Filtro por localização.
- Filtro por avaliação mínima.
- Filtro por status.
- Cards de profissionais.

Card deve mostrar:

- Foto.
- Nome.
- Título.
- Categoria.
- Localização.
- Preço.
- Status.
- Média de avaliação.
- Quantidade de avaliações.
- Badge verificado, se houver.
- Botão favoritar.
- Botão ver detalhes.

---

## 8.6 /professionals/[id]

Tela de detalhes do profissional.

Deve mostrar:

- Foto grande.
- Nome.
- Título.
- Bio completa.
- Categoria.
- Tags.
- Preço.
- Localização.
- Status.
- Média de avaliações.
- Lista de avaliações.
- Formulário para avaliar.
- Botão favoritar.
- Botão chamar/contratar.

Ao clicar em chamar/contratar:

- Criar ou abrir conversa.
- Registrar histórico `clicked_hire` ou `started_conversation`.

---

## 8.7 /favorites

Listar profissionais favoritados pelo usuário.

---

## 8.8 /chat ou /conversations

Mostrar lista de conversas.

Regras:

- Ordenar por última mensagem.
- Mostrar status lida/não lida.
- Permitir abrir conversa.

---

# 9. Review System — High Priority

Finalizar imediatamente.

## Backend

Implementar:

- Criar avaliação.
- Listar avaliações de um profissional.
- Calcular média.
- Calcular quantidade.
- Impedir autoavaliação.

## Frontend

Implementar:

- Média no card do profissional.
- Quantidade de avaliações no card.
- Lista de avaliações no perfil.
- Formulário de avaliação.
- Atualização automática após enviar avaliação.

## Atualização automática

Após enviar avaliação:

1. Atualizar lista local de avaliações.
2. Atualizar média.
3. Atualizar quantidade.
4. Opcionalmente revalidar a query da listagem.

Critério de aceite:

- Usuário envia avaliação e vê a nova avaliação sem precisar atualizar a página manualmente.

---

# 10. Search and Filters — High Priority

Implementar filtros reais usando query params no backend.

Filtros obrigatórios:

```txt
search
categoryId
location
minRating
status
tagIds
```

Ordenações sugeridas:

```txt
rating_desc
reviews_count_desc
recent_desc
price_asc
price_desc
```

Ranking padrão recomendado:

1. Profissionais verificados primeiro.
2. Maior média de avaliação.
3. Maior quantidade de avaliações.
4. Mais recentes ou mais ativos.

---

# 11. Favorites — Medium Priority

Implementar:

- Botão favoritar no card.
- Botão favoritar na tela de detalhes.
- Tela de favoritos.
- Persistência no banco.
- Evitar duplicidade.
- Atualizar UI ao favoritar/desfavoritar.

---

# 12. Chat — Medium Priority

Aproveitar a base já existente.

Implementar:

- Lista de conversas.
- Ordenação por última mensagem.
- Última mensagem visível.
- Contador de não lidas.
- Status lida/não lida.
- Envio de mensagem.
- Abertura de conversa ao clicar em contratar/chamar.

---

# 13. History System — Strategic Priority

Registrar eventos importantes:

- Usuário visualizou perfil.
- Usuário clicou em chamar/contratar.
- Usuário iniciou conversa.
- Usuário favoritou profissional.
- Usuário avaliou profissional.

Objetivo:

- Melhorar ranking futuro.
- Criar inteligência de produto.
- Permitir auditoria de interações.

---

# 14. Profile Verification — Strategic Priority

Implementar de forma simples inicialmente:

- Upload de documento.
- Criar solicitação com status `pending`.
- Mostrar badge `verificado` apenas se status aprovado.

Não precisa implementar painel administrativo completo agora, mas deixar estrutura pronta.

---

# 15. Smart Ranking — Strategic Priority

Criar ordenação padrão para mostrar melhores profissionais primeiro.

Critérios:

- Média de avaliação.
- Quantidade de avaliações.
- Perfil verificado.
- Status disponível.
- Atividade recente.
- Quantidade de contatos.

Exemplo de score:

```txt
score =
  ratingAverage * 40 +
  log(ratingCount + 1) * 20 +
  verifiedBonus +
  availableBonus +
  recentActivityBonus
```

Não precisa ser perfeito no início, mas deve ser fácil evoluir.

---

# 16. Suggested Frontend Structure

Manter ou adaptar à estrutura existente, mas seguir este padrão:

```txt
src/
  app/
    login/
    register/
    professionals/
    profile/
    favorites/
    chat/
  features/
    auth/
      services/
      hooks/
      types/
    professionals/
      services/
      components/
      hooks/
      types/
    categories/
      services/
      hooks/
      types/
    reviews/
      services/
      components/
      hooks/
      types/
    favorites/
      services/
      hooks/
      types/
    chat/
      services/
      hooks/
      types/
  shared/
    components/
    lib/
    hooks/
    types/
```

---

# 17. Required Frontend Services

Criar ou ajustar:

```ts
// authService.ts
signUpWithEmail(name: string, email: string, password: string)
signInWithEmail(email: string, password: string)
signOut()
getCurrentSession()
getCurrentUser()

// userService.ts
syncUser()
getMe()

// professionalService.ts
getProfessionals(filters)
getProfessionalById(id)
getMyProfile()
createMyProfile(data)
updateMyProfile(data)

// categoryService.ts
getCategories()
getTagsByCategory(categoryId)

// reviewService.ts
getReviewsByProfessional(professionalId)
createReview(professionalId, data)

// favoriteService.ts
getFavorites()
favoriteProfessional(professionalId)
unfavoriteProfessional(professionalId)

// chatService.ts
getConversations()
createConversation(professionalProfileId)
getMessages(conversationId)
sendMessage(conversationId, content)
markConversationAsRead(conversationId)
```

---

# 18. Required Frontend Components

Criar ou ajustar:

```txt
ProfessionalCard
ProfessionalFilters
ProfessionalDetails
ReviewList
ReviewForm
FavoriteButton
ProfileForm
AvatarUpload
CategorySelect
TagMultiSelect
Sidebar
ProtectedRoute/AuthGuard
ConversationList
ChatWindow
```

---

# 19. Sidebar Fixes

Verificar:

- O link de `services` aponta para rota existente?
- A rota correta é `/services` ou `/professionals`?
- O item `perfil` aponta para `/profile` ou `/profile/edit`?
- Existe proteção de rota bugada?
- O AuthGuard está redirecionando antes do Supabase carregar?

Implementação esperada do AuthGuard:

```txt
1. Iniciar loading como true.
2. Buscar sessão do Supabase.
3. Enquanto busca, exibir loading.
4. Se não tiver sessão, redirecionar para login.
5. Se tiver sessão, renderizar children.
```

Nunca fazer:

```txt
if (!user) router.push('/login')
```

antes de confirmar que o carregamento terminou.

---

# 20. Database Seeds

Criar seed inicial com categorias e tags.

## Categorias

```txt
Desenvolvimento
Design
Elétrica
Encanador
Mecânica
Faxina
Assistência Técnica
Aulas Particulares
Marketing Digital
Consultoria
```

## Tags

Desenvolvimento:

```txt
React
Next.js
Node.js
.NET
Spring Boot
Java
TypeScript
PostgreSQL
```

Design:

```txt
UI Design
UX Design
Photoshop
Figma
Identidade visual
Web design
```

Elétrica:

```txt
Instalação elétrica
Chuveiro
Tomada
Disjuntor
Manutenção residencial
```

Encanador:

```txt
Vazamento
Caixa d'água
Torneira
Encanamento residencial
Desentupimento
```

Assistência Técnica:

```txt
Formatação
Manutenção de computador
Instalação de Windows
Limpeza de notebook
Rede Wi-Fi
```

---

# 21. Acceptance Criteria

O sistema só será considerado funcional quando:

- Registro criar usuário real no Supabase.
- Registro sincronizar usuário no banco interno.
- Registro redirecionar para criação de perfil.
- Perfil profissional for salvo no banco.
- Perfil profissional retornar no frontend.
- Login for diferente de registro.
- Login respeitar usuário existente.
- Sidebar não redirecionar indevidamente para login.
- Categorias vierem do banco.
- Filtro por categoria funcionar.
- Busca por nome funcionar.
- Filtro por localização funcionar.
- Filtro por avaliação funcionar.
- Card mostrar média de avaliação real.
- Perfil mostrar lista de avaliações real.
- Envio de avaliação atualizar a interface.
- Favoritos persistirem no banco.
- Chat listar conversas reais.
- Tela de detalhes funcionar com dados reais.

---

# 22. Required Execution Order

Executar nesta ordem:

## Etapa 1 — Corrigir autenticação

- Instalar/configurar Supabase.
- Separar login e registro.
- Criar fluxo de sync user.
- Proteger rotas corretamente.
- Corrigir sidebar.

## Etapa 2 — Criar banco real

- Criar entidades.
- Criar migrations.
- Criar relacionamentos.
- Criar seeds.

## Etapa 3 — Perfil profissional

- Criar endpoints de perfil.
- Criar tela de setup.
- Criar tela de edição.
- Implementar upload de avatar.
- Implementar categoria e tags.

## Etapa 4 — Categorias e filtros

- Criar endpoint `/categories`.
- Criar endpoint de tags.
- Mostrar categorias no frontend.
- Implementar filtros reais.

## Etapa 5 — Avaliações

- Criar endpoints de reviews.
- Mostrar média nos cards.
- Mostrar reviews no perfil.
- Atualizar após envio.

## Etapa 6 — Favoritos

- Criar tabela.
- Criar endpoints.
- Criar botão.
- Criar tela de favoritos.

## Etapa 7 — Chat

- Listar conversas.
- Ordenar por última mensagem.
- Implementar lida/não lida.

## Etapa 8 — Detalhes, histórico, verificação e ranking

- Tela detalhada do profissional.
- Histórico de contatos.
- Verificação de perfil.
- Ranking inteligente.

---

# 23. Direct Prompt to Paste Into a Coding AI

Use o texto abaixo como prompt principal:

```md
Você é uma IA desenvolvedora sênior. Analise meu projeto MatchJob antes de alterar qualquer arquivo.

Quero transformar o sistema em um MVP real para teste em campo.

O sistema deve usar Supabase Auth para autenticação, banco PostgreSQL com relações reais e frontend consumindo dados reais via API. Remova mocks do frontend; mocks só podem existir como seed no banco.

Regra de negócio principal: todo usuário é cliente e profissional ao mesmo tempo. Ele pode contratar e também ser contratado.

Prioridade máxima:
1. Separar login e registro.
2. Registro deve criar usuário real no Supabase, sincronizar usuário no banco interno e redirecionar para criação do perfil profissional.
3. Login deve autenticar usuário existente e redirecionar conforme existência do perfil.
4. Corrigir sidebar para não voltar para login ao clicar em services ou perfil quando a sessão estiver válida.
5. Criar perfil profissional completo salvo no banco.
6. Criar categorias dinâmicas no banco e endpoint /categories.
7. Mostrar categorias reais no frontend e filtrar por categoria.
8. Finalizar avaliações: média no card, lista no perfil e atualização automática após envio.
9. Implementar busca por nome, categoria, localização e avaliação.
10. Implementar favoritos, chat, detalhes do profissional, histórico, verificação e ranking em etapas seguintes.

Antes de implementar, faça uma auditoria da estrutura atual e identifique:
- Onde estão os mocks.
- Onde login e registro estão misturados.
- Onde a sidebar perde sessão.
- Quais models/endpoints já existem.
- Quais páginas e serviços do frontend já existem.

Depois implemente incrementalmente, seguindo a ordem:
1. Auth com Supabase.
2. Usuário interno sincronizado.
3. Rotas protegidas corretas.
4. Perfil profissional.
5. Categorias e tags.
6. Listagem e filtros.
7. Avaliações.
8. Favoritos.
9. Chat.
10. Histórico, verificação e ranking.

Não reescreva o projeto inteiro sem necessidade. Aproveite a estrutura existente e mantenha o layout atual sempre que possível.

Crie ou ajuste models, migrations, DTOs, services, controllers/routes, tipos TypeScript, services do frontend, hooks e componentes necessários.

O resultado final esperado é um MatchJob funcional, com autenticação, banco real, perfil profissional, categorias, filtros e avaliações funcionando ponta a ponta.
```

---

# 24. Final Instruction for the Executing AI

Implemente o sistema de forma incremental e segura.

Antes de alterar arquivos, analise a estrutura existente.

Não quebre o layout atual sem necessidade.

Não substitua o projeto inteiro por uma implementação genérica.

Aproveite o que já existe, mas remova mocks das funcionalidades principais.

Sempre que criar uma entidade, crie também:

- Model/Entity.
- DTO.
- Service.
- Controller/Route.
- Migration.
- Validação.
- Tipagem no frontend.
- Service de consumo no frontend.
- Integração real com tela.

Prioridade máxima:

1. Auth com Supabase.
2. Usuário real.
3. Perfil profissional real.
4. Categorias reais.
5. Avaliações reais.
6. Filtros reais.
7. Sidebar sem bug de sessão.

Resultado esperado:

> O MatchJob deve sair do estado de protótipo com mocks e passar para um MVP real, com banco relacional, autenticação, perfil profissional, categorias, avaliações e filtros funcionando ponta a ponta.

