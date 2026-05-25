# Postech Blog Web

Interface gráfica para a plataforma de blogging educacional da Pós-Tech FIAP.

Uma versão enxuta do README: este ficheiro contém a descrição do projeto e os passos mínimos para rodar localmente. Conteúdo detalhado (arquitetura, testes, E2E, integração com a API, contribuição) foi movido para a pasta `docs/` para facilitar a leitura.

Links rápidos

- Índice da documentação: `docs/README.md`
- Arquitetura e organização do código: `docs/ARCHITECTURE.md`
- Setup & primeiro run: `docs/SETUP.md`
- Testes (unitários, mutação, E2E): `docs/TESTING.md`
- Testes E2E e script de setup: `docs/E2E.md`
- Integração com a API (endpoints): `docs/API.md`
- Como contribuir: `docs/CONTRIBUTING.md`


## Descrição curta

SPA em React com arquitetura DDD para gerenciamento de posts educacionais. Possui domínio `posts` e `auth`, testes unitários, testes de mutação (Stryker) e testes E2E (Playwright).

## Pré-requisitos mínimos

- Node.js >= 18
- npm >= 9
- (opcional) API backend rodando em `http://localhost:3000` para testar fluxos completos

## Quickstart — rodando localmente pela primeira vez

```bash
# 1. Clonar
git clone <repo-url>
cd postech-blog-web

# 2. Instalar dependências
npm install

# 3. Criar .env mínimo
echo "REACT_APP_API_URL=http://localhost:3000" > .env

# 4. Iniciar o dev server
npm start
```

A aplicação ficará disponível em `http://localhost:3000` (dev). Para executar os testes E2E com o setup automatizado use `npm run test:e2e:setup` — mais detalhes em `docs/E2E.md`.

---

## Descrição

Aplicação front-end desenvolvida em React que oferece uma interface intuitiva e responsiva para docentes criarem, editarem e gerenciarem publicações educacionais, e para alunos(as) visualizarem, lerem e buscarem conteúdos de forma centralizada.

## Problema

Professores e professoras da rede pública de educação não têm plataformas onde postar suas aulas e transmitir conhecimento de forma prática, centralizada e tecnológica.

## Solução

Uma SPA (Single Page Application) que consome uma API REST existente, implementando:

- **Página pública** com listagem, busca e leitura de posts
- **Área administrativa** protegida para criação, edição e exclusão de posts
- **Autenticação real via API** com login, cadastro e logout (token JWT em `localStorage`)

---

## Tecnologias

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | 19.x | UI com componentes funcionais e hooks |
| React Router DOM | 7.x | Roteamento SPA |
| Axios | 1.x | Cliente HTTP para consumo da API |
| Styled Components | 6.x | Estilização CSS-in-JS com temas |
| React Icons | 5.x | Ícones SVG |
| Jest | 29.x | Framework de testes unitários |
| React Testing Library | 16.x | Testes de componentes React |
| Stryker Mutator | 9.x | Testes de mutação |
| Playwright | 1.x | Testes end-to-end |

---

## Arquitetura — Domain Driven Design (DDD)

### Por que DDD no Front-end?

O DDD no front-end garante:
- **Separação clara de responsabilidades** entre UI, lógica de negócio e acesso a dados
- **Testabilidade** — cada camada pode ser testada isoladamente
- **Manutenibilidade** — mudanças na API não afetam regras de negócio
- **Domínios independentes** — `posts` e `auth` não se acoplam diretamente

### Estrutura de Pastas

