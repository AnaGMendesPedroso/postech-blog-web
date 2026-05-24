# Task 05 — Shared Components e Estilização

## Objetivo

Implementar os componentes compartilhados (Header, Footer, Pagination, PrivateRoute, Loading, ErrorMessage), o contexto de autenticação (`AuthContext`), e utilitários — todos com testes unitários, `data-testid` fixos para E2E, e abordagem mobile-first com styled-components.

**Nota arquitetural:** Esta task cria a **fundação visual e de UX** do projeto. Componentes aqui devem ser **puros, reutilizáveis e sem lógica de negócio** (exceto `PrivateRoute` que consome contexto de auth). A estilização usa o `theme.js` já existente (Task 01).

---

## Entregáveis

- [x] `GlobalStyles.js` — já existe, validado ✅ (sem alteração necessária)
- [x] `theme.js` — já existe, validado ✅ (sem alteração necessária)
- [x] `AuthContext.test.js` + `AuthContext.js` — Provider de autenticação (necessário para Header e PrivateRoute)
- [x] `Header.test.js` + `Header.js`
- [x] `Footer.test.js` + `Footer.js`
- [x] `Pagination.test.js` + `Pagination.js`
- [x] `PrivateRoute.test.js` + `PrivateRoute.js`
- [x] `Loading.test.js` + `Loading.js`
- [x] `ErrorMessage.test.js` + `ErrorMessage.js`
- [x] `formatDate.test.js` + `formatDate.js`
- [x] `truncateText.test.js` + `truncateText.js`
- [x] Todos com `data-testid` fixos conforme convenção
- [x] Responsivos (mobile-first usando breakpoints do theme)
- [x] Cobertura ≥ 80% em statements, branches, functions e lines

---

## Localização

```
src/shared/
├── components/
│   ├── Header.js
│   ├── Header.test.js
│   ├── Footer.js
│   ├── Footer.test.js
│   ├── Pagination.js
│   ├── Pagination.test.js
│   ├── PrivateRoute.js
│   ├── PrivateRoute.test.js
│   ├── Loading.js
│   ├── Loading.test.js
│   ├── ErrorMessage.js
│   └── ErrorMessage.test.js
├── contexts/
│   ├── AuthContext.js
│   └── AuthContext.test.js
├── styles/
│   ├── GlobalStyles.js          ← já existe (Task 01)
│   └── theme.js                 ← já existe (Task 01)
└── utils/
    ├── formatDate.js
    ├── formatDate.test.js
    ├── truncateText.js
    └── truncateText.test.js
```

---

## Pré-requisitos: Análise do que já existe

### `theme.js` — ✅ Já implementado (Task 01)

O tema já contém: `colors`, `spacing`, `breakpoints`, `borderRadius`, `fontSizes`. **Não alterar** — usar como está.

### `GlobalStyles.js` — ✅ Já implementado (Task 01)

Reset CSS com styled-components + uso de `theme.colors`. **Não alterar.**

---

## Especificações Técnicas

### AuthContext (NOVO — dependência obrigatória para Header e PrivateRoute)

**Por que existe:** O `Header` precisa saber se o user está autenticado para exibir links condicionais. O `PrivateRoute` precisa proteger rotas. Sem um Context, cada componente dependeria diretamente do `AuthMockRepository`, violando inversão de dependências.

```js
// AuthContext.js
import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children, authRepository }) {
  const [user, setUser] = useState(() => authRepository.getCurrentUser());

  const login = useCallback(async (email, password) => {
    const result = await authRepository.login(email, password);
    setUser(result.user);
    return result;
  }, [authRepository]);

  const logout = useCallback(async () => {
    await authRepository.logout();
    setUser(null);
  }, [authRepository]);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export default AuthContext;
```

**Princípios:**
- `authRepository` é injetado via prop (facilita testes e troca de implementação)
- `useAuth()` com guard — erro explícito se usado fora do Provider
- Estado derivado: `isAuthenticated = user !== null`

---

### Header

