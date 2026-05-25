# Testes — Unitários, Integração e Mutação

Resumo das estratégias de teste e onde encontrar os artefatos.

## Unitários (Jest + RTL)

- Local: `src/` tests alongside implementation (ex.: `*.test.js`).
- Executar: `npm test` ou `npm run test:coverage`.
- Cobertura mínima: 80% (statements/lines/functions/branches).
- Regras importantes adotadas para qualidade:
  - Evitar acesso direto ao DOM (use Testing Library queries).
  - Não agrupar múltiplas asserções dentro de um único `waitFor`.
  - Não chamar `render` em `beforeEach` (render dentro de cada teste).
  - Evitar `act()` desnecessário: use Testing Library helpers que já o fazem.

## Testes de Mutação (Stryker)

- Executar: `npm run test:mutation`.
- Configuração: `stryker.config.mjs`.
- Objetivo: garantir a eficácia dos testes (altos scores de detecção de mutantes).

## Testes E2E (Playwright)

- Local: `e2e/tests`.
- Executar: `npm run test:e2e` (headless) ou `npm run test:e2e:headed` (headed).
- Fixtures: `e2e/fixtures/test-data.json`.
- Helpers e page objects: `e2e/helpers`, `e2e/pages`.

## Relação entre camadas e testes

- Domain: testado via unit tests (VOs, entidades).
- Application: use cases com mocks (unit/integration).
- Infrastructure: capa de integração com API (mock/integração).
- Presentation: testes unitários e integração com RTL; E2E cobre fluxos críticos.