```
src/
├── domains/                        # Bounded Contexts
│   ├── posts/                      # Domínio: Posts
│   │   ├── domain/                 # Regras de negócio puras
│   │   │   ├── entities/
│   │   │   │   └── Post.js
│   │   │   ├── value-objects/
│   │   │   │   ├── PostTitle.js    # min 3, max 200 chars
│   │   │   │   ├── PostContent.js  # min 10 chars
│   │   │   │   └── PostStatus.js   # draft | published
│   │   │   └── repositories/
│   │   │       └── PostRepository.js  # Interface (contrato)
│   │   ├── application/            # Orquestração (Use Cases)
│   │   │   ├── usecases/
│   │   │   │   ├── ListPosts.js
│   │   │   │   ├── SearchPosts.js
│   │   │   │   ├── GetPost.js
│   │   │   │   ├── CreatePost.js
│   │   │   │   ├── UpdatePost.js
│   │   │   │   └── DeletePost.js
│   │   │   └── dto/
│   │   │       ├── CreatePostDTO.js
│   │   │       └── UpdatePostDTO.js
│   │   ├── infrastructure/         # Implementação de I/O
│   │   │   └── repositories/
│   │   │       └── PostApiRepository.js
│   │   └── presentation/           # UI (React)
│   │       ├── pages/
│   │       │   ├── Home.js
│   │       │   ├── PostDetail.js
│   │       │   ├── CreatePost.js
│   │       │   ├── EditPost.js
│   │       │   └── Admin.js
│   │       ├── components/
│   │       │   ├── PostCard.js
│   │       │   ├── PostForm.js
│   │       │   ├── PostList.js
│   │       │   └── SearchBar.js
│   │       └── hooks/
│   │           ├── usePosts.js
│   │           ├── usePost.js
│   │           └── usePostForm.js
│   └── auth/                       # Domínio: Autenticação
│       ├── domain/entities/User.js
│       ├── application/usecases/
│       │   ├── Login.js
│       │   ├── Logout.js
│       │   └── Register.js
│       ├── infrastructure/repositories/
│       │   ├── AuthApiRepository.js   # Implementação real (API JWT)
│       │   └── AuthMockRepository.js  # Implementação mock (testes)
│       └── presentation/
│           ├── pages/
│           │   ├── LoginPage.js
│           │   └── RegisterPage.js
│           └── components/
│               ├── LoginForm.js
│               └── RegisterForm.js
├── shared/                         # Código compartilhado
│   ├── components/
│   │   ├── Header.js               # Navegação + logout → redireciona para /
│   │   ├── Footer.js
│   │   ├── Loading.js
│   │   ├── ErrorMessage.js
│   │   ├── Pagination.js
│   │   ├── NotFound.js             # Página 404
│   │   ├── PrivateRoute.js         # Proteção: requer autenticação
│   │   └── TeacherRoute.js         # Proteção: requer role=teacher
│   ├── contexts/AuthContext.js     # Context API para autenticação
│   ├── infrastructure/http/httpClient.js  # Axios configurado
│   ├── styles/                     # GlobalStyles, theme
│   └── utils/                      # formatDate, truncateText
├── App.js                          # Rotas e layout
└── index.js
```

### Mapeamento de Camadas

| Camada | Responsabilidade | Dependências |
|--------|------------------|--------------|
| **Domain** | Regras de negócio, validações, invariantes | Nenhuma (pura) |
| **Application** | Orquestração de use cases, coordenação | Domain |
| **Infrastructure** | Comunicação com API, persistência | Application (implementa interfaces) |
| **Presentation** | Componentes React, hooks, páginas | Application (consome use cases) |

### Fluxo de Dados

```
Page → Hook → Use Case → Repository (Interface) → PostApiRepository → API HTTP
                ↓
            Domain (Entities/VOs validam dados)
```

---

## Pré-requisitos

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **API Back-end** rodando em `http://localhost:3000` (obrigatório para E2E e uso real)

## Setup e Instalação

```bash
# Clonar o repositório
git clone <repo-url>
cd postech-blog-web

# Instalar dependências
npm install

# Configurar variáveis de ambiente
echo "REACT_APP_API_URL=http://localhost:3000" > .env

# Iniciar aplicação em modo desenvolvimento
npm start
```

A aplicação estará disponível em `http://localhost:3001` (E2E) ou `http://localhost:3000` (desenvolvimento padrão).

## Variáveis de Ambiente

| Variável | Default | Descrição |
|----------|---------|-----------|
| `REACT_APP_API_URL` | `http://localhost:3000` | URL base da API REST |
| `PLAYWRIGHT_HEADED` | `false` | Define `true` para executar testes E2E com browser visível |

---

## Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| `start` | `npm start` | Inicia o servidor de desenvolvimento |
| `build` | `npm run build` | Gera build de produção otimizado |
| `test` | `npm test` | Executa testes unitários em modo watch |
| `test:coverage` | `npm run test:coverage` | Executa testes com relatório de cobertura (mín. 80%) |
| `test:mutation` | `npm run test:mutation` | Executa testes de mutação (Stryker) |
| `test:e2e` | `npm run test:e2e` | Executa testes E2E headless (Playwright) |
| `test:e2e:headed` | `npm run test:e2e:headed` | Executa testes E2E com browser visível |
| `test:e2e:ui` | `npm run test:e2e:ui` | Abre Playwright UI mode (debug interativo) |
| `test:e2e:setup` | `npm run test:e2e:setup` | Setup completo do ambiente E2E + executa os testes |
| `test:e2e:setup:only` | `npm run test:e2e:setup:only` | Só prepara o ambiente E2E (sem executar os testes) |
| `lint` | `npm run lint` | Executa ESLint (zero warnings permitidos) |
| `lint:fix` | `npm run lint:fix` | Executa ESLint com correção automática |

---

## Guia de Uso

### Para Alunos (acesso público)

| Funcionalidade | Rota | Descrição |
|---------------|------|-----------|
| Listar posts | `/` | Página inicial com posts publicados e paginação |
| Buscar posts | `/` | Campo de busca por palavras-chave no título/conteúdo |
| Ler post | `/posts/:id` | Visualização completa de um post |

### Para Docentes (acesso autenticado)

| Funcionalidade | Rota | Descrição |
|---------------|------|-----------|
| Login | `/login` | Autenticação com email e senha |
| Cadastro | `/register` | Registro de novo usuário (teacher com código de acesso ou student) |
| Painel admin | `/admin` | Lista todos os posts (draft e published) com ações |
| Criar post | `/admin/posts/new` | Formulário de criação de novo post |
| Editar post | `/admin/posts/:id/edit` | Formulário de edição de post existente |
| Excluir post | `/admin` | Botão de exclusão com confirmação |

**Credenciais de acesso (conta de professor na API):**
- Email: `professor@postech.com`
- Senha: `senha123`

---

## Testes

### Estratégia (Pirâmide de Testes)

```
         /   E2E   \          ← Playwright (fluxos completos)
        /------------\
       /  Integração  \       ← Hooks + componentes com mocks
      /----------------\
     /    Unitários     \     ← Entities, VOs, Use Cases, Utils
    /--------------------\
```

### Testes Unitários (Jest + React Testing Library)

- **581 testes** em 49 suites — zero falhas, zero warnings de `act()`
- Cobertura mínima: **80%** em statements, branches, functions e lines
- Padrão BDD com `describe('dado X') > it('deve Y')`
- Estrutura Given-When-Then com comentários explícitos

```bash
# Executar em modo watch
npm test

# Executar com relatório de cobertura
npm run test:coverage
```

#### Qualidade dos Testes

Os testes seguem as melhores práticas do Testing Library:
- Sem acesso direto ao DOM (`no-node-access`) — uso de `getByRole`, `getByTestId` etc.
- Múltiplas asserções em `waitFor` separadas em chamadas individuais (`no-wait-for-multiple-assertions`)
- `render` nunca dentro de `beforeEach` (`no-render-in-setup`)
- Sem wrappers `act()` desnecessários ao redor de utilitários do Testing Library

### Testes de Mutação (Stryker Mutator)

Validam a **eficácia** dos testes — se detectam bugs reais quando o código é alterado.

- **Escopo:** Domain, Application, Infrastructure e Shared (exceto Presentation/Styles)
- **Threshold break:** 80% (pipeline falha abaixo disso)
- **Meta:** ≥ 90% domain, ≥ 90% application, ≥ 80% infrastructure
- **Resultados alcançados:** 99%+ domain, 97%+ application, 90%+ infrastructure

```bash
npm run test:mutation

# Relatório HTML gerado em: reports/mutation/index.html
```

**Configuração:** Ver `stryker.config.mjs`

### Testes E2E (Playwright)

Testes end-to-end que validam os 6 requisitos funcionais da aplicação contra a API real (sem mocks).

#### Pré-requisitos para E2E

1. **API `postech-blog-api` rodando** em `http://localhost:3000` com os endpoints:
   - `POST /auth/login`
   - `GET /posts`, `GET /posts/:id`
   - `POST /posts`, `PUT /posts/:id`, `DELETE /posts/:id`

2. **Conta de teacher válida** no banco de dados:
   - Email: `professor@postech.com`
   - Senha: `senha123`
   > ⚠️ Em CI, substituir por variáveis de ambiente. Nunca usar credenciais de produção.

3. **Node.js ≥ 18** e browsers do Playwright instalados.

#### Setup Automatizado (recomendado)

