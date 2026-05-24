# Task 07 — Página Principal (Home): Lista de Posts + Busca + Paginação

## ✅ Status: IMPLEMENTADO

**Data de conclusão:** 2026-05-22

### Artefatos entregues

| # | Artefato | Arquivo | Testes |
|---|----------|---------|--------|
| 1 | PostCard (Component) | `src/domains/posts/presentation/components/PostCard.js` | 7 testes ✅ |
| 2 | PostList (Component) | `src/domains/posts/presentation/components/PostList.js` | 4 testes ✅ |
| 3 | SearchBar (Component) | `src/domains/posts/presentation/components/SearchBar.js` | 7 testes ✅ |
| 4 | usePosts (Hook) | `src/domains/posts/presentation/hooks/usePosts.js` | 12 testes ✅ |
| 5 | Home (Page) | `src/domains/posts/presentation/pages/Home.js` | 10 testes ✅ |

**Total: 10 arquivos (5 implementação + 5 testes) — 43 testes novos, 316 total no projeto**

### Decisões de implementação

- **PostCard**: `<Link>` do react-router (não onClick) para acessibilidade/SEO. `<time datetime>` para datas. `truncateText(150)` + `formatDate`.
- **PostList**: CSS Grid responsivo (1/2/3 colunas). Mensagem vazia inline.
- **SearchBar**: `type="search"` + `aria-label`. Botão "limpar" condicional. `onClear` semântico separado de `onSearch`.
- **usePosts**: DI via parâmetros (recebe use cases). Estado `currentQuery` para distinguir listagem vs busca ao paginar.
- **Home**: Composition root — instancia `PostApiRepository` → use cases via `useMemo`. `useEffect` para carga inicial.
- **Testes**: `jest.mock('PostApiRepository')` na Home; `renderHook` + `act` para usePosts; `renderWithProviders` para componentes.

---

## Contexto e Justificativa

A Home é a **principal superfície de valor para o aluno** — é onde ele descobre e navega pelos conteúdos publicados pelos professores. Esta task implementa a camada de apresentação do domínio `posts`, integrando com os use cases `ListPosts` e `SearchPosts` já existentes (Task 04), o `PostApiRepository` (Task 04), e os shared components `Pagination`, `Loading`, `ErrorMessage` (Task 05).

### O que já existe (NÃO reimplementar)

| Artefato | Localização | Interface relevante |
|----------|-------------|---------------------|
| `ListPosts` use case | `src/domains/posts/application/usecases/ListPosts.js` | `.execute({ page, limit, status })` → `{ data: [], pagination: {} }` |
| `SearchPosts` use case | `src/domains/posts/application/usecases/SearchPosts.js` | `.execute({ query, page, limit })` → `{ data: [], pagination: {} }` |
| `PostApiRepository` | `src/domains/posts/infrastructure/repositories/PostApiRepository.js` | Implementa `findAll`, `search` via httpClient |
| `Pagination` | `src/shared/components/Pagination.js` | `<Pagination currentPage totalPages onPageChange />` |
| `Loading` | `src/shared/components/Loading.js` | `<Loading size text />` com `role="status"` |
| `ErrorMessage` | `src/shared/components/ErrorMessage.js` | `<ErrorMessage message onDismiss />` com `role="alert"` |
| `truncateText` | `src/shared/utils/truncateText.js` | `truncateText(text, 150)` → string |
| `formatDate` | `src/shared/utils/formatDate.js` | `formatDate(isoString)` → "22 de mai. de 2026" |
| `renderWithProviders` | `src/shared/test-utils.js` | Wraps com Theme + Auth + Router |

### Resposta da API esperada (ListPosts / SearchPosts)

```json
{
  "data": [
    { "id": "1", "titulo": "...", "conteudo": "...", "autor": "...", "status": "published", "createdAt": "...", "updatedAt": "..." }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}
```

---

## Entregáveis

| # | Artefato | Tipo | Depende de |
|---|----------|------|------------|
| 1 | `PostCard.test.js` + `PostCard.js` | Component | truncateText, formatDate |
| 2 | `PostList.test.js` + `PostList.js` | Component | PostCard |
| 3 | `SearchBar.test.js` + `SearchBar.js` | Component | — |
| 4 | `usePosts.test.js` + `usePosts.js` | Hook | ListPosts, SearchPosts use cases |
| 5 | `Home.test.js` + `Home.js` | Page | PostList, SearchBar, usePosts, Pagination, Loading, ErrorMessage |

**Total: 5 artefatos, 10 arquivos (5 implementação + 5 testes)**

