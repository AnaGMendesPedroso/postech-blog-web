# Task 12 — Roteamento e Integração (App.js + index.js)

## Status: ✅ IMPLEMENTADO

**Data de conclusão:** 2026-05-22

### Resultados da Implementação

| Métrica | Alvo | Resultado |
|---------|------|-----------|
| Testes novos | ≥ 12 cenários BDD | ✅ 19 testes (15 App + 4 NotFound) |
| Suite completa | 440+ passando | ✅ 458 passando (44 suites) |
| Cobertura Statements | ≥ 80% | ✅ 97.58% |
| Cobertura Branches | ≥ 80% | ✅ 93.12% |
| Cobertura Functions | ≥ 80% | ✅ 98.04% |
| Cobertura Lines | ≥ 80% | ✅ 97.45% |
| `act()` warnings NOVOS | 0 | ✅ 0 novos (pré-existentes em usePostForm e LoginPage) |
| Regressões | 0 | ✅ 0 |

### Artefatos entregues

| # | Artefato | Arquivo | Status |
|---|----------|---------|--------|
| 1 | NotFound page | `src/shared/components/NotFound.js` | ✅ Criado |
| 2 | NotFound test | `src/shared/components/NotFound.test.js` | ✅ 4 testes |
| 3 | App.js | `src/App.js` | ✅ Refatorado |
| 4 | App.test.js | `src/App.test.js` | ✅ 15 testes |
| 5 | index.js | `src/index.js` | ✅ Refatorado |
| 6 | CreatePost.js | `src/domains/posts/presentation/pages/CreatePost.js` | ✅ Adicionado `data-testid="create-post-page"` |

### Decisões de implementação

- **Providers em `index.js`**: ThemeProvider → GlobalStyles → AuthProvider → BrowserRouter → App. Mantém App testável com MemoryRouter.
- **App.js puro**: Apenas layout (Header + main + Footer) e mapa de Routes. Zero lógica de providers.
- **Mock do PostApiRepository nos testes**: `jest.mock` com factory retornando métodos mockados evita chamadas HTTP reais nos testes de roteamento.
- **`data-testid="create-post-page"` adicionado ao CreatePost**: Componente original não tinha testid no container. Necessário para teste de roteamento.
- **Arquivos legados removidos**: `App.css`, `logo.svg`, `index.css` deletados. `reportWebVitals.js` mantido (não causa problemas).

---

## Objetivo

Configurar o roteamento da aplicação com React Router DOM v7, integrando todas as páginas, layout principal, rotas protegidas e providers (`AuthProvider`, `ThemeProvider`, `GlobalStyles`). Centralizar a composição de dependências no `index.js`.

---

## Lições Aprendidas (Tasks 01–11)

| # | Lição | Impacto nesta task |
|---|-------|-------------------|
| 1 | **Páginas instanciam seus próprios Use Cases com `useMemo`** — Home, PostDetail, Admin, CreatePost, EditPost criam `new PostApiRepository()` internamente. **Não existe DI central por props.** | ⚠️ A task original propunha `src/config/dependencies.js` com singletons exportados, mas **nenhuma página consome dessa forma**. Criar esse arquivo seria dead code ou exigiria refatorar 5 páginas. **Decisão: NÃO criar `dependencies.js`.** A DI está encapsulada em cada página via `useMemo`. |
| 2 | **`AuthProvider` recebe `authRepository` por prop** — É obrigatório passar a instância de `AuthMockRepository` (ou futura `AuthApiRepository`) | `index.js` deve instanciar o `AuthMockRepository` e passar para `<AuthProvider>` |
| 3 | **`renderWithProviders` de `test-utils.js` já combina Theme + Auth + MemoryRouter** — Padrão consolidado em 440+ testes | Testes do App devem usar `MemoryRouter` com `initialEntries` (não `BrowserRouter`) |
| 4 | **`PrivateRoute` usa `useAuth().isAuthenticated` e redireciona para `/login`** — Componente pronto e testado | Apenas usar `<PrivateRoute>` no mapa de rotas |
| 5 | **Header e Footer usam `useAuth` e `<Link>` — precisam estar dentro de `AuthProvider` + `Router`** | O layout (Header/Footer) precisa estar DENTRO do Router e do AuthProvider |
| 6 | **React Router DOM v7** — API `<Routes>`, `<Route>`, `useParams`, `useNavigate` | Usar API v7 (manteve `element` prop) |
| 7 | **Styled-components ThemeProvider é obrigatório** — Todos os styled components consomem `theme` via prop | ThemeProvider deve envolver toda a árvore |
| 8 | **`GlobalStyles` é um `createGlobalStyle`** — Precisa estar dentro do ThemeProvider pra consumir tema | Colocar após `<ThemeProvider>` e antes do conteúdo |
| 9 | **Não existe página NotFound implementada** — Nenhuma task anterior a criou | ⚠️ Precisamos criar `NotFound.js` + teste. Componente simples. |
| 10 | **`LoginPage` redireciona para `/admin` se já autenticado** — Lógica interna | Rota `/login` renderiza `<LoginPage />` sem wrapper extra |