| data-testid | Elemento | Comportamento |
|-------------|----------|---------------|
| `header-nav` | `<nav>` | Container principal, sticky top |
| `header-logo` | Link | Logo/nome do blog, navega para `/` |
| `header-link-home` | Link | "Início", navega para `/` |
| `header-link-admin` | Link | "Painel", navega para `/admin` (só se `isAuthenticated`) |
| `header-link-login` | Link | "Entrar", navega para `/login` (só se `!isAuthenticated`) |
| `header-btn-logout` | `<button>` | "Sair", chama `logout()` (só se `isAuthenticated`) |

**Regras:**
1. Consome `useAuth()` para obter `isAuthenticated` e `logout`
2. Links condicionais: login XOR (admin + logout) — nunca ambos ao mesmo tempo
3. Responsivo: em mobile, links colapsam em menu hambúrguer (pode ser implementado em task futura — por agora, manter inline com wrap)
4. Usa `react-router-dom` `<Link>` para navegação SPA

**Styled Components esperados:**
- `NavContainer` — sticky, background surface, shadow sutil, padding horizontal
- `NavLink` — styled Link com hover state usando theme.colors.primary

---

### Footer

| data-testid | Elemento | Comportamento |
|-------------|----------|---------------|
| `footer-container` | `<footer>` | Container com background escuro |
| `footer-text` | `<p>` | "© 2026 PosTech Blog. Todos os direitos reservados." |

**Regras:**
1. Componente puramente visual, sem lógica
2. Texto dinâmico com ano atual: `new Date().getFullYear()`
3. Centralizado, padding vertical

---

### Pagination

| data-testid | Elemento | Comportamento |
|-------------|----------|---------------|
| `pagination-container` | `<nav>` | Container (semanticamente correto: `<nav aria-label="Paginação">`) |
| `pagination-btn-prev` | `<button>` | Página anterior — `disabled` se `currentPage === 1` |
| `pagination-btn-next` | `<button>` | Próxima página — `disabled` se `currentPage === totalPages` |
| `pagination-btn-page-{n}` | `<button>` | Vai para página N, destaque visual na active |
| `pagination-info` | `<span>` | "Página X de Y" (acessibilidade/mobile) |

**Props:**
```ts
{
  currentPage: number,   // 1-indexed
  totalPages: number,    // Total de páginas
  onPageChange: (page: number) => void
}
```

**Regras:**
1. **Não renderizar** se `totalPages <= 1` (retorna `null`)
2. Botão prev disabled quando `currentPage === 1`
3. Botão next disabled quando `currentPage === totalPages`
4. Exibir no máximo 5 botões de página (com elipses se > 5 páginas)
5. `onPageChange` é chamado com o número da página (1-indexed)
6. Botões disabled não disparam `onPageChange`

**Lógica de janela de páginas (máx 5 visíveis):**
```
Para totalPages <= 5: mostrar todas
Para totalPages > 5:
  - Se currentPage <= 3: [1,2,3,4,5]
  - Se currentPage >= totalPages-2: [N-4, N-3, N-2, N-1, N]
  - Senão: [current-2, current-1, current, current+1, current+2]
```

---

### PrivateRoute

| data-testid | Elemento | Comportamento |
|-------------|----------|---------------|
| (nenhum próprio) | Wrapper | Renderiza children se autenticado |

**Props:**
```ts
{
  children: ReactNode
}
```

**Regras:**
1. Consome `useAuth()` para obter `isAuthenticated`
2. Se `isAuthenticated === true` → renderiza `children`
3. Se `isAuthenticated === false` → renderiza `<Navigate to="/login" replace />`
4. **Não** exibe loading enquanto verifica — decisão: se não está no context, é não-autenticado
5. Usa `Navigate` do react-router-dom (não `useNavigate` imperativo)

---

### Loading

| data-testid | Elemento | Comportamento |
|-------------|----------|---------------|
| `loading-spinner` | `<div>` | Spinner animado centralizado |
| `loading-text` | `<p>` | Texto opcional "Carregando..." |

**Props:**
```ts
{
  size?: 'sm' | 'md' | 'lg',  // default: 'md'
  text?: string                 // default: 'Carregando...'
}
```

**Regras:**
1. Animação CSS pura (keyframes rotate) — sem dependências externas
2. Centralizado vertical e horizontalmente no container pai
3. Tamanhos: sm=24px, md=40px, lg=64px
4. Cor do spinner: `theme.colors.primary`