---

## Estrutura de Diretórios

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

---

## Especificações Detalhadas

### 1. PostCard (Component)

**Responsabilidade**: Exibe resumo de um post como um card clicável.

| data-testid | Elemento | Notas |
|-------------|----------|-------|
| `post-card-{id}` | `<article>` | Container — `id` dinâmico (exceção justificada pela natureza de lista) |
| `post-card-title-{id}` | `<h2>` | Título completo do post |
| `post-card-excerpt-{id}` | `<p>` | Conteúdo truncado (150 chars) |
| `post-card-author-{id}` | `<span>` | Nome do autor |
| `post-card-date-{id}` | `<time>` | Data formatada, com `datetime` attr |

**Props**:
```js
PostCard.propTypes = {
  id: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
  conteudo: PropTypes.string.isRequired,
  autor: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
};
```

**Comportamentos**:
- Renderiza título, autor, data formatada (`formatDate`), trecho truncado (`truncateText(conteudo, 150)`)
- Card inteiro clicável → navega para `/posts/{id}` (usar `<Link>` do react-router-dom, **não** `onClick + navigate`)
- Elemento `<time>` com atributo `datetime` para SEO/acessibilidade
- Styled-components para card com hover effect

**Por que `<Link>` e não `onClick`?**
- Acessibilidade: link é focável por teclado e anunciado por screen readers como navegação
- SEO: crawlers entendem `<a href>`
- UX: permite botão direito → "abrir em nova aba"

**Casos de teste obrigatórios**:
```
describe('PostCard', () => {
  describe('dado dados válidos de um post', () => {
    ✓ deve renderizar título do post
    ✓ deve renderizar nome do autor
    ✓ deve renderizar data formatada
    ✓ deve renderizar conteúdo truncado em 150 caracteres
    ✓ deve ter link que navegaria para /posts/{id}
  });
  describe('dado conteúdo longo', () => {
    ✓ deve truncar e exibir "..." ao final
  });
  describe('dado conteúdo curto', () => {
    ✓ deve exibir conteúdo sem truncamento
  });
});
```

---

### 2. PostList (Component)

**Responsabilidade**: Renderiza uma lista de PostCards. Não gerencia estado — é **presentational only**.

| data-testid | Elemento | Notas |
|-------------|----------|-------|
| `post-list` | `<section>` | Container da lista |
| `post-list-empty` | `<div>` | Visível apenas se `posts` é array vazio |

**Props**:
```js
PostList.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    titulo: PropTypes.string.isRequired,
    conteudo: PropTypes.string.isRequired,
    autor: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
  })).isRequired,
};
```

**Comportamentos**:
- Se `posts` vazio → exibir mensagem "Nenhum post encontrado"
- Se `posts` com items → renderizar grid de PostCards
- Layout: CSS Grid responsivo (1 coluna mobile, 2 colunas tablet, 3 colunas desktop)

**Casos de teste obrigatórios**:
```
describe('PostList', () => {
  describe('dado lista com posts', () => {
    ✓ deve renderizar um PostCard para cada post
    ✓ deve exibir títulos de todos os posts
  });
  describe('dado lista vazia', () => {
    ✓ deve exibir mensagem "Nenhum post encontrado"
    ✓ não deve renderizar nenhum PostCard
  });
});
```

---

### 3. SearchBar (Component)

**Responsabilidade**: Campo de busca com botão. Componente controlado, puro via props.

| data-testid | Elemento | Notas |
|-------------|----------|-------|
| `search-input` | `<input type="search">` | Placeholder: "Buscar posts..." |
| `search-btn-submit` | `<button>` | Texto/ícone: "Buscar" |
| `search-btn-clear` | `<button>` | Visível apenas quando há texto (limpa busca) |

**Props**:
```js
SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,  // (query: string) => void
  onClear: PropTypes.func,              // () => void — volta à listagem completa
  placeholder: PropTypes.string,
};
```

**Comportamentos**:
- Enter no input → chama `onSearch(query)`
- Click no botão "Buscar" → chama `onSearch(query)`
- Se campo vazio e clicar (ou Enter) → chama `onClear()` (volta à listagem completa)
- Botão "Limpar" (×) aparece quando há texto → limpa campo e chama `onClear()`
- `type="search"` para suporte nativo de clear no mobile
- `aria-label="Campo de busca"` para acessibilidade

**Decisão de design**: O componente aceita `onClear` separado de `onSearch` porque limpar a busca e buscar são ações semanticamente diferentes — voltamos para `ListPosts` em vez de `SearchPosts("")`.

