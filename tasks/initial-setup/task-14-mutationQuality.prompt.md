# Task 14 — Testes de Mutação e Validação de Qualidade

## Contexto

Esta task é a penúltima etapa do ciclo de desenvolvimento. Todas as camadas (domain, application, infrastructure, presentation) já possuem implementação e testes unitários. A cobertura de código (Istanbul/Jest) já está configurada com threshold de 80%.

**Porém, cobertura ≠ qualidade.** Um teste pode cobrir 100% das linhas e ainda assim ser incapaz de detectar bugs reais. Testes de mutação validam se os testes são **eficazes** — se eles realmente quebram quando o código está errado.

## Objetivo

Executar testes de mutação com Stryker Mutator, analisar mutantes sobreviventes, e fortalecer os testes onde necessário. A meta é garantir que os testes unitários não são apenas "passam no happy path", mas detectam regressões reais.

---

## Lições Aprendidas das Tasks Anteriores

| Task | Lição | Impacto nesta Task |
|------|-------|--------------------|
| Task 2 (Domain) | Value Objects com `Object.freeze` e `#private fields` podem gerar mutantes em getters que são difíceis de matar sem assertivas explícitas no retorno | Priorizar VOs na análise de mutantes |
| Task 4 (Application) | Use cases com branches de validação (ex: `if (!id)`) — cobertura de branches era 93%, não 100% | Mutantes em condicionais de guarda provavelmente sobrevivem |
| Task 5 (Shared) | `Loading.js` tinha branch coverage 66% — o branch de `$size` default não era testado | Componentes com props opcionais tendem a ter mutantes sobreviventes |
| Task 5 (Shared) | `formatDate.js` tinha lines 83% — caminho de erro não 100% coberto | Funções utilitárias com error handling são alvo fácil de mutações |
| Task 6 (Auth) | `User` entity aceita campos extras sem erro — boundary não é strict | Mutantes em validações permissivas podem indicar falso-positivo |
| Task 7 (Home) | `jest.mock` de módulos inteiros (PostApiRepository) — mocks amplos podem mascarar mutantes | Testes com mocks amplos podem não matar mutantes na camada mockada |

---

## Pré-requisitos

- [ ] Todos os testes unitários passando (`npm test -- --watchAll=false`)
- [ ] Nenhum teste flaky identificado
- [ ] `stryker.config.mjs` com escopo correto (ver seção de configuração)
- [ ] Node.js com memória suficiente (Stryker é intensivo em CPU/memória)

---

## Entregáveis

| # | Entregável | Critério de Aceite |
|---|------------|--------------------|
| 1 | `stryker.config.mjs` revisado | Escopo cobre domain + application + shared (não presentation) |
| 2 | Score de mutação ≥ 90% em `domain/` | Value Objects e Entities com zero mutantes sobreviventes em validações |
| 3 | Score de mutação ≥ 90% em `application/` | Use cases com mutantes mortos em todos os branches de guarda |
| 4 | Score de mutação ≥ 80% em `shared/` e `infrastructure/` | Threshold mínimo respeitado |
| 5 | Relatório HTML gerado | `reports/mutation/html/index.html` acessível e revisado |
| 6 | Cobertura ≥ 80% global | `npm run test:coverage` passa sem quebrar threshold |
| 7 | Documentação de mutantes ignorados | Justificativa para cada `// Stryker disable` se houver |

---

## Configuração do Stryker

### Configuração Recomendada

```js
// stryker.config.mjs
export default {
  mutate: [
    'src/domains/**/domain/**/*.js',
    'src/domains/**/application/**/*.js',
    'src/domains/**/infrastructure/**/*.js',
    'src/shared/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/**/index.js',
    '!src/shared/test-utils.js',
    '!src/shared/styles/**'  // Styled-components não agregam valor em mutação
  ],
  testRunner: 'jest',
  jest: {
    projectType: 'create-react-app',
    enableFinding: true
  },
  reporters: ['html', 'clear-text', 'progress', 'json'],
  htmlReporter: { baseDir: 'reports/mutation' },
  jsonReporter: { fileName: 'reports/mutation/mutation-report.json' },
  thresholds: { high: 90, low: 80, break: 80 },
  concurrency: 2,           // macOS — evitar memory pressure com React 19
  timeoutMS: 30000,         // 30s — suficiente para testes unitários rápidos
  timeoutFactor: 2.5,       // Fator de segurança para CI
  cleanTempDir: 'always',
  ignoreStatic: true        // Ignora mutações em código estático (imports, exports)
};
```

