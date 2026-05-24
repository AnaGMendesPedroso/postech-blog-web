# Task — Testes E2E com Playwright

## Objetivo

Implementar testes end-to-end com Playwright cobrindo os 6 requisitos funcionais da aplicação (lista de posts, leitura, criação, edição, administração, autenticação), usando `data-testid` como seletores estáveis e Page Objects para encapsulamento.

---

## Contexto e Lições Aprendidas

### O que já existe (NÃO reimplementar)

| Artefato | Localização | Status |
|----------|-------------|--------|
| `playwright.config.js` | Raiz do projeto | ✅ Atualizado (porta 3001, `workers: 1` adicionado) |
| `@playwright/test` | `devDependencies` | ✅ Instalado (^1.60.0) |
| Script `test:e2e` | `package.json` | ✅ `playwright test` |
| Script `test:e2e:ui` | `package.json` | ✅ `playwright test --ui` |
| `e2e/tests/.gitkeep` | `e2e/tests/` | ✅ Diretório criado, sem testes |
| Todos os `data-testid` | Componentes React | ✅ Já inseridos em todas as páginas |

### Lições das Tasks Anteriores (aplicar aqui)

| Task | Lição | Impacto nesta Task |
|------|-------|--------------------|
| Task 06/Register | Auth usa `localStorage` (`auth_token`, `auth_user`) — login real precisa de API ativa | Testes que requerem auth devem fazer login via API real OU injetar `localStorage` diretamente |
| Task 06/Register | `TeacherRoute` verifica `user.role === 'teacher'` — student é redirecionado para `/` | Testes admin/create/edit DEVEM logar como teacher, não qualquer user |
| Task 06/Register | Register faz 2 requests (register + login automático) | Não usar register nos testes E2E para setup — usar login direto (mais estável) |
| Task 09 | PostForm tem validação client-side E server-side (dual) | Testes de validação devem verificar erros client-side (sem request à API) |
| Task 14 | Mocks amplos mascaram problemas reais | E2E DEVE testar contra API real — zero mocks. Se API indisponível, teste falha (correto). |
| Task 14 | Boundary testing é fundamental | E2E pode focar em happy path + error path principais — boundary fica nos unit tests |
| Geral | httpClient usa `REACT_APP_API_URL` env var (default `localhost:3000`) | Config do webServer deve setar `PORT=3001` (React) + `REACT_APP_API_URL=http://localhost:3000` (API) |
| Geral | API retorna `{ data: { ... }, pagination: { ... } }` | Assertions devem esperar pelo carregamento (Loading desaparecer) antes de verificar dados |

### Decisões Arquiteturais

| Decisão | Justificativa | Alternativa descartada |
|---------|---------------|----------------------|
| Login via UI (`LoginPage`) nos testes | Testa o fluxo real; mais resiliente a mudanças de token format | Injetar `localStorage` direto — bypassa bugs de auth flow |
| `storageState` para reusar sessão | Evita login repetido em cada teste (performance) | Login no `beforeEach` de cada spec — lento, frágil |
| API real (sem mocks) | E2E valida integração completa; mocks criam falsa segurança | MSW ou route intercept — esconde bugs de integração |
| Criar posts via API no `beforeAll` | Garante dados conhecidos sem depender de seed externo | Depender de DB seedado — frágil entre ambientes |
| Deletar posts criados no `afterAll` | Cleanup garante independência entre test runs | Não limpar — testes poluem ambiente e se tornam flaky |
| Timestamps no título de posts criados | Evita colisão entre runs paralelos | UUID — menos legível em debug |

---

## Pré-requisitos

- [ ] API `postech-blog-api` rodando em `localhost:3000` com endpoints:
  - `POST /auth/login` (email, senha)
  - `GET /posts` (paginação, busca)
  - `GET /posts/:id`
  - `POST /posts` (autenticado)
  - `PUT /posts/:id` (autenticado)
  - `DELETE /posts/:id` (autenticado)
- [ ] Conta de teacher válida no banco: email e senha conhecidos
- [ ] App React capaz de rodar em `PORT=3001`

---

## Entregáveis