O script `scripts/setup-e2e.sh` automatiza toda a preparação do ambiente:

```bash
# Verifica Node.js, instala dependências, cria .env,
# instala browsers do Playwright e valida a API — tudo de uma vez:
npm run test:e2e:setup

# Apenas preparar o ambiente sem executar os testes:
npm run test:e2e:setup:only

# Preparar e executar com browser visível:
bash scripts/setup-e2e.sh --headed
```

O script realiza 5 etapas em sequência:

| Etapa | O que faz |
|-------|-----------|
| 1 — Node.js | Verifica versão ≥ 18 |
| 2 — npm install | Instala dependências se `node_modules` não existir |
| 3 — .env | Cria `.env` com `REACT_APP_API_URL` se necessário |
| 4 — Playwright browsers | Instala Chromium + dependências do sistema |
| 5 — API backend | Verifica se a API responde em `http://localhost:3000` |

#### Executar os Testes E2E

```bash
# 1. Subir a API (em outro terminal)
cd ../postech-blog-api && npm start

# 2. Setup completo + executa os testes (headless)
npm run test:e2e:setup

# ── OU, se o ambiente já estiver configurado ──────────────────

# Executar headless (padrão)
npm run test:e2e

# Executar com browser visível
npm run test:e2e:headed

# Abrir Playwright UI mode (debug interativo)
npm run test:e2e:ui

# Executar apenas um arquivo
npx playwright test e2e/tests/auth.spec.js

# Ver relatório HTML após execução
npx playwright show-report
```

> **Modo headed via variável de ambiente:**
> ```bash
> PLAYWRIGHT_HEADED=true npx playwright test
> ```

#### Estrutura dos Testes E2E

```
e2e/
├── fixtures/
│   └── test-data.json          # Dados de teste (credenciais, posts)
├── helpers/
│   └── auth.js                  # loginAsTeacher(), createTestPost()
├── pages/                       # Page Objects (encapsulam data-testid)
│   ├── HomePage.js
│   ├── PostDetailPage.js
│   ├── LoginPage.js
│   ├── AdminPage.js
│   ├── CreatePostPage.js
│   └── EditPostPage.js
└── tests/                       # Specs por funcionalidade
    ├── home.spec.js             # RF1: Lista de posts, busca, paginação
    ├── post-detail.spec.js      # RF2: Leitura de post completo
    ├── auth.spec.js             # RF6: Login, logout, proteção de rotas
    ├── admin.spec.js            # RF5: Painel administrativo
    ├── create-post.spec.js      # RF3: Criação de post
    └── edit-post.spec.js        # RF4: Edição de post
```

#### Cobertura dos Requisitos Funcionais

| RF | Requisito | Spec | Testes |
|----|-----------|------|--------|
| RF1 | Listar posts publicados | `home.spec.js` | 4 |
| RF2 | Ler post completo | `post-detail.spec.js` | 3 |
| RF3 | Criar post | `create-post.spec.js` | 2 |
| RF4 | Editar post | `edit-post.spec.js` | 2 |
| RF5 | Administrar posts | `admin.spec.js` | 5 |
| RF6 | Autenticação | `auth.spec.js` | 4 |
| **Total** | | | **20 testes** |

#### Variáveis de Ambiente para CI

```bash
# .env (não commitar — adicionar ao .gitignore)
REACT_APP_API_URL=http://localhost:3000
```

Em pipelines CI/CD, definir como secrets:
- `E2E_TEACHER_EMAIL`
- `E2E_TEACHER_PASSWORD`

> **Nota:** Os testes rodam em série (`workers: 1`) pois compartilham dados na API. O Playwright sobe o React automaticamente na porta 3001 via `webServer` config — **não é necessário** subir o front-end manualmente.

### Convenção de `data-testid`

Padrão: `{contexto}-{elemento}-{ação/nome}`

Exemplos:
- `search-input`, `search-btn-submit`
- `post-card-{id}`, `post-card-title-{id}`
- `form-input-titulo`, `form-btn-submit`
- `admin-btn-edit-{id}`, `admin-btn-delete-{id}`
- `login-input-email`, `login-btn-submit`
- `pagination-btn-prev`, `pagination-btn-next`

---

## Integração com a API