**Casos de teste obrigatórios**:
```
describe('SearchBar', () => {
  describe('dado renderização inicial', () => {
    ✓ deve renderizar input e botão de busca
    ✓ não deve exibir botão de limpar
  });
  describe('dado digitação e submit via botão', () => {
    ✓ deve chamar onSearch com o texto digitado
  });
  describe('dado digitação e submit via Enter', () => {
    ✓ deve chamar onSearch com o texto digitado
  });
  describe('dado campo vazio e submit', () => {
    ✓ deve chamar onClear (não onSearch)
  });
  describe('dado texto no campo', () => {
    ✓ deve exibir botão de limpar
    ✓ ao clicar limpar, deve limpar input e chamar onClear
  });
});
```

---

### 4. usePosts (Hook)

**Responsabilidade**: Gerencia estado de listagem/busca de posts. Orquestra use cases.

**Interface retornada**:
```js
{
  posts: Array,                             // Lista de posts atuais
  pagination: { page, totalPages, total },  // Dados de paginação
  loading: boolean,                         // Estado de carregamento
  error: string | null,                     // Mensagem de erro
  loadPosts: (page?) => void,               // Carrega listagem (status=published)
  searchPosts: (query, page?) => void,      // Busca por termo
  clearSearch: () => void,                  // Volta à listagem normal
}
```

**Parâmetros de entrada (injeção de dependência)**:
```js
usePosts({ listPostsUseCase, searchPostsUseCase, limit = 10 })
```

> **Por que injeção via parâmetros?** Permite testes unitários do hook sem mock de módulo. Os use cases são instanciados na page (ou via factory) e passados para o hook.

**Comportamentos**:
- `loadPosts(page)` → chama `listPostsUseCase.execute({ page, limit, status: 'published' })`
- `searchPosts(query, page)` → chama `searchPostsUseCase.execute({ query, page, limit })`
- `clearSearch()` → limpa query, recarrega listagem página 1
- Gerencia estados: `loading=true` no início, `loading=false` ao final, `error` se falhar
- Se use case lançar erro → seta `error` com `err.message`, `posts` fica `[]`
- Não carrega automaticamente ao montar (a page chama `loadPosts()` no useEffect)

**Casos de teste obrigatórios**:
```
describe('usePosts', () => {
  describe('dado loadPosts chamado', () => {
    ✓ deve setar loading=true e depois false
    ✓ deve retornar posts e pagination do use case
    ✓ deve chamar listPostsUseCase com status=published
    ✓ deve chamar com page e limit corretos
  });
  describe('dado erro no loadPosts', () => {
    ✓ deve setar error com mensagem do erro
    ✓ deve setar posts como array vazio
    ✓ deve setar loading=false
  });
  describe('dado searchPosts chamado', () => {
    ✓ deve chamar searchPostsUseCase com query, page, limit
    ✓ deve retornar posts filtrados
    ✓ deve setar loading durante a operação
  });
  describe('dado erro no searchPosts', () => {
    ✓ deve setar error com mensagem do erro
  });
  describe('dado clearSearch chamado', () => {
    ✓ deve recarregar listagem (loadPosts página 1)
  });
});
```

---

### 5. Home (Page)

**Responsabilidade**: Página principal. Orquestra SearchBar + PostList + Pagination + Loading + Error. Instancia use cases e os passa para o hook.

| data-testid | Elemento | Notas |
|-------------|----------|-------|
| `home-page` | `<main>` | Container semântico |
| `home-title` | `<h1>` | "Posts Recentes" ou similar |

**Comportamentos**:
- Ao montar → chama `loadPosts(1)` (carrega primeira página de posts published)
- Pesquisa → chama `searchPosts(query)` (reseta para página 1)
- Limpar busca → chama `clearSearch()` (volta à listagem completa)
- Troca página → chama `loadPosts(newPage)` ou `searchPosts(query, newPage)` dependendo se está buscando
- Loading → exibe `<Loading />` (shared component)
- Erro → exibe `<ErrorMessage message={error} />` (shared component)
- Posts vazios → delegado ao `PostList` (mensagem inline)
- Pagination → exibe apenas se `totalPages > 1`

**Instanciação de dependências** (na page):
```js
// Dentro do componente ou em um factory
const repository = new PostApiRepository();
const listPostsUseCase = new ListPosts(repository);
const searchPostsUseCase = new SearchPosts(repository);
const { posts, pagination, loading, error, loadPosts, searchPosts, clearSearch } = usePosts({
  listPostsUseCase,
  searchPostsUseCase
});
```