---

### ErrorMessage

| data-testid | Elemento | Comportamento |
|-------------|----------|---------------|
| `error-message` | `<div>` | Container com background vermelho claro |
| `error-message-text` | `<p>` | Texto da mensagem de erro |
| `error-message-dismiss` | `<button>` | Botão fechar (opcional, se `onDismiss` fornecido) |

**Props:**
```ts
{
  message: string,
  onDismiss?: () => void   // Se fornecido, exibe botão X para fechar
}
```

**Regras:**
1. **Não renderizar** se `message` é vazio/null/undefined (retorna `null`)
2. Estilo: border-left vermelho, background rosa claro, ícone de alerta (pode ser emoji ou react-icons)
3. Botão dismiss só aparece se `onDismiss` é fornecido
4. Acessibilidade: `role="alert"` no container

---

### Utilitários

#### `formatDate(isoString)`

| Input | Output |
|-------|--------|
| `'2026-05-22T10:30:00.000Z'` | `'22 mai. 2026'` |
| `'2024-01-15T08:00:00.000Z'` | `'15 jan. 2024'` |
| `null` | `''` |
| `undefined` | `''` |
| `'invalid'` | `''` |

**Regras:**
1. Usar `Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })`
2. Retornar string vazia para inputs inválidos (sem lançar erro)
3. Não depender de timezone — usar UTC

#### `truncateText(text, maxLength = 150)`

| Input | Output |
|-------|--------|
| `'Hello World', 5` | `'Hello...'` |
| `'Short', 100` | `'Short'` |
| `'', 50` | `''` |
| `null, 50` | `''` |

**Regras:**
1. Se `text.length <= maxLength`: retornar texto inalterado
2. Se `text.length > maxLength`: truncar e adicionar `'...'`
3. Retornar string vazia se input é null/undefined/vazio
4. Default `maxLength = 150`

---

## Padrão de Testes (BDD com Given-When-Then)

### Helpers de teste necessários:

```js
// test-utils.js (helper para renderizar com providers)
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import theme from '../styles/theme';

export function renderWithProviders(ui, {
  authRepository = mockAuthRepository(),
  initialEntries = ['/'],
  ...options
} = {}) {
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider authRepository={authRepository}>
        <MemoryRouter initialEntries={initialEntries}>
          {ui}
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>,
    options
  );
}

function mockAuthRepository(overrides = {}) {
  return {
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(() => null),
    isAuthenticated: jest.fn(() => false),
    ...overrides
  };
}
```

### Header.test.js — Cenários obrigatórios:

```js
describe('Header', () => {
  describe('dado usuário não autenticado', () => {
    it('deve renderizar link para home', () => { /* ... */ });
    it('deve renderizar link para login', () => { /* ... */ });
    it('não deve renderizar link para admin', () => { /* ... */ });
    it('não deve renderizar botão de logout', () => { /* ... */ });
  });

  describe('dado usuário autenticado', () => {
    it('deve renderizar link para admin', () => { /* ... */ });
    it('deve renderizar botão de logout', () => { /* ... */ });
    it('não deve renderizar link para login', () => { /* ... */ });
  });

  describe('quando o usuário clica em logout', () => {
    it('deve chamar a função logout do context', () => { /* ... */ });
  });
});
```

### Pagination.test.js — Cenários obrigatórios:

```js
describe('Pagination', () => {
  describe('dado totalPages <= 1', () => {
    it('não deve renderizar nada', () => { /* ... */ });
  });

  describe('dado que está na primeira página de 5', () => {
    it('deve desabilitar o botão anterior', () => { /* ... */ });
    it('deve habilitar o botão próximo', () => { /* ... */ });
    it('deve destacar visualmente a página atual', () => { /* ... */ });
  });

  describe('dado que está na última página', () => {
    it('deve habilitar o botão anterior', () => { /* ... */ });
    it('deve desabilitar o botão próximo', () => { /* ... */ });
  });

  describe('quando o usuário clica no botão próximo', () => {
    it('deve chamar onPageChange com página atual + 1', () => { /* ... */ });
  });

  describe('quando o usuário clica no botão anterior', () => {
    it('deve chamar onPageChange com página atual - 1', () => { /* ... */ });
  });

  describe('quando o usuário clica em uma página específica', () => {
    it('deve chamar onPageChange com o número da página', () => { /* ... */ });
  });

  describe('dado mais de 5 páginas', () => {
    it('deve exibir no máximo 5 botões de página', () => { /* ... */ });
  });
});
```

