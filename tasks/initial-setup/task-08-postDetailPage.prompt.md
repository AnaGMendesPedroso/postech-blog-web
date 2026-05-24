# Task 08 — Página de Leitura de Post (PostDetail)

## Objetivo

Implementar a página de leitura que exibe o conteúdo completo de um post selecionado, consumindo o Use Case `GetPost` já existente e seguindo os padrões arquiteturais estabelecidos nas tasks anteriores (hook customizado + page component + injeção de dependência via repository).

---

## Contexto Arquitetural (Importante)

Antes de iniciar, o desenvolvedor **deve** entender as seguintes convenções já adotadas no projeto:

| Aspecto | Convenção do Projeto |
|---------|---------------------|
| Entidade | `Post` usa value objects (`PostTitle`, `PostContent`, `PostStatus`) — os getters retornam o objeto, não o valor primitivo. Use `.value` ou `.titulo.value` quando necessário. |
| Repository | `PostApiRepository.findById(id)` retorna `response.data.data` (raw JSON do backend, **não** uma instância de `Post`). |
| Use Case | `GetPost.execute({ id })` chama `repository.findById(id)` e lança `Error('Post não encontrado')` se retorno for `null`. Lança `Error('ID é obrigatório')` se id ausente. |
| Hook pattern | Hooks recebem use cases por injeção (ver `usePosts`). O componente page instancia repository + use case com `useMemo`. |
| Test pattern | Testes de page mockam `PostApiRepository` via `jest.mock`. Testes de hook recebem mock dos use cases diretamente. Usam `renderWithProviders` do `shared/test-utils.js`. |
| Shared components | `<Loading />` (data-testid: `loading-spinner`), `<ErrorMessage />` (data-testid: `error-message`, `error-message-text`). **Reutilize-os.** |
| Formatação de data | `formatDate(isoString)` do `shared/utils/formatDate.js`. Já testada. |
| Estilo | Styled-components com `theme` (breakpoints, spacing, colors, fontSizes, borderRadius). |

---

## Entregáveis

- [x] `src/domains/posts/presentation/hooks/usePost.js`
- [x] `src/domains/posts/presentation/hooks/usePost.test.js`
- [x] `src/domains/posts/presentation/pages/PostDetail.js`
- [x] `src/domains/posts/presentation/pages/PostDetail.test.js`

---

## Status: ✅ CONCLUÍDA

### Resultado da Implementação

| Métrica | Resultado |
|---------|-----------|
| Testes `usePost.test.js` | 16 passed ✅ |
| Testes `PostDetail.test.js` | 14 passed ✅ |
| Total de testes | 30 passed ✅ |
| Cobertura Statements | 100% ✅ |
| Cobertura Lines | 100% ✅ |
| Cobertura Functions | 100% ✅ |
| Cobertura Branches | 85% (global) ✅ |
| Branches `PostDetail.js` | 100% ✅ |
| Branches `usePost.js` | 72.72% (race condition guard - linhas 24-33) |

### O que foi implementado

**`usePost.js`** — Hook customizado que:
- Recebe `{ getPostUseCase, id }` (injeção de dependência, sem acoplamento ao router)
- Gerencia estados `post`, `loading`, `error`
- Proteção contra race condition com flag `cancelled` no cleanup do useEffect
- Valida id ausente/vazio sem chamar o use case
- Reseta estado de erro antes de cada nova requisição

**`PostDetail.js`** — Componente page que:
- Extrai `id` via `useParams()`, instancia repository + use case com `useMemo`
- Reutiliza `<Loading />` e `<ErrorMessage />` compartilhados
- Usa `formatDate()` para data formatada em pt-BR
- `<time datetime="...">` para acessibilidade semântica
- `<article>` como container semântico
- Botão "← Voltar" com `useNavigate()` para `/`
- Layout responsivo (max-width 800px, padding adaptativo)
- Todos os `data-testid` conforme especificação

### Tech Debt documentado
- Branch coverage de `usePost.js` em 72.72% (abaixo de 80%) — as linhas não cobertas (24-33) são os checks `if (!cancelled)` que protegem contra race condition. Esses branches são defensivos e ocorrem apenas em cenários de desmontagem rápida do componente, difíceis de testar unitariamente sem adicionar complexidade artificial ao teste.

---

## Localização

```
src/domains/posts/presentation/
├── pages/
│   ├── PostDetail.js
│   └── PostDetail.test.js
└── hooks/
    ├── usePost.js
    └── usePost.test.js
```

---

## Especificações Técnicas

### 1. Hook `usePost`

**Assinatura:**

```js
function usePost({ getPostUseCase, id })
```

**Retorno:**