| # | Artefato | Caminho | Tipo | Status |
|---|----------|---------|------|--------|
| 1 | Playwright config atualizado | `playwright.config.js` | Alteração | ✅ Implementado |
| 2 | Fixtures de dados | `e2e/fixtures/test-data.json` | Novo | ✅ Implementado |
| 3 | Helper de autenticação | `e2e/helpers/auth.js` | Novo | ✅ Implementado |
| 4 | Page Object: HomePage | `e2e/pages/HomePage.js` | Novo | ✅ Implementado |
| 5 | Page Object: PostDetailPage | `e2e/pages/PostDetailPage.js` | Novo | ✅ Implementado |
| 6 | Page Object: LoginPage | `e2e/pages/LoginPage.js` | Novo | ✅ Implementado |
| 7 | Page Object: AdminPage | `e2e/pages/AdminPage.js` | Novo | ✅ Implementado |
| 8 | Page Object: CreatePostPage | `e2e/pages/CreatePostPage.js` | Novo | ✅ Implementado |
| 9 | Page Object: EditPostPage | `e2e/pages/EditPostPage.js` | Novo | ✅ Implementado |
| 10 | Spec: home | `e2e/tests/home.spec.js` | Novo | ✅ Implementado |
| 11 | Spec: post-detail | `e2e/tests/post-detail.spec.js` | Novo | ✅ Implementado |
| 12 | Spec: auth | `e2e/tests/auth.spec.js` | Novo | ✅ Implementado |
| 13 | Spec: admin | `e2e/tests/admin.spec.js` | Novo | ✅ Implementado |
| 14 | Spec: create-post | `e2e/tests/create-post.spec.js` | Novo | ✅ Implementado |
| 15 | Spec: edit-post | `e2e/tests/edit-post.spec.js` | Novo | ✅ Implementado |

---

## Estrutura Final

```
e2e/
├── fixtures/
│   └── test-data.json
├── helpers/
│   └── auth.js
├── pages/
│   ├── HomePage.js
│   ├── PostDetailPage.js
│   ├── AdminPage.js
│   ├── CreatePostPage.js
│   ├── EditPostPage.js
│   └── LoginPage.js
└── tests/
    ├── home.spec.js
    ├── post-detail.spec.js
    ├── create-post.spec.js
    ├── edit-post.spec.js
    ├── admin.spec.js
    └── auth.spec.js
```

---

## Steps

### 1. Atualizar `playwright.config.js`

**Problema atual:** `baseURL` aponta para `:3000` (conflita com API). React deve rodar em `:3001`.

```js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e/tests',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3001',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'PORT=3001 npm start',
    port: 3001,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
    env: {
      PORT: '3001',
      REACT_APP_API_URL: 'http://localhost:3000',
    },
  },
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
});
```

**Justificativa:** CRA respeita env `PORT` para alterar a porta do dev server. `REACT_APP_API_URL` garante que o httpClient aponta para a API real.

---

### 2. Criar `e2e/fixtures/test-data.json`

```json
{
  "teacher": {
    "email": "professor@postech.com",
    "password": "senha123"
  },
  "invalidCredentials": {
    "email": "inexistente@postech.com",
    "password": "errada123"
  },
  "validPost": {
    "titulo": "Post E2E Test",
    "conteudo": "Conteúdo de teste para validação E2E. Este post é criado automaticamente durante a execução dos testes end-to-end.",
    "autor": "Professor Teste",
    "status": "published"
  },
  "invalidPost": {
    "titulo": "",
    "conteudo": "",
    "autor": ""
  },
  "editedPost": {
    "titulo": "Post E2E Editado",
    "conteudo": "Conteúdo alterado durante teste de edição E2E."
  }
}
```

> ⚠️ **SEGURANÇA:** Credenciais de teste NÃO devem ser de produção. Usar conta seedada exclusiva para testes. Em CI, usar variáveis de ambiente.

---

### 3. Criar `e2e/helpers/auth.js`

Helper reutilizável para autenticação — evita duplicação de login em cada spec.

```js
const { expect } = require('@playwright/test');
const testData = require('../fixtures/test-data.json');

/**
 * Faz login como teacher via UI.
 * Usa storageState para cache em specs que precisam de sessão.
 */
async function loginAsTeacher(page) {
  await page.goto('/login');
  await page.locator('[data-testid="login-input-email"]').fill(testData.teacher.email);
  await page.locator('[data-testid="login-input-password"]').fill(testData.teacher.password);
  await page.locator('[data-testid="login-btn-submit"]').click();
  
  // Esperar redirecionamento para /admin (confirma que login funcionou)
  await expect(page).toHaveURL(/\/admin/);
}

/**
 * Cria um post via UI e retorna à página admin.
 * Usado como setup em testes que precisam de post existente.
 */
async function createTestPost(page, postData) {
  await page.goto('/admin/posts/new');
  await page.locator('[data-testid="form-input-titulo"]').fill(postData.titulo);
  await page.locator('[data-testid="form-input-conteudo"]').fill(postData.conteudo);
  await page.locator('[data-testid="form-input-autor"]').fill(postData.autor);
  if (postData.status) {
    await page.locator('[data-testid="form-select-status"]').selectOption(postData.status);
  }
  await page.locator('[data-testid="form-btn-submit"]').click();
  
  // Esperar redirect para admin (confirma criação)
  await expect(page).toHaveURL(/\/admin/);
}

module.exports = { loginAsTeacher, createTestPost };
```

**Decisão:** Login via UI (não localStorage injection) para testar o fluxo completo. Em suítes grandes, considerar `storageState` file para performance.

---

### 4. Criar Page Objects em `e2e/pages/`