### PrivateRoute.test.js — Cenários obrigatórios:

```js
describe('PrivateRoute', () => {
  describe('dado usuário autenticado', () => {
    it('deve renderizar children', () => { /* ... */ });
  });

  describe('dado usuário não autenticado', () => {
    it('deve redirecionar para /login', () => { /* ... */ });
    it('não deve renderizar children', () => { /* ... */ });
  });
});
```

### Loading.test.js — Cenários obrigatórios:

```js
describe('Loading', () => {
  it('deve renderizar com data-testid loading-spinner', () => { /* ... */ });
  it('deve exibir texto "Carregando..." por default', () => { /* ... */ });
  it('deve exibir texto customizado quando fornecido', () => { /* ... */ });
});
```

### ErrorMessage.test.js — Cenários obrigatórios:

```js
describe('ErrorMessage', () => {
  describe('dado message vazia', () => {
    it('não deve renderizar nada', () => { /* ... */ });
  });

  describe('dado message preenchida', () => {
    it('deve exibir a mensagem com role="alert"', () => { /* ... */ });
  });

  describe('dado onDismiss fornecido', () => {
    it('deve exibir botão de fechar', () => { /* ... */ });
    it('deve chamar onDismiss ao clicar no botão', () => { /* ... */ });
  });

  describe('dado onDismiss não fornecido', () => {
    it('não deve exibir botão de fechar', () => { /* ... */ });
  });
});
```

### formatDate.test.js — Cenários obrigatórios:

```js
describe('formatDate', () => {
  it('deve formatar data ISO válida para formato pt-BR', () => { /* ... */ });
  it('deve retornar string vazia para null', () => { /* ... */ });
  it('deve retornar string vazia para undefined', () => { /* ... */ });
  it('deve retornar string vazia para string inválida', () => { /* ... */ });
  it('deve retornar string vazia para string vazia', () => { /* ... */ });
});
```

### truncateText.test.js — Cenários obrigatórios:

```js
describe('truncateText', () => {
  it('deve retornar texto inalterado se menor que maxLength', () => { /* ... */ });
  it('deve truncar e adicionar "..." se maior que maxLength', () => { /* ... */ });
  it('deve usar maxLength default de 150', () => { /* ... */ });
  it('deve retornar string vazia para null', () => { /* ... */ });
  it('deve retornar string vazia para undefined', () => { /* ... */ });
  it('deve retornar string vazia para input vazio', () => { /* ... */ });
});
```

---

## Revisão Crítica — O que NÃO fazer (Anti-patterns)

| Anti-pattern | Por quê é problema | Solução |
|---|---|---|
| Importar `AuthMockRepository` diretamente no Header | Acopla componente UI à implementação de infra | Usar `AuthContext` com repository injetado |
| Testar styled-components via snapshots | Frágeis, quebram com qualquer mudança de estilo | Testar comportamento (visibilidade, disabled, click) |
| `data-testid` dinâmicos (ex: `testid={`btn-${id}`}`) nos componentes base | Dificulta seleção nos testes E2E | IDs fixos e previsíveis |
| `useNavigate()` imperativo dentro de PrivateRoute | Causa loops de render e problemas com SSR | Usar `<Navigate>` declarativo |
| Componentes com estado interno que deveria ser do parent | Dificulta composição e testes | Props down, events up |
| Lógica de negócio dentro dos componentes shared | Viola separação de responsabilidades | Componentes shared são **puramente presentacionais** (exceto PrivateRoute) |
| Esquecer `role="alert"` no ErrorMessage | Falha de acessibilidade — screen readers não anunciam | Sempre adicionar roles ARIA semânticos |
| Pagination sem `aria-label` | Inacessível para navegação por teclado/screen reader | Usar `<nav aria-label="Paginação">` |

---

## Decisões Arquiteturais (ADR Resumidos)