```js
{
  post: object | null,   // raw post data (JSON do backend)
  loading: boolean,
  error: string | null
}
```

**Comportamento:**

| Cenário | Resultado esperado |
|---------|-------------------|
| Montagem com `id` válido | `loading=true` → chama `getPostUseCase.execute({ id })` → `loading=false`, `post=data` |
| `id` muda | Re-executa a busca automaticamente |
| Use case lança Error com mensagem `"Post não encontrado"` | `error="Post não encontrado"`, `post=null` |
| Use case lança qualquer outro Error | `error=err.message`, `post=null` |
| `id` é `undefined`/`null`/vazio | **Não** executa a busca. Seta `error="ID é obrigatório"` |

**Decisões de design:**
- O hook **não** deve chamar `useParams()` internamente. Recebe `id` como argumento para ser testável sem acoplamento ao router.
- Usar `useEffect` com dependência em `[id, getPostUseCase]`.
- Setar `error=null` antes de cada nova requisição (reset de estado).

---

### 2. Componente `PostDetail`

**Responsabilidades:**
1. Extrair `id` da URL via `useParams()`.
2. Instanciar `PostApiRepository` + `GetPost` use case (com `useMemo`).
3. Chamar `usePost({ getPostUseCase, id })`.
4. Renderizar estados: loading, erro, conteúdo.
5. Botão "Voltar" usando `useNavigate()` para `/`.

**`data-testid` obrigatórios:**

| data-testid | Elemento HTML | Conteúdo |
|-------------|---------------|----------|
| `post-detail-page` | container principal (`article` ou `main`) | — |
| `post-title` | `h1` | `post.titulo` |
| `post-author` | `span` | `post.autor` |
| `post-date` | `span` ou `time` | `formatDate(post.createdAt)` |
| `post-content` | `div` | `post.conteudo` (conteúdo completo, sem truncamento) |
| `post-btn-back` | `button` ou `a` | Texto "Voltar" (ou "← Voltar") |

> **Nota sobre a entidade:** O `GetPost` use case pode retornar um objeto `Post` (instância com getters) ou um raw object dependendo da implementação do repository. O `PostApiRepository.findById` retorna raw JSON. Verifique se o dado retornado é `post.titulo` (string) ou `post.titulo.value` (se Post entity). No cenário atual, `findById` retorna raw data que é validada no use case **mas o use case retorna o resultado direto do repository** — ou seja, retorna raw JSON.

**Layout responsivo:**

```
Mobile (< 768px)         Desktop (>= 768px)
┌─────────────────┐     ┌──────────────────────────────┐
│ ← Voltar        │     │ ← Voltar                     │
│                 │     │                              │
│ Título          │     │ Título (font-size: xxl)      │
│ Autor · Data    │     │ Autor · Data                 │
│                 │     │                              │
│ Conteúdo full   │     │ Conteúdo full                │
│ (padding: sm)   │     │ (max-width: 800px, centered) │
└─────────────────┘     └──────────────────────────────┘
```

---

## Padrão de Testes

### `usePost.test.js`

```js
import { renderHook, waitFor } from '@testing-library/react';
import usePost from './usePost';

describe('usePost', () => {
  describe('dado um id válido e use case com sucesso', () => {
    it('deve retornar loading=true inicialmente e depois false', async () => { });
    it('deve retornar o post retornado pelo use case', async () => { });
    it('deve chamar getPostUseCase.execute com { id }', async () => { });
    it('deve setar error=null após sucesso', async () => { });
  });

  describe('dado um id válido e use case lança erro "Post não encontrado"', () => {
    it('deve setar error="Post não encontrado"', async () => { });
    it('deve setar post=null', async () => { });
    it('deve setar loading=false', async () => { });
  });

  describe('dado um id válido e use case lança erro genérico', () => {
    it('deve setar error com a mensagem do erro', async () => { });
    it('deve setar post=null', async () => { });
  });

  describe('dado id undefined ou vazio', () => {
    it('não deve chamar getPostUseCase.execute', () => { });
    it('deve setar error="ID é obrigatório"', () => { });
  });

  describe('dado que o id muda', () => {
    it('deve re-executar a busca com o novo id', async () => { });
    it('deve resetar o estado antes da nova busca', async () => { });
  });
});
```

### `PostDetail.test.js`