> **Alternativa considerada**: Context/Provider para injetar use cases. Descartada por ser overengineering neste momento — a page é o composition root.

**Casos de teste obrigatórios**:
```
describe('Home Page', () => {
  describe('quando a página carrega com sucesso', () => {
    ✓ deve exibir a lista de posts publicados
    ✓ deve exibir a paginação quando há múltiplas páginas
    ✓ não deve exibir paginação se totalPages <= 1
  });
  describe('quando está carregando', () => {
    ✓ deve exibir o spinner de loading
    ✓ não deve exibir posts durante loading
  });
  describe('quando não há posts', () => {
    ✓ deve exibir "Nenhum post encontrado"
  });
  describe('quando ocorre erro na API', () => {
    ✓ deve exibir mensagem de erro
    ✓ não deve exibir o spinner
  });
  describe('quando o usuário busca por "react"', () => {
    ✓ deve exibir apenas posts que contêm o termo
    ✓ deve resetar para página 1
  });
  describe('quando o usuário limpa a busca', () => {
    ✓ deve voltar à listagem completa
  });
  describe('quando o usuário muda de página', () => {
    ✓ deve carregar os posts da nova página
  });
});
```

---

## Padrão de Testes — Convenções

### Para o hook (`usePosts`)

```js
import { renderHook, act, waitFor } from '@testing-library/react';

describe('usePosts', () => {
  it('deve ...', async () => {
    // Given
    const mockListPosts = { execute: jest.fn().mockResolvedValue({ data: [...], pagination: {...} }) };
    const mockSearchPosts = { execute: jest.fn() };

    // When
    const { result } = renderHook(() => usePosts({
      listPostsUseCase: mockListPosts,
      searchPostsUseCase: mockSearchPosts,
    }));

    await act(async () => { result.current.loadPosts(1); });

    // Then
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.posts).toHaveLength(N);
  });
});
```

### Para a page (`Home`)

Nos testes da Home, **mockar o módulo do use case** ou injetar via props/context. A abordagem recomendada é mockar o `PostApiRepository`:

```js
jest.mock('../../infrastructure/repositories/PostApiRepository');
```

Ou criar um wrapper que injeta mocks. Avaliar o que é mais legível e menos frágil.

### Regras inegociáveis (mesmas da Task 06)

| # | Regra |
|---|-------|
| 1 | `it()` apenas — sem `test()` |
| 2 | `@testing-library/user-event` para interações |
| 3 | Sem `setTimeout` ou delays artificiais |
| 4 | `findBy*` > `waitFor` genérico quando possível |
| 5 | Cada `it()` independente |
| 6 | Assert negativo explícito (verificar que algo NÃO ocorre) |

---

## Decisões Técnicas e Trade-offs

| Decisão | Justificativa | Alternativa descartada |
|---------|---------------|----------------------|
| `<Link>` no PostCard (não `onClick + navigate`) | Acessibilidade, SEO, "abrir nova aba" | `onClick` com `useNavigate` |
| Hook recebe use cases por parâmetro (DI) | Testável sem mocks de módulo | Import direto dos use cases no hook |
| Page é composition root (instancia dependências) | Simplicidade; evita Provider/Context extra | Context de DI para use cases |
| PostList como componente separado | SRP; testável em isolamento sem mock de API | Render inline na Home |
| `SearchBar` com `onClear` separado | Semântica: limpar ≠ buscar vazio | Chamar `onSearch("")` |
| Busca reseta para página 1 | UX: evita "página 3 de 1 resultado" | Manter página atual |
| Loading oculta posts (não overlay) | Evita layout shift; mais simples | Skeleton/shimmer |
| Grid responsivo via CSS Grid | Layout nativo, sem lib extra | Flexbox com wrapping manual |

---

## Critérios de Aceitação (QA Checklist)

### ✅ Funcional
- [ ] Home exibe posts com status `published` ao carregar
- [ ] Posts exibem título, autor, data formatada e trecho (150 chars)
- [ ] Clicar em um PostCard navega para `/posts/{id}`
- [ ] Busca por "react" exibe apenas posts com "react" no título/conteúdo
- [ ] Limpar busca volta à listagem completa
- [ ] Paginação funciona (mudar página carrega novos dados)
- [ ] Paginação não aparece se `totalPages <= 1`
- [ ] Loading spinner exibido durante carregamento
- [ ] Mensagem de erro exibida se API falhar
- [ ] "Nenhum post encontrado" se lista vazia