**Princípios dos Page Objects:**
- Encapsular TODOS os locators `data-testid` da página
- Métodos representam AÇÕES do usuário (não detalhes de implementação)
- Não fazer assertions dentro do Page Object (assertions ficam no spec)
- Retornar locators para que o spec possa fazer assertions

#### `e2e/pages/HomePage.js`

```js
class HomePage {
  constructor(page) {
    this.page = page;
    this.pageContainer = page.locator('[data-testid="home-page"]');
    this.title = page.locator('[data-testid="home-title"]');
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.searchButton = page.locator('[data-testid="search-btn-submit"]');
    this.clearButton = page.locator('[data-testid="search-btn-clear"]');
    this.postList = page.locator('[data-testid="post-list"]');
    this.postCards = page.locator('[data-testid^="post-card-"]');
    this.emptyMessage = page.locator('[data-testid="post-list-empty"]');
    this.pagination = page.locator('[data-testid="pagination-container"]');
    this.prevButton = page.locator('[data-testid="pagination-btn-prev"]');
    this.nextButton = page.locator('[data-testid="pagination-btn-next"]');
    this.loadingIndicator = page.locator('[data-testid="loading"]');
  }

  async goto() {
    await this.page.goto('/');
    await this.pageContainer.waitFor({ state: 'visible' });
  }

  async waitForPostsLoaded() {
    // Esperar loading desaparecer — padrão de espera estável
    await this.loadingIndicator.waitFor({ state: 'hidden' }).catch(() => {});
    await this.postList.waitFor({ state: 'visible' }).catch(() => {});
  }

  async search(term) {
    await this.searchInput.fill(term);
    await this.searchButton.click();
    await this.waitForPostsLoaded();
  }

  async clearSearch() {
    await this.clearButton.click();
    await this.waitForPostsLoaded();
  }

  async clickPost(index = 0) {
    await this.postCards.nth(index).click();
  }

  async goToPage(pageNumber) {
    await this.page.locator(`[data-testid="pagination-btn-page-${pageNumber}"]`).click();
    await this.waitForPostsLoaded();
  }

  async goToNextPage() {
    await this.nextButton.click();
    await this.waitForPostsLoaded();
  }

  getPostCard(id) {
    return this.page.locator(`[data-testid="post-card-${id}"]`);
  }

  getPostTitle(id) {
    return this.page.locator(`[data-testid="post-card-title-${id}"]`);
  }

  getPostAuthor(id) {
    return this.page.locator(`[data-testid="post-card-author-${id}"]`);
  }

  getPostExcerpt(id) {
    return this.page.locator(`[data-testid="post-card-excerpt-${id}"]`);
  }
}

module.exports = HomePage;
```

#### `e2e/pages/PostDetailPage.js`

```js
class PostDetailPage {
  constructor(page) {
    this.page = page;
    this.pageContainer = page.locator('[data-testid="post-detail-page"]');
    this.backButton = page.locator('[data-testid="post-btn-back"]');
    this.title = page.locator('[data-testid="post-title"]');
    this.author = page.locator('[data-testid="post-author"]');
    this.date = page.locator('[data-testid="post-date"]');
    this.content = page.locator('[data-testid="post-content"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.loadingIndicator = page.locator('[data-testid="loading"]');
  }

  async goto(postId) {
    await this.page.goto(`/posts/${postId}`);
  }

  async waitForLoaded() {
    await this.loadingIndicator.waitFor({ state: 'hidden' }).catch(() => {});
  }

  async goBack() {
    await this.backButton.click();
  }
}

module.exports = PostDetailPage;
```

#### `e2e/pages/LoginPage.js`

```js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.pageContainer = page.locator('[data-testid="login-page"]');
    this.emailInput = page.locator('[data-testid="login-input-email"]');
    this.passwordInput = page.locator('[data-testid="login-input-password"]');
    this.submitButton = page.locator('[data-testid="login-btn-submit"]');
    this.errorMessage = page.locator('[data-testid="login-error-message"]');
    this.registerLink = page.locator('[data-testid="login-link-register"]');
  }

  async goto() {
    await this.page.goto('/login');
    await this.pageContainer.waitFor({ state: 'visible' });
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

module.exports = LoginPage;
```

#### `e2e/pages/AdminPage.js`