### ADR-05.1: AuthContext como Provider com repository injetado

**Contexto:** Header e PrivateRoute precisam de estado de autenticação. Múltiplos componentes consumirão esse estado.  
**Decisão:** Criar `AuthContext` com `AuthProvider` que recebe `authRepository` como prop.  
**Consequência:** Facilita testes (injeta mock), respeita DIP, permite trocar de `AuthMockRepository` para `AuthApiRepository` sem alterar UI.

### ADR-05.2: Pagination não renderiza para totalPages <= 1

**Contexto:** Exibir paginação com "Página 1 de 1" é ruído visual.  
**Decisão:** Retornar `null` se não há mais de 1 página.  
**Consequência:** UI mais limpa. Testes devem cobrir este edge case.

### ADR-05.3: Mobile-first sem menu hambúrguer (por agora)

**Contexto:** Task de menu responsivo complexo pode atrasar a entrega.  
**Decisão:** Header usa flexbox com wrap em mobile. Menu hambúrguer será adicionado em task futura se necessário.  
**Consequência:** Funcional em mobile, mas não ideal visualmente. Prioriza entrega.

### ADR-05.4: Utilitários são funções puras sem efeitos colaterais

**Contexto:** `formatDate` e `truncateText` são usados em múltiplos locais.  
**Decisão:** Funções puras que recebem input e retornam output, sem dependências externas.  
**Consequência:** Testáveis trivialmente, sem mocks necessários.

---

## Acessibilidade (a11y) — Requisitos mínimos

| Componente | Requisito |
|------------|-----------|
| Header | `<nav>` semântico, links focusáveis com tab |
| Footer | `<footer>` semântico |
| Pagination | `<nav aria-label="Paginação">`, botões com `aria-disabled` |
| Loading | `aria-busy="true"`, `role="status"` |
| ErrorMessage | `role="alert"` (assertivo para screen readers) |

---

## Critérios de Aceitação (Definition of Done)

- [x] `AuthContext` implementado com Provider e hook `useAuth()`
- [x] Helper `renderWithProviders` criado para testes com ThemeProvider + AuthProvider + MemoryRouter
- [x] Todos os componentes interativos possuem `data-testid` fixo conforme tabelas acima
- [x] Componentes responsivos (mobile-first, usando `theme.breakpoints`)
- [x] Styled Components utilizados para estilização (sem CSS inline)
- [x] Pagination não renderiza para `totalPages <= 1`
- [x] ErrorMessage não renderiza para message vazia/null
- [x] PrivateRoute redireciona com `<Navigate>` declarativo
- [x] Utilitários (`formatDate`, `truncateText`) são funções puras, resilientes a inputs inválidos
- [x] Acessibilidade: roles ARIA corretos em todos os componentes
- [x] Cobertura ≥ 80% em statements, branches, functions e lines
- [x] Nenhum componente importa diretamente `AuthMockRepository`
- [x] Testes usam `@testing-library/react` com queries por testid e role
- [x] Zero warnings no console durante execução dos testes

---

## Dependências

| De | Para | Status |
|----|------|--------|
| Task 01 | `theme.js`, `GlobalStyles.js` | ✅ Concluída |
| Task 04 | `AuthMockRepository` (consumido pelo AuthContext) | ✅ Concluída |
| Task 05 → | Task 06 (AuthDomain pages) | ⚠️ AuthContext será consumido |
| Task 05 → | Task 07-11 (Pages) | ⚠️ Componentes shared serão usados em todas as pages |
| Task 05 → | Task 12 (Routing) | ⚠️ PrivateRoute será usado no router |
| Task 05 → | Task 13 (E2E) | ⚠️ data-testid usados nos seletores E2E |

---

## Estimativa

| Item | Tempo estimado |
|------|----------------|
| AuthContext + testes | 45 min |
| Header + testes | 1h |
| Footer + testes | 20 min |
| Pagination + testes (lógica de janela) | 1h |
| PrivateRoute + testes | 30 min |
| Loading + ErrorMessage + testes | 40 min |
| formatDate + truncateText + testes | 30 min |
| Helper renderWithProviders | 15 min |
| Revisão, cobertura e a11y check | 30 min |
| **Total** | **~5h30** |

---

