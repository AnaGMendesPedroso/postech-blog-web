# Task 13 — Testes E2E com Playwright

## Objetivo

Implementar testes end-to-end com Playwright cobrindo os fluxos principais da aplicação, usando `data-testid` como seletores estáveis.

## Entregáveis

- [ ] `playwright.config.js` configurado
- [ ] Page Objects para cada página
- [ ] Testes E2E para todos os fluxos principais
- [ ] Fixtures de dados de teste
- [ ] Script `test:e2e` funcionando

## Localização

```
e2e/
├── playwright.config.js
├── fixtures/
│   └── posts.json
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

## Especificações

### playwright.config.js

```js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  baseURL: 'http://localhost:3001',  // React app
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm start',
    port: 3001,
    reuseExistingServer: true
  }
});
```

### Page Objects (Padrão)

```js
class HomePage {
  constructor(page) {
    this.page = page;
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.searchButton = page.locator('[data-testid="search-btn-submit"]');
    this.postCards = page.locator('[data-testid^="post-card-"]');
    this.pagination = page.locator('[data-testid="pagination-container"]');
  }

  async goto() { await this.page.goto('/'); }
  async search(term) {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }
  async clickPost(id) {
    await this.page.locator(`[data-testid="post-card-${id}"]`).click();
  }
}
```

## Cenários E2E (BDD)

### home.spec.js

```js
test.describe('Página Principal', () => {
  test('deve exibir lista de posts publicados ao carregar', async ({ page }) => { });
  test('deve buscar posts por palavra-chave', async ({ page }) => { });
  test('deve navegar entre páginas via paginação', async ({ page }) => { });
  test('deve navegar para detalhe ao clicar em um post', async ({ page }) => { });
});
```

### post-detail.spec.js

```js
test.describe('Leitura de Post', () => {
  test('deve exibir conteúdo completo do post', async ({ page }) => { });
  test('deve voltar para home ao clicar em "Voltar"', async ({ page }) => { });
  test('deve exibir 404 para post inexistente', async ({ page }) => { });
});
```

### auth.spec.js

```js
test.describe('Autenticação', () => {
  test('deve fazer login com credenciais válidas', async ({ page }) => { });
  test('deve exibir erro com credenciais inválidas', async ({ page }) => { });
  test('deve redirecionar para /login ao acessar /admin sem autenticação', async ({ page }) => { });
  test('deve fazer logout e redirecionar para home', async ({ page }) => { });
});
```

### admin.spec.js

```js
test.describe('Página Administrativa', () => {
  test('deve listar todos os posts (draft e published)', async ({ page }) => { });
  test('deve navegar para criação ao clicar em "Novo Post"', async ({ page }) => { });
  test('deve navegar para edição ao clicar em "Editar"', async ({ page }) => { });
  test('deve excluir post após confirmação', async ({ page }) => { });
  test('deve cancelar exclusão ao clicar "Não"', async ({ page }) => { });
});
```

### create-post.spec.js

```js
test.describe('Criação de Post', () => {
  test('deve criar post com dados válidos e redirecionar para admin', async ({ page }) => { });
  test('deve exibir erros de validação com dados inválidos', async ({ page }) => { });
});
```

### edit-post.spec.js

```js
test.describe('Edição de Post', () => {
  test('deve carregar dados existentes no formulário', async ({ page }) => { });
  test('deve salvar alterações e redirecionar para admin', async ({ page }) => { });
});
```

## Pré-requisitos

- API `postech-blog-api` rodando em `localhost:3000`
- App React rodando em `localhost:3001`
- Dados de teste no banco (ou API seedada)

## Critérios de Aceitação

- Todos os fluxos principais cobertos por testes E2E
- Page Objects utilizados para encapsular seletores
- Seletores baseados exclusivamente em `data-testid`
- Padrão BDD (Given-When-Then) nos testes
- Testes rodam com `npm run test:e2e`
- Testes estáveis (sem flaky tests)