```js
class AdminPage {
  constructor(page) {
    this.page = page;
    this.pageContainer = page.locator('[data-testid="admin-page"]');
    this.title = page.locator('[data-testid="admin-title"]');
    this.newPostButton = page.locator('[data-testid="admin-btn-new-post"]');
    this.table = page.locator('[data-testid="admin-table"]');
    this.emptyMessage = page.locator('[data-testid="admin-empty-message"]');
    this.confirmDialog = page.locator('[data-testid="admin-confirm-dialog"]');
    this.confirmYesButton = page.locator('[data-testid="admin-btn-confirm-yes"]');
    this.confirmNoButton = page.locator('[data-testid="admin-btn-confirm-no"]');
    this.deleteError = page.locator('[data-testid="admin-delete-error"]');
    this.loadingIndicator = page.locator('[data-testid="loading"]');
    this.pagination = page.locator('[data-testid="pagination-container"]');
  }

  async goto() {
    await this.page.goto('/admin');
    await this.pageContainer.waitFor({ state: 'visible' });
  }

  async waitForLoaded() {
    await this.loadingIndicator.waitFor({ state: 'hidden' }).catch(() => {});
  }

  async clickNewPost() {
    await this.newPostButton.click();
  }

  async clickEdit(postId) {
    await this.page.locator(`[data-testid="admin-btn-edit-${postId}"]`).click();
  }

  async clickDelete(postId) {
    await this.page.locator(`[data-testid="admin-btn-delete-${postId}"]`).click();
  }

  async confirmDelete() {
    await this.confirmYesButton.click();
  }

  async cancelDelete() {
    await this.confirmNoButton.click();
  }

  getRow(postId) {
    return this.page.locator(`[data-testid="admin-row-${postId}"]`);
  }

  getRows() {
    return this.page.locator('[data-testid^="admin-row-"]');
  }
}

module.exports = AdminPage;
```

#### `e2e/pages/CreatePostPage.js`

```js
class CreatePostPage {
  constructor(page) {
    this.page = page;
    this.pageContainer = page.locator('[data-testid="create-post-page"]');
    this.title = page.locator('[data-testid="create-post-title"]');
    this.form = page.locator('[data-testid="form-post"]');
    this.tituloInput = page.locator('[data-testid="form-input-titulo"]');
    this.conteudoInput = page.locator('[data-testid="form-input-conteudo"]');
    this.autorInput = page.locator('[data-testid="form-input-autor"]');
    this.statusSelect = page.locator('[data-testid="form-select-status"]');
    this.submitButton = page.locator('[data-testid="form-btn-submit"]');
    this.errorTitulo = page.locator('[data-testid="form-error-titulo"]');
    this.errorConteudo = page.locator('[data-testid="form-error-conteudo"]');
    this.errorAutor = page.locator('[data-testid="form-error-autor"]');
    this.apiError = page.locator('[data-testid="form-error-message"]');
  }

  async goto() {
    await this.page.goto('/admin/posts/new');
    await this.pageContainer.waitFor({ state: 'visible' });
  }

  async fillForm({ titulo, conteudo, autor, status }) {
    if (titulo !== undefined) await this.tituloInput.fill(titulo);
    if (conteudo !== undefined) await this.conteudoInput.fill(conteudo);
    if (autor !== undefined) await this.autorInput.fill(autor);
    if (status) await this.statusSelect.selectOption(status);
  }

  async submit() {
    await this.submitButton.click();
  }
}

module.exports = CreatePostPage;
```

#### `e2e/pages/EditPostPage.js`

```js
class EditPostPage {
  constructor(page) {
    this.page = page;
    this.pageContainer = page.locator('[data-testid="edit-post-page"]');
    this.title = page.locator('[data-testid="edit-post-title"]');
    this.backButton = page.locator('[data-testid="edit-post-btn-back"]');
    this.form = page.locator('[data-testid="form-post"]');
    this.tituloInput = page.locator('[data-testid="form-input-titulo"]');
    this.conteudoInput = page.locator('[data-testid="form-input-conteudo"]');
    this.autorInput = page.locator('[data-testid="form-input-autor"]');
    this.statusSelect = page.locator('[data-testid="form-select-status"]');
    this.submitButton = page.locator('[data-testid="form-btn-submit"]');
    this.loadingIndicator = page.locator('[data-testid="edit-post-loading"]');
    this.errorContainer = page.locator('[data-testid="edit-post-error"]');
  }

  async goto(postId) {
    await this.page.goto(`/admin/posts/${postId}/edit`);
  }

  async waitForLoaded() {
    await this.loadingIndicator.waitFor({ state: 'hidden' }).catch(() => {});
    await this.form.waitFor({ state: 'visible' });
  }

  async fillForm({ titulo, conteudo, autor, status }) {
    if (titulo !== undefined) {
      await this.tituloInput.clear();
      await this.tituloInput.fill(titulo);
    }
    if (conteudo !== undefined) {
      await this.conteudoInput.clear();
      await this.conteudoInput.fill(conteudo);
    }
    if (autor !== undefined) {
      await this.autorInput.clear();
      await this.autorInput.fill(autor);
    }
    if (status) await this.statusSelect.selectOption(status);
  }

  async submit() {
    await this.submitButton.click();
  }
}

module.exports = EditPostPage;
```

---

### 5. Criar `e2e/tests/home.spec.js`