## Notas para o desenvolvedor

1. **Ordem de implementação sugerida:** utils → AuthContext → Loading → ErrorMessage → Footer → Header → Pagination → PrivateRoute (do mais simples ao mais complexo, build dependencies naturalmente)
2. **Styled-components ThemeProvider** já deve estar no App.js wrapping tudo — se não estiver, adicionar nesta task.
3. **react-router-dom** está no package.json — usar `Link`, `Navigate`, `useNavigate` dele.
4. **react-icons** está disponível — pode ser usado para ícones no ErrorMessage e Header se desejado.

---

## ✅ Resultado da Implementação (Concluída em 22/05/2026)

### Status: CONCLUÍDA

**67 testes passando | Cobertura: 96.5% stmts, 93.61% branches, 96.05% funcs, 96.21% lines**

### Arquivos criados

```
src/shared/
├── components/
│   ├── Header.js                  ✅ (9 testes)
│   ├── Header.test.js             ✅
│   ├── Footer.js                  ✅ (3 testes)
│   ├── Footer.test.js             ✅
│   ├── Pagination.js              ✅ (13 testes)
│   ├── Pagination.test.js         ✅
│   ├── PrivateRoute.js            ✅ (3 testes)
│   ├── PrivateRoute.test.js       ✅
│   ├── Loading.js                 ✅ (5 testes)
│   ├── Loading.test.js            ✅
│   ├── ErrorMessage.js            ✅ (6 testes)
│   └── ErrorMessage.test.js       ✅
├── contexts/
│   ├── AuthContext.js             ✅ (5 testes)
│   └── AuthContext.test.js        ✅
├── test-utils.js                  ✅ (helper renderWithProviders + mockAuthRepository)
└── utils/
    ├── formatDate.js              ✅ (6 testes)
    ├── formatDate.test.js         ✅
    ├── truncateText.js            ✅ (6 testes)
    └── truncateText.test.js       ✅
```

### Arquivos modificados

| Arquivo | Alteração | Motivo |
|---------|-----------|--------|
| `package.json` | Adicionado `moduleNameMapper` no jest config | react-router-dom v7 usa `exports` field que o resolver do Jest (react-scripts 5) não suporta nativamente |
| `src/setupTests.js` | Adicionado polyfill `TextEncoder`/`TextDecoder` | react-router v7 usa `TextEncoder` internamente, indisponível no jsdom do Jest |

### Cobertura detalhada

| Arquivo | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| ErrorMessage.js | 100% | 100% | 100% | 100% |
| Footer.js | 100% | 100% | 100% | 100% |
| Header.js | 100% | 100% | 100% | 100% |
| Loading.js | 100% | 66.66% | 100% | 100% |
| Pagination.js | 100% | 100% | 100% | 100% |
| PrivateRoute.js | 100% | 100% | 100% | 100% |
| AuthContext.js | 100% | 100% | 100% | 100% |
| formatDate.js | 87.5% | 100% | 100% | 83.33% |
| truncateText.js | 100% | 100% | 100% | 100% |
| **Total** | **96.5%** | **93.61%** | **96.05%** | **96.21%** |

### Decisões técnicas tomadas durante implementação

1. **react-router-dom v7 + Jest**: Necessitou `moduleNameMapper` para resolver corretamente os módulos via `main` field (v7 usa `exports` que jest-resolve do CRA 5 não suporta)
2. **TextEncoder polyfill**: react-router v7 usa `TextEncoder` internamente (para URL encoding), indisponível no ambiente jsdom — polyfill adicionado em `setupTests.js`
3. **Styled-components transient props**: Usados `$size` e `$active` (prefixo `$`) para evitar que props customizadas sejam passadas ao DOM (Warning de React)
4. **Emoji para ícone de alerta**: ErrorMessage usa emoji ⚠️ ao invés de react-icons, mantendo zero dependência adicional no componente
5. **Ordem de implementação seguida**: utils → AuthContext → Loading → ErrorMessage → Footer → Header → Pagination → PrivateRoute (conforme sugerido)
6. **test-utils.js em `src/shared/`**: Helper centralizado exporta `renderWithProviders` e `mockAuthRepository` — reutilizável por todas as tasks futuras
