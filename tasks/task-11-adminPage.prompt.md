# Task 11 — Página Administrativa (Admin)

## Objetivo

Implementar a página administrativa que lista todas as postagens com opções de editar e excluir, acessível apenas para docentes autenticados.

## Entregáveis

- [ ] `Admin.test.js` + `Admin.js` (page)
- [ ] Dialog de confirmação de exclusão
- [ ] Todos com `data-testid` fixos
- [ ] Rota protegida
- [ ] Integração com Use Cases `ListPosts` e `DeletePost`
- [ ] Paginação

## Localização

```
src/domains/posts/presentation/pages/
├── Admin.js
└── Admin.test.js
```

## Especificações

### Admin Page

| Funcionalidade | Descrição |
|----------------|-----------|
| Rota | `/admin` (protegida) |
| Listagem | GET `/posts?status=all` — mostra todos os posts (draft + published) |
| Paginação | Componente Pagination integrado |
| Criar | Botão "Novo Post" navega para `/admin/posts/new` |
| Editar | Botão editar navega para `/admin/posts/:id/edit` |
| Excluir | Botão excluir abre dialog de confirmação → DELETE `/posts/:id` |
| Loading | Spinner durante carregamento |
| Erro | Mensagem se API falhar |

### data-testid

| data-testid | Elemento | Descrição |
|-------------|----------|-----------|
| `admin-table` | table | Tabela de posts |
| `admin-btn-new-post` | button | Botão "Novo Post" |
| `admin-btn-edit-{id}` | button | Editar post (dinâmico) |
| `admin-btn-delete-{id}` | button | Excluir post (dinâmico) |
| `admin-confirm-dialog` | dialog/div | Modal de confirmação |
| `admin-btn-confirm-yes` | button | Confirmar exclusão |
| `admin-btn-confirm-no` | button | Cancelar exclusão |

### Tabela de Posts

| Coluna | Campo | Descrição |
|--------|-------|-----------|
| Título | titulo | Texto truncado se muito longo |
| Autor | autor | Nome do autor |
| Status | status | Badge "draft" ou "published" |
| Data | createdAt | Data formatada |
| Ações | — | Botões editar e excluir |

### Fluxo de Exclusão

1. Docente clica em "Excluir" (`admin-btn-delete-{id}`)
2. Abre dialog de confirmação (`admin-confirm-dialog`)
3. Se confirma (`admin-btn-confirm-yes`): chama `DeletePost.execute(id)`
4. Sucesso: remove post da lista, feedback visual
5. Erro: exibe mensagem de erro
6. Se cancela (`admin-btn-confirm-no`): fecha dialog

## Padrão de Testes (BDD)

```js
describe('Admin Page', () => {
  describe('quando a página carrega com sucesso', () => {
    it('deve exibir tabela com todos os posts', async () => { /* ... */ });
    it('deve exibir botão "Novo Post"', async () => { /* ... */ });
    it('deve exibir botões de editar e excluir para cada post', async () => { /* ... */ });
  });

  describe('quando o docente clica em "Novo Post"', () => {
    it('deve navegar para /admin/posts/new', async () => { /* ... */ });
  });

  describe('quando o docente clica em "Editar"', () => {
    it('deve navegar para /admin/posts/:id/edit', async () => { /* ... */ });
  });

  describe('quando o docente clica em "Excluir"', () => {
    it('deve abrir o dialog de confirmação', async () => { /* ... */ });
  });

  describe('quando o docente confirma a exclusão', () => {
    it('deve chamar deletePost e remover o post da lista', async () => { /* ... */ });
  });

  describe('quando o docente cancela a exclusão', () => {
    it('deve fechar o dialog sem excluir', async () => { /* ... */ });
  });

  describe('quando a exclusão falha', () => {
    it('deve exibir mensagem de erro', async () => { /* ... */ });
  });

  describe('quando não há posts', () => {
    it('deve exibir mensagem de "nenhum post criado"', async () => { /* ... */ });
  });
});
```

## Critérios de Aceitação

- Testes escritos ANTES da implementação (TDD)
- Padrão BDD nos testes
- Rota protegida (redireciona se não autenticado)
- Lista TODOS os posts (status=all), não apenas published
- Dialog de confirmação antes de excluir
- Consome API via Use Cases `ListPosts` e `DeletePost`
- `data-testid` fixos
- Responsivo (tabela → cards em mobile)
- Cobertura ≥ 80%