### Justificativa das Escolhas

| Opção | Por quê |
|-------|---------|
| **Excluir `presentation/`** | Componentes React com styled-components geram centenas de mutantes em strings CSS que não agregam valor. Testar mutação em presentation é custo alto / retorno baixo. A qualidade da presentation é validada pelos testes E2E (Task 13). |
| **Excluir `styles/`** | Mesmo motivo — mutações em tokens visuais (cores, px) não indicam defeitos lógicos |
| **Excluir `test-utils.js`** | Helper de teste, não código de produção |
| **`concurrency: 2`** | Stryker com Jest + create-react-app em macOS consome muita memória. 2 workers evita OOM. Ajustar para 4 em CI com mais RAM. |
| **`ignoreStatic: true`** | Evita mutantes triviais (ex: trocar nome de import) que não testam lógica |
| **`jsonReporter`** | Permite automação futura (CI pipelines, dashboards) |

---

## Processo de Execução

### Fase 1: Validação de Pré-condições

```bash
# 1. Garantir que todos os testes passam
npm test -- --watchAll=false

# 2. Verificar cobertura atual (deve ser ≥ 80% para prosseguir)
npm run test:coverage

# 3. Verificar se Stryker está instalado e configurado
npx stryker --version
```

**Gate:** Se cobertura < 80%, NÃO prosseguir. Voltar para as tasks anteriores e subir cobertura primeiro. Mutação sobre código não coberto é desperdício de tempo.

### Fase 2: Execução Incremental (Dividir para Conquistar)

**Não rodar Stryker no escopo inteiro de primeira.** Rodar por camada para isolar problemas:

```bash
# 2a. Domain layer (deve ser a mais alta — meta 95%+)
npx stryker run --mutate 'src/domains/**/domain/**/*.js'

# 2b. Application layer (use cases — meta 90%+)
npx stryker run --mutate 'src/domains/**/application/**/*.js'

# 2c. Shared utilities (meta 85%+)
npx stryker run --mutate 'src/shared/utils/**/*.js'

# 2d. Infrastructure (meta 80%+)
npx stryker run --mutate 'src/domains/**/infrastructure/**/*.js,src/shared/infrastructure/**/*.js'
```

**Motivo da abordagem incremental:** O Stryker é computacionalmente caro. Rodar tudo junto pode levar 10-30 minutos. Rodar por camada permite feedback rápido e iterações focadas.

### Fase 3: Análise de Mutantes Sobreviventes

Para cada mutante sobrevivente, aplicar este checklist:

```
□ O mutante é em código que DEVERIA ser testado?
  → Se sim: fortalecer o teste
  → Se não: avaliar se é código morto ou defensivo

□ O mutante é equivalente (mudança que não altera comportamento observável)?
  → Se sim: documentar e ignorar (Stryker disable)
  → Se não: há um gap real no teste

□ O teste que deveria matar existe mas não cobre o cenário?
  → Analisar se o mock está amplo demais
  → Analisar se a assertiva é genérica demais (ex: toHaveBeenCalled vs toHaveBeenCalledWith)

□ O mutante está numa boundary condition?
  → Adicionar teste de fronteira (ex: exatamente 3 chars, exatamente 200 chars)
```

### Fase 4: Fortalecimento de Testes

**Prioridade de correção (ordenar por impacto):**

1. **Mutantes em validações de Value Objects** — São a primeira linha de defesa do domínio. Zero tolerância.
2. **Mutantes em condicionais de Use Cases** — Guards que protegem contra chamadas indevidas ao repositório.
3. **Mutantes em mapeamento de dados (DTOs)** — Garantem que dados vão no formato correto para a API.
4. **Mutantes em utilities** — `formatDate`, `truncateText` — funções puras fáceis de testar.
5. **Mutantes em infrastructure** — Error handling do httpClient, mapeamento de respostas.