---

## Entregáveis

| # | Artefato | Arquivo | Descrição |
|---|----------|---------|-----------|
| 1 | NotFound page | `src/shared/components/NotFound.js` | Página 404 simples |
| 2 | NotFound test | `src/shared/components/NotFound.test.js` | Testes BDD da 404 |
| 3 | App.js | `src/App.js` | Configuração de rotas + layout |
| 4 | App.test.js | `src/App.test.js` | Testes de roteamento BDD |
| 5 | index.js | `src/index.js` | Bootstrap com providers e DI do authRepository |

---

## Localização

```
src/
├── App.js              ← Rotas + Layout (Header + main + Footer)
├── App.test.js         ← Testes de roteamento
├── index.js            ← Bootstrap (AuthProvider + ThemeProvider + BrowserRouter)
└── shared/
    └── components/
        ├── NotFound.js       ← NOVO
        └── NotFound.test.js  ← NOVO
```

---

## Especificações Técnicas

### Mapa de Rotas

| Rota | Componente | Acesso | Import path |
|------|-----------|--------|-------------|
| `/` | `Home` | Público | `domains/posts/presentation/pages/Home` |
| `/posts/:id` | `PostDetail` | Público | `domains/posts/presentation/pages/PostDetail` |
| `/login` | `LoginPage` | Público | `domains/auth/presentation/pages/LoginPage` |
| `/admin` | `Admin` | Protegido | `domains/posts/presentation/pages/Admin` |
| `/admin/posts/new` | `CreatePostPage` | Protegido | `domains/posts/presentation/pages/CreatePost` |
| `/admin/posts/:id/edit` | `EditPostPage` | Protegido | `domains/posts/presentation/pages/EditPost` |
| `*` | `NotFound` | Público | `shared/components/NotFound` |

### Arquitetura de Providers (hierarquia)

```
<React.StrictMode>                    ← index.js
  <ThemeProvider theme={theme}>       ← index.js
    <GlobalStyles />                  ← index.js  
    <AuthProvider authRepository={authRepository}>  ← index.js
      <BrowserRouter>                 ← index.js
        <App />                       ← index.js
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
</React.StrictMode>
```

> **Por que os providers ficam em `index.js` e não em `App.js`?**
> - Facilita o teste de `App.js` com `MemoryRouter` (sem conflito com `BrowserRouter`)
> - O `App.js` fica puro: apenas layout + rotas
> - Padrão já consolidado por `renderWithProviders` nos testes

### Estrutura do `App.js`

```jsx
import { Routes, Route } from 'react-router-dom';
import Header from './shared/components/Header';
import Footer from './shared/components/Footer';
import PrivateRoute from './shared/components/PrivateRoute';
import NotFound from './shared/components/NotFound';
import Home from './domains/posts/presentation/pages/Home';
import PostDetail from './domains/posts/presentation/pages/PostDetail';
import LoginPage from './domains/auth/presentation/pages/LoginPage';
import Admin from './domains/posts/presentation/pages/Admin';
import CreatePostPage from './domains/posts/presentation/pages/CreatePost';
import EditPostPage from './domains/posts/presentation/pages/EditPost';

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
          <Route path="/admin/posts/new" element={<PrivateRoute><CreatePostPage /></PrivateRoute>} />
          <Route path="/admin/posts/:id/edit" element={<PrivateRoute><EditPostPage /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
```

### Estrutura do `index.js`

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './shared/contexts/AuthContext';
import AuthMockRepository from './domains/auth/infrastructure/repositories/AuthMockRepository';
import GlobalStyles from './shared/styles/GlobalStyles';
import theme from './shared/styles/theme';
import App from './App';

const authRepository = new AuthMockRepository();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AuthProvider authRepository={authRepository}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
```

### Componente `NotFound`

```jsx
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const Title = styled.h1`
  font-size: 4rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const HomeLink = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.primary};
  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    text-decoration: underline;
  }
`;

