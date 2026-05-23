# Task 14 — Testes de Mutação e Validação de Qualidade

## Objetivo

Executar e ajustar testes de mutação com Stryker para garantir que os testes unitários são eficazes (meta ≥ 90%, break: 80%), e validar a cobertura geral do projeto.

## Entregáveis

- [ ] `stryker.config.mjs` ajustado e validado
- [ ] Score de mutação ≥ 90% na camada de domínio
- [ ] Score de mutação ≥ 80% nas demais camadas
- [ ] Cobertura de testes unitários ≥ 80% em todas as métricas
- [ ] Relatórios de cobertura e mutação gerados
- [ ] Testes fortalecidos onde mutantes sobreviveram

## Comandos

```bash
# Cobertura
npm run test:coverage

# Mutação
npm run test:mutation
```

## Processo

### 1. Rodar cobertura inicial

```bash
npm run test:coverage
```

Verificar se todas as métricas estão ≥ 80%:
- Statements
- Branches
- Functions
- Lines

### 2. Rodar Stryker

```bash
npm run test:mutation
```

### 3. Analisar mutantes sobreviventes

Para cada mutante que sobreviveu:
1. Identificar o arquivo e a mutação aplicada
2. Entender por que nenhum teste detectou a mudança
3. Adicionar/fortalecer teste que mata o mutante

### 4. Padrões comuns de mutantes sobreviventes

| Mutação | Problema | Solução |
|---------|----------|---------|
| `===` → `!==` | Teste não verifica caso negativo | Adicionar describe "dado X inválido" |
| String removida | Teste não verifica texto exato | Usar `toHaveTextContent()` |
| Função removida | Teste não verifica side effect | Verificar mock `.toHaveBeenCalled()` |
| Condicional removida | Teste não testa branch | Adicionar caso de borda |

### 5. Configuração do Stryker

```js
// stryker.config.mjs
export default {
  mutate: [
    'src/domains/**/*.js',
    'src/shared/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/**/index.js'
  ],
  testRunner: 'jest',
  jest: { projectType: 'create-react-app' },
  reporters: ['html', 'clear-text', 'progress'],
  thresholds: { high: 90, low: 80, break: 80 },
  concurrency: 4,
  timeoutMS: 60000
};
```

## Métricas Alvo

| Camada | Cobertura | Score Mutação |
|--------|-----------|---------------|
| Domain (entities, VOs) | ≥ 95% | ≥ 90% |
| Application (use cases) | ≥ 90% | ≥ 90% |
| Infrastructure | ≥ 80% | ≥ 80% |
| Presentation (components) | ≥ 80% | ≥ 80% |
| Shared (utils, components) | ≥ 85% | ≥ 85% |

## Critérios de Aceitação

- `npm run test:coverage` reporta ≥ 80% em todas as métricas
- `npm run test:mutation` reporta score ≥ 90% (não quebra em 80%)
- Relatório HTML do Stryker gerado em `reports/mutation/`
- Nenhum mutante sobrevive em validações críticas (Value Objects)
- Documentação de decisões sobre mutantes ignorados (se houver)
