# Task 15 — Documentação (README.md)

## Objetivo

Reescrever o README.md com documentação técnica completa do projeto, incluindo setup, arquitetura DDD, guia de uso e estratégia de testes.

## Entregáveis

- [ ] README.md completo e bem formatado
- [ ] Diagrama de arquitetura (texto/mermaid)
- [ ] Instruções de setup
- [ ] Guia de uso (fluxo do aluno e do docente)
- [ ] Documentação dos scripts
- [ ] Decisões técnicas documentadas

## Estrutura do README

```markdown
# Postech Blog Web

## Descrição
## Problema
## Solução

## Tecnologias
## Arquitetura (DDD)
### Estrutura de Pastas
### Mapeamento de Camadas

## Pré-requisitos
## Setup e Instalação
## Variáveis de Ambiente
## Scripts Disponíveis

## Guia de Uso
### Para Alunos (público)
### Para Docentes (autenticado)

## Testes
### Unitários (Jest + RTL)
### Mutação (Stryker)
### E2E (Playwright)

## Integração com a API
### Endpoints consumidos
### Schema dos dados

## Decisões Técnicas
## Contribuição (padrão TDD/BDD)
```

## Conteúdo Esperado

### Seção: Arquitetura

Explicar com clareza:
- Por que DDD no front-end
- O que cada camada faz
- Como os domínios se comunicam (ou não)
- Fluxo: Page → Hook → Use Case → Repository → API

### Seção: Testes

Explicar:
- Abordagem TDD/BDD
- Padrão Given-When-Then
- Como rodar cada tipo de teste
- Metas de cobertura e mutação
- Convenção de `data-testid`

### Seção: Setup

```bash
# Clonar o repositório
git clone <repo-url>
cd postech-blog-web

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar aplicação (requer API rodando em localhost:3000)
npm start

# Rodar testes
npm test
npm run test:coverage
npm run test:mutation
npm run test:e2e
```

## Critérios de Aceitação

- README claro e completo para qualquer desenvolvedor iniciar
- Arquitetura DDD explicada de forma acessível
- Todos os scripts documentados
- Fluxo de contribuição com TDD/BDD descrito
- Integração com API documentada com endpoints e schemas