### ✅ Qualidade de Código
- [ ] Hook `usePosts` segue SRP (só estado/orquestração)
- [ ] Componentes presentational não chamam use cases diretamente
- [ ] Sem `console.log` em produção
- [ ] Imports da presentation layer não importam diretamente de infrastructure (exceto Page como composition root)
- [ ] Shared components reutilizados (Pagination, Loading, ErrorMessage)
- [ ] `<time datetime="...">` para datas (semântica HTML)

### ✅ Qualidade de Testes
- [ ] Cobertura ≥ 80% nos artefatos novos
- [ ] Testes de componente usam `user-event` para interações
- [ ] Hook testado com `renderHook` + `act`
- [ ] Page testada com mocks dos use cases/repository
- [ ] Cada cenário testado de forma isolada
- [ ] Sem `setTimeout` ou delays

### ✅ Responsividade
- [ ] 1 coluna em mobile (< 768px)
- [ ] 2 colunas em tablet (768px – 1024px)
- [ ] 3 colunas em desktop (> 1024px)
- [ ] SearchBar com largura total em mobile
- [ ] Cards com altura uniforme por linha

### ✅ Acessibilidade
- [ ] `<main>` como container da page
- [ ] `<article>` para cada PostCard
- [ ] `<time>` com `datetime` para datas
- [ ] `<input type="search">` com `aria-label`
- [ ] Loading com `role="status"` (já implementado no shared)
- [ ] Erro com `role="alert"` (já implementado no shared)
- [ ] Links focáveis via teclado (Tab order)

---

## Ordem de Implementação (TDD)

```
1. PostCard.test.js     → PostCard.js        (componente puro, sem async)
2. PostList.test.js     → PostList.js        (wrapper de PostCards, sem async)
3. SearchBar.test.js    → SearchBar.js       (componente puro de input)
4. usePosts.test.js     → usePosts.js        (hook com async, usa renderHook)
5. Home.test.js         → Home.js            (integração: hook + componentes + shared)
```

**Cada step deve ter todos os testes passando (green) antes de avançar.**

---

## Red Flags — O que Rejeitar em Code Review

| Anti-pattern | Por quê | Correção |
|---|---|---|
| `fetch` ou `axios` direto no componente/hook | Bypass da arquitetura DDD; impossibilita teste unitário | Usar use cases → repository |
| `useEffect` com array de deps vazio + fetch inline | Difícil de testar; mistura concerns | Hook customizado com DI |
| `onClick` no card inteiro (div com handler) | Inacessível por teclado; não é link | `<Link to={...}>` wrapping o card |
| Mock de `axios` nos testes de componente | Testa infra no nível de presentation | Mock do use case ou repository |
| `data-testid` com interpolação não-id | IDs dinâmicos por props são OK para listas | Manter padrão `{nome}-{id}` |
| Pagination reimplementada na Home | Duplicação; já existe shared | `import Pagination from shared` |
| Estado de "buscando" vs "listando" implícito | Bug: mudar página pode buscar ao invés de listar | Estado explícito `isSearching` no hook |
| Loading como overlay sobre posts | Layout shift; complexidade CSS desnecessária | Substituir lista por spinner |

---

## Notas para o Desenvolvedor

1. **`PostApiRepository` já implementa `findAll` e `search`** — os use cases já encapsulam a chamada. O hook deve instanciar/receber os use cases, NÃO a API diretamente.

2. **O formato de retorno dos use cases** é `{ data: Post[], pagination: { page, limit, total, totalPages } }`. O hook deve mapear isso para seu estado interno.

3. **`Pagination` (shared)** espera `{ currentPage, totalPages, onPageChange }` — mapear de `pagination.page` / `pagination.totalPages`.

4. **SearchBar precisa manter estado do query** internamente para saber se está "buscando" ou "listando" ao mudar página. Considerar manter `currentQuery` no hook.

5. **Testes da Home**: Como a Home instancia `PostApiRepository` internamente, a forma mais limpa de testar é:
   - Mockar o módulo `PostApiRepository` (`jest.mock`)
   - Ou extrair a instanciação para uma prop/factory (mais testável mas mais verboso)
   - Escolha pragmática: `jest.mock` do repositório

6. **React Router v7** — usar `<Link to={...}>` para navegação do PostCard.

7. **Breakpoints** do tema: `theme.breakpoints.mobile = '768px'`, `theme.breakpoints.tablet = '1024px'`. Usar `@media (min-width: ...)` nos styled-components.

8. **Rode os testes existentes antes** (`npm test -- --watchAll=false`). Atualmente: 31 suites, 273 testes.
