# Task 07 — Página Principal (Home): Lista de Posts + Busca

## Objetivo

Implementar a página Home que exibe a lista de posts publicados com busca por palavra-chave e paginação, consumindo a API via Use Cases.

## Entregáveis

- [ ] `PostCard.test.js` + `PostCard.js`
- [ ] `PostList.test.js` + `PostList.js`
- [ ] `SearchBar.test.js` + `SearchBar.js`
- [ ] `usePosts.test.js` + `usePosts.js`
- [ ] `Home.test.js` + `Home.js`
- [ ] Todos com `data-testid` fixos
- [ ] Responsivo (mobile e desktop)
- [ ] Integração com Use Cases `ListPosts` e `SearchPosts`

## Localização

```
src/domains/posts/presentation/
├── pages/
│   ├── Home.js
│   └── Home.test.js
├── components/
│   ├── PostCard.js
│   ├── PostCard.test.js
│   ├── PostList.js
│   ├── PostList.test.js
│   ├── SearchBar.js
│   └── SearchBar.test.js
└── hooks/
    ├── usePosts.js
    └── usePosts.test.js
```

## Especificações

### Home Page

| Funcionalidade | Descrição |
|----------------|-----------|
| Listagem | Exibe posts com `status: published` via GET `/posts?status=published` |
| Busca | Campo de busca chama GET `/posts/search?q=termo` |
| Paginação | Componente Pagination (Task 05) com `totalPages` da API |
| Loading | Exibe spinner durante carregamento |
| Erro | Exibe mensagem se API falhar |
| Vazio | Exibe mensagem se nenhum post encontrado |

### PostCard

| data-testid | Elemento | Conteúdo |
|-------------|----------|----------|
| `post-card-{id}` | article | Container do card |
| `post-card-title-{id}` | h2 | Título do post |
| `post-card-author-{id}` | span | Autor do post |

**Props:** `{ id, titulo, autor, conteudo, createdAt }`

**Comportamentos:**
- Exibe título, autor e trecho do conteúdo (primeiros 150 chars via `truncateText`)
- Exibe data formatada via `formatDate`
- Card inteiro é clicável, navega para `/posts/:id`

### SearchBar

| data-testid | Elemento | Descrição |
|-------------|----------|-----------|
| `search-input` | input | Campo de texto para busca |
| `search-btn-submit` | button | Botão para disparar busca |

**Props:** `{ onSearch, placeholder? }`

**Comportamentos:**
- Ao clicar no botão ou pressionar Enter, chama `onSearch(query)`
- Se campo vazio, não dispara busca (ou volta para listagem completa)

### PostList

**Props:** `{ posts }` — renderiza lista de PostCard

### usePosts (Hook)

```js
// Retorna:
{
  posts: Post[],
  pagination: { page, totalPages },
  loading: boolean,
  error: string | null,
  loadPosts: (page, limit) => void,
  searchPosts: (query, page, limit) => void
}
```

- Usa Use Cases `ListPosts` e `SearchPosts` injetados
- Gerencia estado de loading/error/data

## Padrão de Testes (BDD)

```js
describe('Home Page', () => {
  describe('quando a página carrega com sucesso', () => {
    it('deve exibir a lista de posts publicados', async () => { /* ... */ });
    it('deve exibir a paginação', async () => { /* ... */ });
  });

  describe('quando não há posts', () => {
    it('deve exibir mensagem de "nenhum post encontrado"', async () => { /* ... */ });
  });

  describe('quando ocorre erro na API', () => {
    it('deve exibir mensagem de erro', async () => { /* ... */ });
  });

  describe('quando o usuário busca por "react"', () => {
    it('deve exibir apenas posts que contêm "react"', async () => { /* ... */ });
  });

  describe('quando o usuário clica em um post', () => {
    it('deve navegar para a página de detalhe do post', async () => { /* ... */ });
  });

  describe('quando o usuário muda de página', () => {
    it('deve carregar os posts da nova página', async () => { /* ... */ });
  });
});
```

## Critérios de Aceitação

- Testes escritos ANTES da implementação (TDD)
- Padrão BDD nos testes
- Consome API via Use Cases (não diretamente)
- Responsivo: cards em grid (desktop) ou lista (mobile)
- Loading e Error states tratados
- `data-testid` fixos em todos os elementos interativos
- Cobertura ≥ 80%