### Fase 5: Validação Final

```bash
# Rodar escopo completo e verificar que passa no threshold
npm run test:mutation

# Confirmar que testes novos não quebraram cobertura
npm run test:coverage

# Verificar que não há testes flaky (rodar 3x)
npm test -- --watchAll=false
npm test -- --watchAll=false
npm test -- --watchAll=false
```

---

## Padrões Comuns de Mutantes Sobreviventes (neste projeto)

### Domain Layer — Value Objects

| Arquivo | Mutação Provável | Teste que Falta |
|---------|-----------------|-----------------|
| `PostTitle.js` | `value.length < 3` → `value.length <= 3` | Teste com exatamente 3 caracteres (boundary) |
| `PostTitle.js` | `value.length > 200` → `value.length >= 200` | Teste com exatamente 200 caracteres |
| `PostContent.js` | `value.length < 10` → `value.length <= 10` | Teste com exatamente 10 caracteres |
| `PostStatus.js` | `['draft', 'published'].includes(value)` → string mutation | Teste que verifica `getValue()` retorna exatamente a string passada |

**Padrão de teste para matar boundary mutants:**

```js
describe('dado um título com exatamente 3 caracteres', () => {
  it('deve criar o value object com sucesso (boundary)', () => {
    const title = new PostTitle('abc');
    expect(title.getValue()).toBe('abc');
  });
});

describe('dado um título com exatamente 2 caracteres', () => {
  it('deve lançar erro de validação (boundary - 1)', () => {
    expect(() => new PostTitle('ab')).toThrow();
  });
});
```

### Application Layer — Use Cases

| Arquivo | Mutação Provável | Teste que Falta |
|---------|-----------------|-----------------|
| `GetPost.js` | Remoção de `if (!id)` guard | Teste que verifica que repositório NÃO é chamado quando id é inválido |
| `DeletePost.js` | Remoção de `if (!id)` guard | Idem |
| `CreatePost.js` | Remoção de validação DTO | Teste que verifica erro específico quando DTO é inválido |
| `UpdatePost.js` | `===` → `!==` em condicional | Teste com dados válidos E inválidos verificando ambos os caminhos |

**Padrão de teste para matar guard mutants:**

```js
describe('dado um id inválido (vazio)', () => {
  it('deve lançar erro SEM chamar o repositório', async () => {
    await expect(useCase.execute('')).rejects.toThrow();
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });
});
```

### Shared — Utilities

| Arquivo | Mutação Provável | Teste que Falta |
|---------|-----------------|-----------------|
| `formatDate.js` | Retorno de string vazia → `''` removido | Teste que verifica retorno exato para input inválido |
| `truncateText.js` | `text.length > maxLength` → `>=` | Teste com texto de tamanho exato ao `maxLength` |

---

## Mutantes que Podem ser Ignorados (com justificativa)

Em casos raros, mutantes equivalentes ou em código defensivo podem ser ignorados:

```js
// Stryker disable next-line StringLiteral: mensagem de erro é cosmética, não funcional
throw new Error('Título deve ter no mínimo 3 caracteres');
```

**Regras para ignorar mutantes:**

1. ✅ Ignorar: Mutação em string literal de mensagem de erro (se teste verifica apenas `toThrow()` sem mensagem)
2. ✅ Ignorar: Mutação em `console.error` / logging defensivo
3. ❌ NÃO ignorar: Mutação em lógica condicional
4. ❌ NÃO ignorar: Mutação em retorno de função
5. ❌ NÃO ignorar: Mutação em chamada a dependência

**Decisão arquitetural:** Se muitos mutantes sobrevivem em mensagens de erro, considerar se os testes deveriam verificar a mensagem exata (`toThrow('mensagem')` vs `toThrow()`). Para Value Objects, SIM — a mensagem faz parte do contrato. Para use cases internos, pode ser flexível.

---

## Métricas Alvo