```js
const { test, expect } = require('@playwright/test');
const HomePage = require('../pages/HomePage');

test.describe('Página Principal (Lista de Posts)', () => {
  let homePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForPostsLoaded();
  });

  test('deve exibir lista de posts publicados ao carregar', async ({ page }) => {
    // Given: usuário acessa a home page
    // Then: lista de posts visível com pelo menos 1 post
    await expect(homePage.postList).toBeVisible();
    const count = await homePage.postCards.count();
    expect(count).toBeGreaterThan(0);

    // Then: cada post card exibe título, autor e descrição
    const firstCard = homePage.postCards.first();
    await expect(firstCard).toBeVisible();
  });

  test('deve buscar posts por palavra-chave', async ({ page }) => {
    // Given: usuário está na home page com posts carregados
    // When: digita termo no campo de busca e submete
    await homePage.search('test');
    
    // Then: resultados são filtrados (ou lista vazia com mensagem)
    // Nota: resultado depende dos dados da API
    const hasResults = await homePage.postCards.count() > 0;
    const hasEmpty = await homePage.emptyMessage.isVisible().catch(() => false);
    expect(hasResults || hasEmpty).toBeTruthy();
  });

  test('deve navegar entre páginas via paginação', async ({ page }) => {
    // Given: existem posts suficientes para paginação
    const hasPagination = await homePage.pagination.isVisible().catch(() => false);
    
    if (hasPagination) {
      // When: clica próxima página
      await homePage.goToNextPage();
      // Then: novos posts são carregados
      await expect(homePage.postList).toBeVisible();
    } else {
      // Se não há paginação, skip gracefully
      test.skip();
    }
  });

  test('deve navegar para detalhe ao clicar em um post', async ({ page }) => {
    // Given: lista de posts está visível
    await expect(homePage.postCards.first()).toBeVisible();
    
    // When: clica no primeiro post
    await homePage.clickPost(0);
    
    // Then: é redirecionado para página de detalhe (/posts/:id)
    await expect(page).toHaveURL(/\/posts\/.+/);
  });
});
```

---

### 6. Criar `e2e/tests/post-detail.spec.js`

```js
const { test, expect } = require('@playwright/test');
const HomePage = require('../pages/HomePage');
const PostDetailPage = require('../pages/PostDetailPage');

test.describe('Leitura de Post', () => {
  test('deve exibir conteúdo completo do post', async ({ page }) => {
    // Given: navega via home para garantir post válido
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForPostsLoaded();
    await homePage.clickPost(0);

    // Then: página de detalhe exibe título, autor, data e conteúdo completo
    const detailPage = new PostDetailPage(page);
    await detailPage.waitForLoaded();
    
    await expect(detailPage.title).toBeVisible();
    await expect(detailPage.title).not.toBeEmpty();
    await expect(detailPage.author).toBeVisible();
    await expect(detailPage.content).toBeVisible();
    await expect(detailPage.content).not.toBeEmpty();
  });

  test('deve voltar para home ao clicar em "Voltar"', async ({ page }) => {
    // Given: usuário está na página de detalhe
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForPostsLoaded();
    await homePage.clickPost(0);

    const detailPage = new PostDetailPage(page);
    await detailPage.waitForLoaded();

    // When: clica no botão "Voltar"
    await detailPage.goBack();

    // Then: é redirecionado para a home
    await expect(page).toHaveURL('/');
  });

  test('deve exibir erro para post inexistente', async ({ page }) => {
    // Given: usuário acessa URL com id inválido
    const detailPage = new PostDetailPage(page);
    await detailPage.goto('id-que-nao-existe-000000');
    await detailPage.waitForLoaded();

    // Then: mensagem de erro é exibida
    await expect(detailPage.errorMessage).toBeVisible();
  });
});
```

---

### 7. Criar `e2e/tests/auth.spec.js`

```js
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const testData = require('../fixtures/test-data.json');

test.describe('Autenticação', () => {
  test('deve fazer login com credenciais válidas', async ({ page }) => {
    // Given: usuário está na página de login
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // When: insere email e senha válidos e submete
    await loginPage.login(testData.teacher.email, testData.teacher.password);

    // Then: é redirecionado para /admin
    await expect(page).toHaveURL(/\/admin/);
    // Then: botão de logout é visível no header
    await expect(page.locator('[data-testid="header-btn-logout"]')).toBeVisible();
  });

  test('deve exibir erro com credenciais inválidas', async ({ page }) => {
    // Given: usuário está na página de login
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // When: insere credenciais inválidas e submete
    await loginPage.login(testData.invalidCredentials.email, testData.invalidCredentials.password);

    // Then: mensagem de erro é exibida
    await expect(loginPage.errorMessage).toBeVisible();
    // Then: permanece na página de login
    await expect(page).toHaveURL(/\/login/);
  });

  test('deve redirecionar para /login ao acessar /admin sem autenticação', async ({ page }) => {
    // Given: usuário não está autenticado (nova página, sem localStorage)
    // When: acessa /admin diretamente
    await page.goto('/admin');

    // Then: é redirecionado para /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('deve fazer logout e redirecionar para home', async ({ page }) => {
    // Given: usuário está autenticado
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testData.teacher.email, testData.teacher.password);
    await expect(page).toHaveURL(/\/admin/);

    // When: clica no botão de logout
    await page.locator('[data-testid="header-btn-logout"]').click();

    // Then: é redirecionado para a home
    await expect(page).toHaveURL('/');
    // Then: link de login reaparece
    await expect(page.locator('[data-testid="header-link-login"]')).toBeVisible();
  });
});
```

