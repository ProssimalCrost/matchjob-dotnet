# Frontend Architecture - MatchJob

Refatoração em camadas mantendo a estilização original.

## Estrutura

```txt
src/
  app/
    navigation/       # Rotas, tabs e stacks
    providers/        # Providers globais do app
  core/
    api/              # Cliente HTTP, contratos e tipos da API
  features/
    auth/             # Login, cadastro e contexto de autenticação
    chat/             # Conversas e mensagens
    professionals/    # Home, perfil e cards de profissionais
    reviews/          # Avaliações, estrelas e serviço de review
  shared/
    ui/               # Componentes visuais compartilhados
    theme/            # Espaço reservado para tema/paleta futura
    hooks/            # Espaço reservado para hooks compartilhados
```

## Regra usada

- `app`: composição do app, navegação e providers.
- `features`: módulos por domínio/função do produto.
- `core`: infraestrutura técnica, como API e tipos.
- `shared`: UI reaproveitável e utilitários genéricos.

## Importante

A estilização visual foi preservada. Os arquivos foram movidos e os imports ajustados, sem redesenhar telas, cores, espaçamentos ou componentes visuais.