| Camada | Escopo Stryker | Meta Score | Justificativa |
|--------|---------------|------------|---------------|
| Domain (entities, VOs) | `src/domains/**/domain/**` | ≥ 95% | Core do negócio — zero tolerância a bugs não detectados |
| Application (use cases, DTOs) | `src/domains/**/application/**` | ≥ 90% | Orquestração — guards e validações devem ser sólidos |
| Infrastructure (repos, http) | `src/**/infrastructure/**` | ≥ 80% | Integração — mocks limitam eficácia da mutação |
| Shared (utils) | `src/shared/utils/**` | ≥ 90% | Funções puras — fáceis de testar e alta reutilização |
| Shared (components, contexts) | `src/shared/components/**` | N/A* | *Excluído do escopo de mutação — coberto por E2E |

---

## O que NÃO Fazer

| Anti-padrão | Por quê |
|-------------|---------|
| Rodar Stryker em `presentation/` com styled-components | Gera 300+ mutantes em CSS que não agregam nenhum valor |
| Adicionar `// Stryker disable` em massa | Mascara problemas reais — cada disable precisa de PR review |
| Criar testes que verificam APENAS se "não lança erro" | Esses testes são fracos demais para matar mutantes de retorno |
| Aumentar `timeoutMS` para 120s+ | Se o teste demora tanto, o problema é o teste, não o timeout |
| Focar em score 100% | Retorno decrescente acima de 95% — aceitar equivalente mutants documentados |
| Ignorar mutantes em `if (!id)` guards | Esses guards protegem contra chamadas à API com payload inválido |

---

## Comandos

```bash
# Cobertura completa
npm run test:coverage

# Mutação completa (usar após análise incremental)
npm run test:mutation

# Mutação incremental por camada
npx stryker run --mutate 'src/domains/**/domain/**/*.js'
npx stryker run --mutate 'src/domains/**/application/**/*.js'

# Abrir relatório HTML
open reports/mutation/index.html
```

---

## Critérios de Aceitação (Definition of Done)

- [ ] `npm run test:coverage` reporta ≥ 80% em **todas** as métricas (stmts, branch, funcs, lines)
- [ ] `npm run test:mutation` executa sem erro e **não quebra** no threshold de 80%
- [ ] Score de mutação da camada domain ≥ 95%
- [ ] Score de mutação da camada application ≥ 90%
- [ ] Score de mutação geral ≥ 80% (threshold break)
- [ ] Relatório HTML do Stryker gerado em `reports/mutation/`
- [ ] Nenhum mutante sobrevive em validações de Value Objects (PostTitle, PostContent, PostStatus)
- [ ] Nenhum mutante sobrevive em guards de Use Cases (`if (!id)`, validações de DTO)
- [ ] Cada `// Stryker disable` documentado com justificativa no código
- [ ] Testes novos seguem padrão BDD existente (describe dado/quando + it deve)
- [ ] Nenhum teste existente foi removido ou enfraquecido
- [ ] CI-ready: comando `npm run test:mutation` pode ser adicionado ao pipeline

---

## Estimativa de Esforço

| Atividade | Tempo Estimado |
|-----------|---------------|
| Configurar e rodar Stryker incremental | 30 min |
| Análise de mutantes sobreviventes | 1-2h |
| Fortalecimento de testes (domain) | 1h |
| Fortalecimento de testes (application) | 1h |
| Fortalecimento de testes (shared/infra) | 30 min |
| Validação final + relatório | 30 min |
| **Total** | **4-5h** |

---

## Notas para o Revisor

1. **Score de mutação > cobertura de código** — Um score de 90% com cobertura de 85% é MELHOR que cobertura de 100% com score de 70%.
2. **Boundary testing é o principal diferencial** — A maioria dos mutantes sobreviventes neste projeto será em `<` vs `<=`, `>` vs `>=`.
3. **Mocks amplos são inimigos da mutação** — Se um teste usa `jest.mock('../../module')` inteiro, ele provavelmente não mata mutantes naquele módulo. Preferir mocks cirúrgicos.
4. **Não otimizar para o Stryker** — Otimizar para detectar bugs reais. Se um teste mata o mutante mas não faz sentido como teste de comportamento, repensar.

