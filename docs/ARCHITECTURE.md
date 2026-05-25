# Arquitetura — Domain Driven Design (DDD)

Este documento descreve a arquitetura adotada no front-end (DDD) e a organização do código.

## Por que DDD no front-end?

- Separação clara de responsabilidades entre UI, lógica de negócio e acesso a dados.
- Testabilidade: cada camada é testável isoladamente.
- Manutenibilidade: mudanças na API não afetam regras de negócio.

## Estrutura de pastas (resumo)

```
src/
├── domains/
│   ├── posts/
│   │   ├── domain/                 # Entidades, Value Objects, repositórios (contratos)
│   │   ├── application/            # Use cases (casos de uso)
│   │   ├── infrastructure/         # Implementações de repositório (API)
│   │   └── presentation/           # Páginas, componentes e hooks
│   └── auth/                       # Domínio de autenticação
├── shared/                         # Componentes e infra compartilhada
└── App.js
```

## Mapeamento de Camadas

- Domain: regras puras e invariantes (sem dependências externas).
- Application: orquestração de casos de uso (injeção de repositórios).
- Infrastructure: implementação de I/O (ex.: `PostApiRepository`, `AuthApiRepository`).
- Presentation: React (páginas, componentes, hooks) que consomem os use cases.

## Fluxo de dados

Page → Hook → Use Case → Repository (Interface) → PostApiRepository → API HTTP

## Observações

- Value Objects garantem validações (ex.: `PostTitle`, `PostContent`).
- Repositórios são injetados nos use cases para facilitar testes com mocks.


```
// Exemplo (pseudocódigo):
const listPosts = new ListPosts(postRepository);
const { data } = await listPosts.execute({ page: 1 });
```