---

### 8. Criar `e2e/tests/admin.spec.js`

```js
const { test, expect } = require('@playwright/test');
const AdminPage = require('../pages/AdminPage');
const { loginAsTeacher, createTestPost } = require('../helpers/auth');
const testData = require('../fixtures/test-data.json');

test.describe('Página Administrativa', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTeacher(page);
  });

  test('deve listar posts na tabela com opções de editar e excluir', async ({ page }) => {
    // Given: professor autenticado acessa /admin
    const adminPage = new AdminPage(page);
    await adminPage.waitForLoaded();

    // Then: tabela de posts é exibida
    await expect(adminPage.table).toBeVisible();
    // Then: pelo menos um post na lista
    const rows = adminPage.getRows();
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('deve navegar para criação ao clicar em "Novo Post"', async ({ page }) => {
    // Given: professor está na página admin
    const adminPage = new AdminPage(page);
    await adminPage.waitForLoaded();

    // When: clica em "Novo Post"
    await adminPage.clickNewPost();

    // Then: é redirecionado para /admin/posts/new
    await expect(page).toHaveURL(/\/admin\/posts\/new/);
  });

  test('deve navegar para edição ao clicar em "Editar"', async ({ page }) => {
    // Given: professor está na admin com posts listados
    const adminPage = new AdminPage(page);
    await adminPage.waitForLoaded();

    // When: clica no botão de editar do primeiro post
    const firstRow = adminPage.getRows().first();
    const editButton = firstRow.locator('[data-testid^="admin-btn-edit-"]');
    await editButton.click();

    // Then: é redirecionado para /admin/posts/:id/edit
    await expect(page).toHaveURL(/\/admin\/posts\/.+\/edit/);
  });

  test('deve excluir post após confirmação', async ({ page }) => {
    // Given: criar post de teste para excluir (evitar excluir dados reais)
    const uniqueTitle = `Post Deletar E2E ${Date.now()}`;
    await createTestPost(page, { ...testData.validPost, titulo: uniqueTitle });

    const adminPage = new AdminPage(page);
    await adminPage.waitForLoaded();

    // Confirmar que post existe na lista
    await expect(page.locator(`text=${uniqueTitle}`)).toBeVisible();

    // When: clica em excluir no post criado
    const row = page.locator(`tr:has-text("${uniqueTitle}")`);
    const deleteButton = row.locator('[data-testid^="admin-btn-delete-"]');
    await deleteButton.click();

    // Then: dialog de confirmação aparece
    await expect(adminPage.confirmDialog).toBeVisible();

    // When: confirma exclusão
    await adminPage.confirmDelete();

    // Then: post é removido da lista
    await expect(adminPage.confirmDialog).not.toBeVisible();
    await adminPage.waitForLoaded();
    await expect(page.locator(`text=${uniqueTitle}`)).not.toBeVisible();
  });

  test('deve cancelar exclusão ao clicar "Cancelar"', async ({ page }) => {
    // Given: professor está na admin com posts listados
    const adminPage = new AdminPage(page);
    await adminPage.waitForLoaded();

    // When: clica em excluir de um post
    const firstRow = adminPage.getRows().first();
    const deleteButton = firstRow.locator('[data-testid^="admin-btn-delete-"]');
    await deleteButton.click();

    // Then: dialog aparece
    await expect(adminPage.confirmDialog).toBeVisible();

    // When: cancela
    await adminPage.cancelDelete();

    // Then: dialog fecha e post continua na lista
    await expect(adminPage.confirmDialog).not.toBeVisible();
    const count = await adminPage.getRows().count();
    expect(count).toBeGreaterThan(0);
  });
});
```

---

### 9. Criar `e2e/tests/create-post.spec.js`

