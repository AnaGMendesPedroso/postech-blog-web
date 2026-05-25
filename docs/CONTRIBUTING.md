# Contribuição — Padrão TDD/BDD

Regras e checklist para contribuir com o projeto.

## Ciclo de desenvolvimento

1. Red — escrever teste que falha
2. Green — implementar mínima alteração para passar no teste
3. Refactor — limpar e melhorar mantendo testes verdes

## Checklist para PRs

- [ ] Testes escritos antes da implementação (TDD)
- [ ] `npm test` passa sem erros e sem warnings de `act()`
- [ ] `npm run test:coverage` acima de 80% em todas as métricas
- [ ] `npm run lint` sem warnings (zero tolerância)
- [ ] Componentes interativos possuem `data-testid`
- [ ] Nomes descritivos (functions, variables, files)
- [ ] Sem `console.log` em código de produção

## Estilo de testes

- Use Testing Library: evitar acesso direto ao DOM.
- Separe múltiplas asserções em `waitFor`.
- Não renderizar em `beforeEach`.
- Evitar `act()` desnecessário; preferir helpers do RTL.

## Decisões técnicas relevantes

Veja `docs/ARCHITECTURE.md` e `docs/API.md` para convenções e integrações.