function NotFound() {
  return (
    <Container data-testid="not-found-page">
      <Title data-testid="not-found-title">404</Title>
      <Message data-testid="not-found-message">Página não encontrada</Message>
      <HomeLink to="/" data-testid="not-found-link-home">Voltar ao início</HomeLink>
    </Container>
  );
}

export default NotFound;
```

---

## Padrão de Testes (BDD)

### Estratégia de teste para `App.test.js`

**IMPORTANTE:** As páginas instanciam use cases + repositórios internamente e fazem chamadas HTTP (via `PostApiRepository` → `httpClient`). Para testes de roteamento, devemos **mockar o módulo da infra** para evitar chamadas reais e focar apenas em verificar que a rota correta renderiza o componente correto.

```js
// Silenciar chamadas HTTP internas das páginas
jest.mock('./domains/posts/infrastructure/repositories/PostApiRepository');
```

### Helper de teste local

```js
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './shared/contexts/AuthContext';
import { mockAuthRepository } from './shared/test-utils';
import theme from './shared/styles/theme';
import App from './App';

function renderApp(route = '/', { authenticated = false } = {}) {
  const authRepo = mockAuthRepository(
    authenticated
      ? { getCurrentUser: jest.fn(() => ({ id: '1', name: 'User', email: 'u@test.com' })) }
      : {}
  );

  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider authRepository={authRepo}>
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

### Cenários de teste (`App.test.js`)

```js
describe('App Routing', () => {
  describe('Layout global', () => {
    it('deve renderizar o Header em qualquer rota', () => {
      renderApp('/');
      expect(screen.getByTestId('header-nav')).toBeInTheDocument();
    });

    it('deve renderizar o Footer em qualquer rota', () => {
      renderApp('/');
      expect(screen.getByTestId('footer-container')).toBeInTheDocument();
    });
  });

  describe('Rotas públicas', () => {
    describe('dado que o usuário acessa /', () => {
      it('deve renderizar a Home page', () => {
        renderApp('/');
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    describe('dado que o usuário acessa /posts/:id', () => {
      it('deve renderizar a PostDetail page', () => {
        renderApp('/posts/abc-123');
        expect(screen.getByTestId('post-detail-page')).toBeInTheDocument();
      });
    });

    describe('dado que o usuário acessa /login', () => {
      it('deve renderizar a LoginPage', () => {
        renderApp('/login');
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });
  });

  describe('Rotas protegidas — usuário NÃO autenticado', () => {
    describe('dado que o usuário NÃO autenticado acessa /admin', () => {
      it('deve redirecionar para /login', () => {
        renderApp('/admin', { authenticated: false });
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
        expect(screen.queryByTestId('admin-page')).not.toBeInTheDocument();
      });
    });

    describe('dado que o usuário NÃO autenticado acessa /admin/posts/new', () => {
      it('deve redirecionar para /login', () => {
        renderApp('/admin/posts/new', { authenticated: false });
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    describe('dado que o usuário NÃO autenticado acessa /admin/posts/:id/edit', () => {
      it('deve redirecionar para /login', () => {
        renderApp('/admin/posts/xyz/edit', { authenticated: false });
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });
  });

  describe('Rotas protegidas — usuário autenticado', () => {
    describe('dado que o usuário autenticado acessa /admin', () => {
      it('deve renderizar a Admin page', () => {
        renderApp('/admin', { authenticated: true });
        expect(screen.getByTestId('admin-page')).toBeInTheDocument();
      });
    });

    describe('dado que o usuário autenticado acessa /admin/posts/new', () => {
      it('deve renderizar a CreatePost page', () => {
        renderApp('/admin/posts/new', { authenticated: true });
        expect(screen.getByTestId('create-post-page')).toBeInTheDocument();
      });
    });

    describe('dado que o usuário autenticado acessa /admin/posts/:id/edit', () => {
      it('deve renderizar a EditPost page', () => {
        renderApp('/admin/posts/xyz/edit', { authenticated: true });
        expect(screen.getByTestId('edit-post-page')).toBeInTheDocument();
      });
    });
  });

  describe('Rota inexistente (404)', () => {
    describe('dado que o usuário acessa uma rota que não existe', () => {
      it('deve renderizar a página NotFound', () => {
        renderApp('/rota-inexistente');
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });

      it('deve exibir link para voltar ao início', () => {
        renderApp('/pagina-qualquer');
        expect(screen.getByTestId('not-found-link-home')).toHaveAttribute('href', '/');
      });
    });
  });
});
```

### Cenários de teste para `NotFound.test.js`

```js
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../shared/test-utils'; // ← reusa helper existente
import NotFound from './NotFound';

describe('NotFound', () => {
  describe('dado que o componente é renderizado', () => {
    beforeEach(() => {
      renderWithProviders(<NotFound />);
    });

    it('deve exibir o código 404', () => {
      expect(screen.getByTestId('not-found-title')).toHaveTextContent('404');
    });

    it('deve exibir mensagem "Página não encontrada"', () => {
      expect(screen.getByTestId('not-found-message')).toHaveTextContent('Página não encontrada');
    });

    it('deve exibir link para a home', () => {
      expect(screen.getByTestId('not-found-link-home')).toBeInTheDocument();
    });

    it('o link deve apontar para /', () => {
      expect(screen.getByTestId('not-found-link-home')).toHaveAttribute('href', '/');
    });
  });
});
```

---

## Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|:---:|-----------|
| Páginas fazem fetch no mount → efeitos colaterais nos testes de roteamento | Alta | Mock do `PostApiRepository` no nível do módulo (`jest.mock`) retornando Promise pendente ou dados mínimos |
| `act()` warnings por efeitos assíncronos não resolvidos | Média | Aceitar warnings pré-existentes (já documentados em task 11). Testes de roteamento focam em renderização, não resolução de promises |
| React Router v7 breaking changes | Baixa | Versão `^7.15.1` mantém API `element={}`. Verificado na documentação. |
| Loop de redirect Login ↔ Admin | Nula | LoginPage redireciona auth→/admin; PrivateRoute redireciona !auth→/login. Fluxo linear, sem ciclo. |
| `App.css` / `index.css` legados conflitam com GlobalStyles | Baixa | Remover imports e deletar arquivos se desnecessários |

---

## Critérios de Aceitação

- [x] `NotFound.js` implementado com `data-testid="not-found-page"`, título 404, mensagem e link home
- [x] `NotFound.test.js` com ≥ 4 testes passando
- [x] `App.js` limpo — apenas layout (Header + main + Footer) e mapa de `<Routes>`
- [x] `App.js` **NÃO** importa providers (ThemeProvider, AuthProvider, BrowserRouter)
- [x] `index.js` faz composição de providers + instancia `AuthMockRepository`
- [x] `App.test.js` com ≥ 12 cenários BDD cobrindo todas as rotas
- [x] Rotas protegidas redirecionam para `/login` quando não autenticado
- [x] Rotas protegidas permitem acesso quando autenticado
- [x] Header e Footer visíveis em TODAS as rotas (inclusive 404)
- [x] Nenhum `console.error` ou `act()` warning NOVO introduzido
- [x] `npm test -- --coverage` passa com ≥ 80% em branches/functions/lines/statements
- [x] Suite completa (440+ testes) continua passando sem regressão → 458 passando
- [x] Arquivos legados do CRA (`App.css`, `logo.svg`, import do `App.css`) removidos ou limpos

---

## Ordem de Execução (TDD)

1. **Criar `NotFound.test.js`** → rodar (RED) → criar `NotFound.js` → rodar (GREEN)
2. **Criar `App.test.js`** → escrever todos os 12+ cenários → rodar (RED)
3. **Implementar `App.js`** (layout + rotas) → rodar testes de roteamento (GREEN)
4. **Atualizar `index.js`** (providers + DI) → validar app manual (`npm start`)
5. **Limpar legados** — remover `App.css`, `logo.svg`, imports mortos
6. **Rodar suite completa** (`npm test`) — 0 regressões
7. **Rodar coverage** (`npm run test:coverage`) — validar ≥ 80%

---

## O que NÃO fazer nesta task

| ❌ Decisão | Justificativa |
|-----------|---------------|
| Criar `src/config/dependencies.js` com singletons de Use Cases | Nenhuma página consome por props/contexto. Cada página instancia via `useMemo`. Seria dead code. |
| Refatorar páginas para receber Use Cases por props/context | Foge do escopo e quebraria 440 testes. |
| Usar Layout Routes (`<Route element={<Layout />}>`) do React Router | Complexidade desnecessária para o tamanho do projeto. Fragment com Header+main+Footer é suficiente. |
| Criar `<Suspense>` / React.lazy para code splitting | Premature optimization. Bundle é pequeno. Feature futura. |
| Adicionar Error Boundary no nível do router | Boa prática, mas fora do escopo. Cada página já trata seus erros. |
| Criar `reportWebVitals` ou analytics custom | Manter o padrão CRA. Fora do escopo. |