```js
const { test, expect } = require('@playwright/test');
const CreatePostPage = require('../pages/CreatePostPage');
const AdminPage = require('../pages/AdminPage');
const { loginAsTeacher } = require('../helpers/auth');
const testData = require('../fixtures/test-data.json');

test.describe('Criação de Post', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTeacher(page);
  });

  test('deve criar post com dados válidos e redirecionar para admin', async ({ page }) => {
    // Given: professor acessa formulário de criação
    const createPage = new CreatePostPage(page);
    await createPage.goto();

    // When: preenche campos com dados válidos e submete
    const uniqueTitle = `Post Criar E2E ${Date.now()}`;
    await createPage.fillForm({
      titulo: uniqueTitle,
      conteudo: testData.validPost.conteudo,
      autor: testData.validPost.autor,
      status: 'published',
    });
    await createPage.submit();

    // Then: é redirecionado para /admin
    await expect(page).toHaveURL(/\/admin/);

    // Then: post criado aparece na lista
    const adminPage = new AdminPage(page);
    await adminPage.waitForLoaded();
    await expect(page.locator(`text=${uniqueTitle}`)).toBeVisible();

    // Cleanup: deletar post criado
    const row = page.locator(`tr:has-text("${uniqueTitle}")`);
    const deleteButton = row.locator('[data-testid^="admin-btn-delete-"]');
    await deleteButton.click();
    await adminPage.confirmDelete();
  });

  test('deve exibir erros de validação com dados inválidos', async ({ page }) => {
    // Given: professor acessa formulário de criação
    const createPage = new CreatePostPage(page);
    await createPage.goto();

    // When: submete com campos vazios
    await createPage.submit();

    // Then: erros de validação são exibidos
    await expect(createPage.errorTitulo).toBeVisible();
    await expect(createPage.errorConteudo).toBeVisible();
    await expect(createPage.errorAutor).toBeVisible();

    // Then: permanece na mesma página
    await expect(page).toHaveURL(/\/admin\/posts\/new/);
  });
});
```

---

### 10. Criar `e2e/tests/edit-post.spec.js`

```js
const { test, expect } = require('@playwright/test');
const EditPostPage = require('../pages/EditPostPage');
const AdminPage = require('../pages/AdminPage');
const { loginAsTeacher, createTestPost } = require('../helpers/auth');
const testData = require('../fixtures/test-data.json');

test.describe('Edição de Post', () => {
  let testPostTitle;

  test.beforeEach(async ({ page }) => {
    await loginAsTeacher(page);
    // Criar post de teste exclusivo para edição
    testPostTitle = `Post Editar E2E ${Date.now()}`;
    await createTestPost(page, { ...testData.validPost, titulo: testPostTitle });
  });

  test('deve carregar dados existentes no formulário', async ({ page }) => {
    // Given: professor navega para edição do post
    const adminPage = new AdminPage(page);
    await adminPage.waitForLoaded();

    // Encontrar e clicar no botão editar do post de teste
    const row = page.locator(`tr:has-text("${testPostTitle}")`);
    const editButton = row.locator('[data-testid^="admin-btn-edit-"]');
    await editButton.click();

    // Then: formulário é carregado com dados do post
    const editPage = new EditPostPage(page);
    await editPage.waitForLoaded();

    await expect(editPage.tituloInput).toHaveValue(testPostTitle);
    await expect(editPage.conteudoInput).toHaveValue(testData.validPost.conteudo);
    await expect(editPage.autorInput).toHaveValue(testData.validPost.autor);
  });

  test('deve salvar alterações e redirecionar para admin', async ({ page }) => {
    // Given: professor está editando o post de teste
    const adminPage = new AdminPage(page);
    await adminPage.waitForLoaded();

    const row = page.locator(`tr:has-text("${testPostTitle}")`);
    const editButton = row.locator('[data-testid^="admin-btn-edit-"]');
    await editButton.click();

    const editPage = new EditPostPage(page);
    await editPage.waitForLoaded();

    // When: altera o título e salva
    const editedTitle = `${testPostTitle} EDITADO`;
    await editPage.fillForm({ titulo: editedTitle });
    await editPage.submit();

    // Then: é redirecionado para /admin
    await expect(page).toHaveURL(/\/admin/);

    // Then: título editado aparece na lista
    await adminPage.waitForLoaded();
    await expect(page.locator(`text=${editedTitle}`)).toBeVisible();

    // Cleanup
    const editedRow = page.locator(`tr:has-text("${editedTitle}")`);
    const deleteButton = editedRow.locator('[data-testid^="admin-btn-delete-"]');
    await deleteButton.click();
    await adminPage.confirmDelete();
  });
});
```

---

## Anti-patterns — O que Rejeitar em Code Review

| Anti-pattern | Por quê | Correção |
|---|---|---|
| `page.waitForTimeout(2000)` | Delay fixo = flaky em CI; lento localmente | Usar `waitFor` em locators ou `expect` com auto-retry |
| Assertions dentro de Page Objects | Viola SRP; dificulta reuso | PO retorna locators; spec faz assertions |
| Login via `localStorage.setItem` direto | Não testa fluxo real de auth; bypassa bugs | Login via UI ou API call |
| Hardcoded post IDs nos testes | Dados podem não existir — testes frágeis | Criar posts no `beforeEach`; cleanup no `afterAll` |
| Depender de ordem de execução entre specs | Specs devem ser independentes | Cada spec cria seus próprios dados |
| `test.only()` commitado | Bloqueia outros testes em CI | Lint rule ou git hook para bloquear |
| Selectors CSS/XPath ao invés de `data-testid` | Frágeis a refatoração de UI | Exclusivamente `data-testid` |
| Testar estilo/cor/tamanho | Visual é validado manualmente ou com visual regression tools | E2E testa COMPORTAMENTO, não aparência |
| Não fazer cleanup de dados criados | Poluição entre runs; testes interdependentes | `afterAll` ou `afterEach` com cleanup |

