# Task 01 — Setup do Projeto e Dependências

## Objetivo

Configurar o projeto React com todas as dependências, scripts, configurações de teste, CI/CD com GitHub Actions e estrutura de pastas base seguindo a arquitetura DDD.

## Repositório

- **URL:** https://github.com/AnaGMendesPedroso/postech-blog-web.git
- **Conta:** AnaGMendesPedroso (anagmendesp@gmail.com)
- **Branch principal:** `main`

## Entregáveis

- [ ] Dependências de produção instaladas (`react-router-dom`, `axios`, `styled-components`, `react-icons`)
- [ ] Dependências de desenvolvimento instaladas (`@stryker-mutator/core`, `@stryker-mutator/jest-runner`, `@stryker-mutator/html-reporter`, `@playwright/test`)
- [ ] Mover `@testing-library/*` de `dependencies` para `devDependencies`
- [ ] Scripts adicionados ao `package.json` (`lint`, `test:coverage`, `test:mutation`, `test:e2e`, `test:e2e:ui`)
- [ ] Configuração de `jest.coverageThreshold` no `package.json` (mínimo 80%)
- [ ] Arquivo `stryker.config.mjs` criado e configurado (com `htmlReporter.baseDir`)
- [ ] Arquivo `playwright.config.js` criado e configurado (com `webServer` para subir a app)
- [ ] Arquivo `.env` com `REACT_APP_API_URL=http://localhost:3000`
- [ ] Arquivo `.env.example` versionado como referência
- [ ] Estrutura de pastas DDD criada (pastas com arquivos reais serão versionadas; demais serão criadas nas tasks seguintes)
- [ ] `GlobalStyles.js` e `theme.js` base criados (com conteúdo mínimo funcional)
- [ ] `httpClient.js` configurado com instância Axios
- [ ] `.gitignore` atualizado (incluir `.idea/`, reports, node_modules, etc.)
- [ ] GitHub Actions: workflow de CI criado (`.github/workflows/ci.yml`)
- [ ] GitHub Actions: workflow de mutation testing criado (`.github/workflows/mutation.yml`)
- [ ] GitHub Actions: workflow de E2E criado (`.github/workflows/e2e.yml`)

> **Push:** Será realizado após a Task 06, quando a estrutura DDD tiver pelo menos 1 arquivo em cada diretório e o CI puder rodar com sucesso (cobertura real, mutantes reais).

## Detalhes Técnicos

### Corrigir devDependencies

As bibliotecas de teste devem estar em `devDependencies`, não em `dependencies`:

```bash
npm install --save-dev @testing-library/dom @testing-library/jest-dom @testing-library/react @testing-library/user-event
```

> **Nota:** Remover essas dependências de `dependencies` antes de adicioná-las a `devDependencies`.

### Dependências de Produção e Desenvolvimento

```bash
npm install react-router-dom axios styled-components react-icons
npm install -D @stryker-mutator/core @stryker-mutator/jest-runner @stryker-mutator/html-reporter @playwright/test
```

### Scripts (`package.json`)

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "lint": "eslint src/ --max-warnings=0",
    "test:coverage": "react-scripts test --coverage --watchAll=false",
    "test:mutation": "stryker run",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "eject": "react-scripts eject"
  }
}
```

### Jest Coverage Threshold (`package.json`)

Adicionar ao `package.json` para garantir que o CI quebre se a cobertura cair abaixo de 80%:

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### Stryker (`stryker.config.mjs`)

```js
export default {
  mutate: ['src/domains/**/*.js', '!src/**/*.test.js', '!src/**/*.spec.js'],
  testRunner: 'jest',
  jest: { projectType: 'create-react-app' },
  reporters: ['html', 'clear-text', 'progress'],
  htmlReporter: { baseDir: 'reports/mutation' },
  thresholds: { high: 90, low: 80, break: 80 }
};
```

### Playwright (`playwright.config.js`)

```js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e/tests',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm start',
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
    env: {
      REACT_APP_API_URL: 'http://localhost:3000',
    },
  },
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
});
```

> **Nota:** O `webServer` garante que o Playwright suba a aplicação automaticamente antes de rodar os testes, tanto no CI quanto localmente.

### Estrutura de Pastas

Criar **apenas as pastas que já terão arquivos nesta task**. As demais pastas do DDD serão criadas organicamente nas tasks seguintes (02 a 12) quando os arquivos reais forem implementados.

**Pastas criadas nesta task (com arquivos reais):**

```
src/
├── shared/
│   ├── infrastructure/http/
│   │   └── httpClient.js
│   └── styles/
│       ├── GlobalStyles.js
│       └── theme.js
├── App.js
└── index.js
e2e/
└── tests/
```

**Estrutura completa (referência — será construída ao longo das tasks):**

```
src/
├── domains/
│   ├── posts/
│   │   ├── domain/entities/
│   │   ├── domain/value-objects/
│   │   ├── domain/repositories/
│   │   ├── application/usecases/
│   │   ├── application/dto/
│   │   ├── infrastructure/repositories/
│   │   ├── presentation/pages/
│   │   ├── presentation/components/
│   │   └── presentation/hooks/
│   └── auth/
│       ├── domain/entities/
│       ├── application/usecases/
│       ├── infrastructure/repositories/
│       ├── presentation/pages/
│       ├── presentation/components/
│       └── presentation/hooks/
├── shared/
│   ├── components/
│   ├── contexts/
│   ├── infrastructure/http/
│   ├── styles/
│   └── utils/
├── App.js
└── index.js
```

> **Nota:** Não usar `.gitkeep`. O Git não versiona pastas vazias, e isso é ok — as pastas surgirão naturalmente quando os arquivos forem criados nas tasks posteriores.

### httpClient.js (`src/shared/infrastructure/http/httpClient.js`)

```js
import axios from 'axios';

const httpClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' }
});

export default httpClient;
```

### GlobalStyles.js (`src/shared/styles/GlobalStyles.js`)

```js
import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    text-decoration: none;
    color: ${({ theme }) => theme.colors.primary};
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
  }

  ul, ol {
    list-style: none;
  }
`;

export default GlobalStyles;
```

### theme.js (`src/shared/styles/theme.js`)

```js
const theme = {
  colors: {
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    secondary: '#64748B',
    success: '#16A34A',
    error: '#DC2626',
    warning: '#D97706',
    text: '#1E293B',
    textLight: '#64748B',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E2E8F0',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1280px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
    xxl: '2rem',
  },
};

export default theme;
```

## Critérios de Aceitação

- [ ] Rodar `npm start` sem erros
- [ ] Rodar `npm test` sem erros (testes existentes passando)
- [ ] Rodar `npm run lint` sem erros
- [ ] Estrutura de pastas DDD criada corretamente (verificar com `find src/shared`)
- [ ] Variável de ambiente `REACT_APP_API_URL` configurada
- [ ] `@testing-library/*` em `devDependencies` (não em `dependencies`)
- [ ] Workflows do GitHub Actions criados (validação real ocorrerá após push na Task 06)
- [ ] Stryker configurado (validação com `--dryRun` sem erros de config)
- [ ] Playwright configurado com `webServer` (validação com `--list` sem erros de config)

## GitHub e CI/CD

### Remote e Push

> **O push será realizado na Task 06**, após completar as camadas de domínio, aplicação, infraestrutura, shared e auth. Nesse ponto o projeto terá:
> - Estrutura DDD completa com arquivos reais em todos os diretórios
> - Testes unitários suficientes para validar cobertura (≥80%)
> - Código mutável para o Stryker validar
> - CI capaz de rodar sem falsos negativos
>
> Até lá, manter commits locais organizados por task.

### Commits Locais (sem push)

```bash
# Configurar git (se necessário)
git config user.name "AnaGMendesPedroso"
git config user.email "anagmendesp@gmail.com"

# Atualizar .gitignore e remover arquivos trackeados indevidamente
git rm --cached -r .idea/ 2>/dev/null || true
git rm --cached postech-blog-web.iml 2>/dev/null || true

# Commit da Task 01
git add .
git commit -m "chore: setup do projeto com dependências, configs de teste e CI/CD"
```

### .gitignore (atualizar)

Adicionar ao `.gitignore` existente:
```
# IDE
.idea/
*.iml

# Dependencies
node_modules/

# Reports
/reports
/stryker-tmp

# Playwright
/e2e/results/
/playwright-report/
/test-results/

# Coverage
/coverage

# Environment
.env
.env.local
.env.*.local

# Build
/build
```

### .env.example (versionado)

```env
REACT_APP_API_URL=http://localhost:3000
```

### GitHub Actions — CI (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run lint
        run: npm run lint

      - name: Run unit tests with coverage
        run: npm run test:coverage
        env:
          CI: true

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

      - name: Build
        run: npm run build
        env:
          CI: true
          REACT_APP_API_URL: http://localhost:3000
```

### GitHub Actions — Mutation Testing (`.github/workflows/mutation.yml`)

```yaml
name: Mutation Testing

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  mutation:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Stryker mutation tests
        run: npm run test:mutation
        env:
          CI: true

      - name: Upload mutation report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: mutation-report
          path: reports/mutation/
```

### GitHub Actions — E2E (`.github/workflows/e2e.yml`)

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
          REACT_APP_API_URL: http://localhost:3000

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

> **Nota:** O workflow E2E não precisa de step separado para `npm start` porque o `playwright.config.js` já define `webServer` que sobe a aplicação automaticamente.

## Verificação Pós-Setup

Após completar a task, executar os seguintes comandos para validar:

```bash
# Verificar que a app inicia sem erros
npm start &
sleep 5 && kill %1

# Verificar lint
npm run lint

# Verificar testes
npm test -- --watchAll=false

# Verificar estrutura criada nesta task
find src/shared -type f | sort

# Verificar que Stryker está configurado
npx stryker run --dryRun

# Verificar que Playwright está configurado
npx playwright test --list
```