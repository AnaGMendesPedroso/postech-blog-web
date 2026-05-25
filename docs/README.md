# Documentação (docs)

Índice e navegação rápida para os documentos do projeto.

- [Setup & Primeiro Run](./SETUP.md)
  - Guia rápido para rodar o projeto localmente pela primeira vez.

- [Arquitetura (DDD)](./ARCHITECTURE.md)
  - Visão geral da organização por camadas, pastas e fluxo de dados.

- [Testes — Unitários / Integração / Mutação](./TESTING.md)
  - Estratégia de testes, comandos e boas práticas adotadas.

- [E2E (Playwright)](./E2E.md)
  - Como preparar o ambiente, usar o script `scripts/setup-e2e.sh`, e executar testes E2E (headed / headless).

- [Integração com a API](./API.md)
  - Endpoints, schemas e contratos esperados pelo front-end.

- [Contribuição (TDD/BDD)](./CONTRIBUTING.md)
  - Checklist para PRs, estilo de testes e fluxo de contribuição.

Como usar

1. Abra o `README.md` principal para o quickstart e links rápidos:

```bash
less README.md
```

2. Para ler a documentação completa, abra o índice desta pasta:

```bash
less docs/README.md
# ou abrir um arquivo específico, por exemplo:
less docs/SETUP.md
```

Contribuindo para a documentação

- Para adicionar ou atualizar um documento, edite o arquivo em `docs/` e abra um PR com a mudança.
- Mantenha os arquivos curtos e focados; crie novos arquivos para tópicos grandes (ex.: `docs/DEPLOYMENT.md`) e atualize este índice.

Observações

- A documentação foi quebrada para melhorar a leitura; mantenha o `README.md` principal enxuto (quickstart + links) para facilitar onboarding.
- Se preferir, posso gerar um `docs/TOC.md` com uma versão em HTML simples para visualização local.