### Endpoints Consumidos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/posts` | Lista posts (paginado, filtrável por status) |
| GET | `/posts/search?q=termo` | Busca posts por palavra-chave |
| GET | `/posts/:id` | Obtém post por ID |
| POST | `/posts` | Cria novo post |
| PUT | `/posts/:id` | Atualiza post existente |
| DELETE | `/posts/:id` | Remove post |

### Schema: Post

```json
{
  "id": "string",
  "titulo": "string (min 3, max 200)",
  "conteudo": "string (min 10)",
  "autor": "string",
  "status": "draft | published",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

### Schema: Resposta Paginada

```json
{
  "success": true,
  "data": [Post],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Tratamento de Erros

O `httpClient.js` centraliza:
- **Token de autenticação** — injetado automaticamente via interceptor
- **Erro 401** — limpa localStorage e força re-login
- **Timeout** — 15 segundos
- **Mensagens de erro** — extraídas da resposta da API ou genéricas

---

## Decisões Técnicas

| Decisão | Justificativa |
|---------|---------------|
| **DDD no front-end** | Separação de concerns clara; domínio testável sem React |
| **Value Objects imutáveis** | `Object.freeze` + `#private fields` garantem invariantes |
| **Use Cases com DI** | Repositório injetado via construtor — testável com mocks |
| **AuthApiRepository em produção** | Auth real com JWT; `AuthMockRepository` disponível só nos testes unitários |
| **Register com login automático** | `Register` faz register + login encadeados — UX mais fluida; token retornado imediatamente |
| **TeacherRoute separado de PrivateRoute** | `teacher` acessa admin; `student` é redirecionado para `/`; separação explícita de papéis |
| **Logout navega para `/`** | Após logout, usuário vai para home pública — evita redirecionamento desnecessário para `/login` |
| **Styled Components** | CSS-in-JS com temas, escopo, e props transient (`$size`) |
| **Context API (não Redux)** | Estado de auth é simples; Context suficiente |
| **react-router-dom v7** | Requer `moduleNameMapper` no Jest (package exports) |
| **Admin com layout dual (tabela + cards)** | Tabela para desktop, cards `aria-hidden` para mobile — mesmos dados, layout responsivo |
| **Stryker excluindo Presentation** | Styled-components geram mutantes CSS sem valor; E2E cobre UI |
| **Cobertura 80% / Mutação 90%** | Pragmático: cobertura alta sem ser cargo cult |
| **BDD em português** | Testes legíveis como documentação viva |
| **`PLAYWRIGHT_HEADED` env var** | Controla modo headless/headed sem flag CLI; compatível com npm scripts e CI |
| **`scripts/setup-e2e.sh`** | Script idempotente que automatiza todo o setup do ambiente E2E em 5 etapas |

---

## Contribuição (Padrão TDD/BDD)

### Ciclo de Desenvolvimento

1. **Red** — Escrever teste que falha descrevendo o comportamento esperado
2. **Green** — Implementar código mínimo para o teste passar
3. **Refactor** — Melhorar código mantendo testes verdes

### Convenções de Teste

```js
describe('NomeDoMódulo', () => {
  describe('dado [contexto/pré-condição]', () => {
    it('deve [comportamento esperado]', () => {
      // Given — setup
      // When — ação
      // Then — assertivas
    });
  });
});
```

### Checklist para PRs

- [ ] Testes escritos antes da implementação (TDD)
- [ ] `npm test` passa sem erros e sem warnings de `act()`
- [ ] `npm run test:coverage` acima de 80% em todas as métricas
- [ ] `npm run lint` sem warnings (zero tolerância)
- [ ] Componentes interativos possuem `data-testid`
- [ ] Nomes descritivos (functions, variables, files)
- [ ] Sem `console.log` em código de produção
- [ ] Testes E2E passam se a funcionalidade afeta fluxos cobertos (`npm run test:e2e`)

---

## Rotas da Aplicação

| Rota | Componente | Acesso |
|------|-----------|--------|
| `/` | Home | Público |
| `/posts/:id` | PostDetail | Público |
| `/login` | LoginPage | Público |
| `/register` | RegisterPage | Público |
| `/admin` | Admin | Teacher autenticado |
| `/admin/posts/new` | CreatePost | Teacher autenticado |
| `/admin/posts/:id/edit` | EditPost | Teacher autenticado |
| `*` | NotFound | Público |

---

## Licença

Projeto acadêmico — Pós-Tech FIAP.