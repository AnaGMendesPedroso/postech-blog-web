# Testes E2E (Playwright)

Detalhes sobre a configuração e execução dos testes end-to-end.

## Visão geral

- Testes localizados em `e2e/tests`.
- Fixtures em `e2e/fixtures/test-data.json`.
- Helpers em `e2e/helpers` (ex.: `auth.js`).
- O `playwright.config.js` já configura `webServer` para subir o front em `PORT=3001` automaticamente.

## Scripts npm relevantes

- `npm run test:e2e` — executa Playwright (headless por padrão).
- `npm run test:e2e:headed` — executa com browser visível.
- `npm run test:e2e:ui` — abre Playwright UI.
- `npm run test:e2e:setup` — script idempotente que instala browsers, cria `.env` e executa testes.

## Script de setup

Há um script `scripts/setup-e2e.sh` que realiza:
1. Verificação de Node.js >= 18
2. `npm install` (quando necessário)
3. Criação de `.env` com `REACT_APP_API_URL`
4. Instalação dos navegadores do Playwright (`playwright install --with-deps`)
5. Verificação que a API backend responde (opcional se usar `--only-setup`)

### Executar (exemplo)

```bash
# Preparar e executar testes headless
npm run test:e2e:setup

# Preparar e executar com browser visível
npm run test:e2e:setup && npm run test:e2e:headed
# ou diretamente
bash scripts/setup-e2e.sh --headed
```

## Modo headed

A configuração aceita a variável `PLAYWRIGHT_HEADED=true` para forçar o modo headed no `playwright.config.js`.

```bash
PLAYWRIGHT_HEADED=true npx playwright test
```

## Dicas

- Em CI, defina `REACT_APP_API_URL` e as credenciais (ex.: `E2E_TEACHER_EMAIL`) como secrets.
- Os testes rodam com `workers: 1` para evitar race conditions na API compartilhada.

Para mais contexto sobre os testes e a política de qualidade, consulte `docs/TESTING.md`.