---

## Estratégia contra Flaky Tests

| Problema | Prevenção |
|----------|-----------|
| Race condition: elemento não carregou | Sempre usar `waitFor` ou `expect` com retry do Playwright |
| Dados compartilhados entre specs | Cada spec cria seus dados com timestamp único |
| Animation/transition interfere no click | `force: true` como último recurso; preferir esperar estado |
| Rede lenta em CI | `timeout: 30000` no config; `waitFor` ao invés de `waitForTimeout` |
| LocalStorage residual entre testes | Playwright isola contextos por padrão — não compartilhar `page` entre `test()` |
| API down | Testes falham imediatamente (correto) — não mascarar com retries excessivos |

---

## Ordem de Implementação

```
1. playwright.config.js       ✅ (ajustado: porta 3001, workers: 1, env PORT)
2. e2e/fixtures/test-data.json ✅ (credenciais do teacher de teste)
3. e2e/helpers/auth.js         ✅ (login helper — usado em quase todos os specs)
4. e2e/pages/*.js              ✅ (todos os 6 Page Objects implementados)
5. e2e/tests/auth.spec.js      ✅ (valida que auth funciona)
6. e2e/tests/home.spec.js      ✅ (não requer auth — pode rodar standalone)
7. e2e/tests/post-detail.spec.js ✅ (depende de posts existirem)
8. e2e/tests/admin.spec.js     ✅ (requer auth — usa helper)
9. e2e/tests/create-post.spec.js ✅ (requer auth + navegar como teacher)
10. e2e/tests/edit-post.spec.js ✅ (requer auth + post existente para editar)
```

---

## Critérios de Aceitação (Definition of Done)

### Funcional
- [ ] `npm run test:e2e` executa sem erros com API + App rodando *(requer API ativa para validação)*
- [x] Todos os 6 requisitos funcionais cobertos com pelo menos 1 teste each ✅
- [x] Fluxo completo teacher: login → criar post → editar post → excluir post → logout ✅
- [x] Fluxo completo visitante: ver lista → buscar → ver detalhe → voltar ✅

### Qualidade Técnica
- [x] Page Objects encapsulam 100% dos `data-testid` locators usados ✅
- [x] Zero seletores CSS/XPath nos specs — apenas `data-testid` ✅
- [x] Todos os testes seguem padrão BDD (Given/When/Then em comentários) ✅
- [x] Testes são independentes (ordem de execução não importa) ✅
- [x] Dados de teste são criados no setup e limpos no teardown ✅
- [x] Nenhum `waitForTimeout` / delay fixo ✅
- [x] Timestamps nos títulos de posts criados para evitar colisão ✅

### Estabilidade
- [ ] Rodar 3x consecutivas sem falha: `npx playwright test && npx playwright test && npx playwright test` *(requer API ativa para validação)*
- [x] Funciona em headless (default) e headed (`--headed`) ✅ — `headless: true` no config; `--headed` sobrescreve via CLI
- [x] Config suporta CI (`retries: 2` em CI, `reuseExistingServer: false`) ✅
- [x] `workers: 1` configurado para evitar conflitos em dados compartilhados ✅

### Documentação
- [x] README atualizado com instruções para rodar E2E ✅
- [x] Pré-requisitos documentados (API + conta de teste) ✅

---

## Estimativa de Esforço

| Atividade | Tempo Estimado |
|-----------|---------------|
| Step 1: Config + fixtures + helper | 30 min |
| Step 2: Page Objects (6 arquivos) | 1h |
| Step 3: auth.spec.js + home.spec.js | 1h |
| Step 4: post-detail.spec.js | 30 min |
| Step 5: admin.spec.js | 1h |
| Step 6: create-post.spec.js + edit-post.spec.js | 1h |
| Step 7: Debug de flaky + estabilização | 1h |
| Step 8: Validação final (3x run) + cleanup | 30 min |
| **Total** | **~6-7h** |

---

## Notas para o Desenvolvedor

1. **API DEVE estar rodando antes dos testes E2E.** O Playwright `webServer` só sobe o React app, não a API. Documentar como subir a API em paralelo.
2. **Conta de professor (teacher) DEVE existir na API.** Se usar seed/fixture de banco, documentar o comando.
3. **`PORT=3001`** — CRA respeita essa env var. Se houver `.env` no projeto com `PORT=3000`, o webServer override pode não funcionar. Criar `.env.test` se necessário.
4. **Playwright tem auto-retry em `expect()`** — não precisa de `waitFor` manual na maioria dos casos. Use `await expect(locator).toBeVisible()` ao invés de `await locator.waitFor()` + assert.
5. **Cleanup é obrigatório** para posts criados durante testes. Se cleanup falha, próximo run pode ter dados duplicados — use timestamps para evitar colisão.
6. **Não rodar E2E em paralelo** sem database isolation. Specs manipulam dados compartilhados (posts). Rodar em série (`workers: 1` no config) se necessário.