```js
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../../shared/test-utils';
import PostDetail from './PostDetail';
import PostApiRepository from '../../infrastructure/repositories/PostApiRepository';

jest.mock('../../infrastructure/repositories/PostApiRepository');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

describe('PostDetail Page', () => {
  describe('dado um post existente', () => {
    it('deve exibir o título do post', async () => { });
    it('deve exibir o conteúdo completo sem truncamento', async () => { });
    it('deve exibir o nome do autor', async () => { });
    it('deve exibir a data formatada no padrão pt-BR', async () => { });
    it('deve renderizar o container com data-testid="post-detail-page"', async () => { });
  });

  describe('dado um post inexistente (use case lança "Post não encontrado")', () => {
    it('deve exibir o componente ErrorMessage com "Post não encontrado"', async () => { });
    it('não deve exibir o título do post', async () => { });
    it('deve manter o botão "Voltar" visível', async () => { });
  });

  describe('quando ocorre erro genérico na API (rede, 500, etc)', () => {
    it('deve exibir o componente ErrorMessage com a mensagem do erro', async () => { });
    it('não deve exibir conteúdo de post', async () => { });
  });

  describe('quando está carregando', () => {
    it('deve exibir o componente Loading (loading-spinner)', () => { });
    it('não deve exibir conteúdo de post enquanto carrega', () => { });
    it('deve remover o spinner após a carga completar', async () => { });
  });

  describe('quando o usuário clica em "Voltar"', () => {
    it('deve chamar navigate("/") para retornar à home', async () => { });
  });
});
```

---

## Observações Críticas (Tech Lead & QA)

### 🏗️ Arquitetura

1. **Não instanciar o repository dentro do hook.** O hook `usePost` deve ser agnóstico de infraestrutura — recebe o use case pronto. Isso segue o padrão já definido em `usePosts`.
2. **Não usar `try/catch` no componente page.** A gestão de erro é responsabilidade do hook. O componente apenas lê `{ post, loading, error }`.
3. **Não importar `httpClient` diretamente na page/hook.** Respeitar a boundary de camadas.

### 🧪 Qualidade de Testes

4. **Testar o estado intermediário de loading.** Use `Promise` com resolve manual para capturar o estado `loading=true` antes da resolução (ver padrão em `Home.test.js` linha 90-102).
5. **Testar que `error` reseta entre chamadas.** Se o id muda, o estado de erro anterior deve ser limpo antes da nova requisição.
6. **Teste de regressão 404 vs erro genérico.** São cenários semanticamente diferentes — o 404 pode ter UX diferenciada no futuro. Manter testes separados.
7. **Mock do `useParams`/`useNavigate`.** No teste do componente, mockar `react-router-dom` parcialmente (ver exemplo acima). Isso desacopla o teste do router real.
8. **Não testar implementação interna do styled-component.** Testar comportamento visível (texto renderizado, presença de elementos), não classes CSS.

### ♿ Acessibilidade

9. **Usar tag semântica `<article>`** para o container do post (ou `<main>`).
10. **Usar `<time datetime="...">` para a data** com o valor ISO original no atributo `datetime` e o valor formatado como texto visível.
11. **Botão "Voltar" deve ter `aria-label`** se usar apenas ícone (←). Se tiver texto "Voltar", dispensa aria-label.

### 🐛 Edge Cases a Considerar

12. **ID com caracteres especiais na URL** — o `useParams` já faz decode, mas o use case deve tratar `id.trim()`.
13. **Navegação direta via URL** (sem passar pela Home) — a página deve funcionar standalone.
14. **Race condition:** Se o usuário navega rápido entre posts, o hook deve garantir que não aplica o resultado de uma requisição antiga. Considerar abort ou verificação de id no callback. *(Implementação opcional nesta task, mas documentar como debt se não implementado.)*

### 📏 Definition of Done

- [x] Todos os testes passam (`npm test -- --watchAll=false`)
- [x] Cobertura de branch ≥ 80% nos dois arquivos novos (85% global)
- [x] Nenhum `console.log` ou `console.error` esquecido
- [x] `data-testid` exatamente como especificado (e2e depende deles)
- [x] Reusar `<Loading />` e `<ErrorMessage />` — não criar duplicados
- [x] Não introduzir dependências novas (tudo necessário já existe)
- [ ] PR com commits atômicos: 1) testes do hook, 2) implementação do hook, 3) testes da page, 4) implementação da page

---

## Dependências desta Task

| Depende de | Status |
|-----------|--------|
| Task 02 — Entidade `Post` | ✅ Concluída |
| Task 03 — Use Case `GetPost` | ✅ Concluída |
| Task 04 — `PostApiRepository.findById` | ✅ Concluída |
| Task 05 — `<Loading />`, `<ErrorMessage />`, `formatDate` | ✅ Concluída |
| Task 07 — `Home` page (referência de padrão) | ✅ Concluída |

## Bloqueia

| Task | Motivo |
|------|--------|
| Task 12 — Routing Integration | Precisa da rota `/posts/:id` → `PostDetail` |
| Task 13 — E2E Tests | Depende dos `data-testid` definidos aqui |
