# Setup & Primeiro run (local)

Este guia curto mostra como rodar o projeto localmente pela primeira vez.

Pré-requisitos

- Node.js >= 18
- npm >= 9
- (opcional) API backend `postech-blog-api` em `http://localhost:3000` para funcionalidades completas

Passos rápidos

```bash
# 1. Clonar
git clone <repo-url>
cd postech-blog-web

# 2. Instalar dependências
npm install

# 3. Criar variáveis de ambiente mínimas
# (cria .env com REACT_APP_API_URL)
echo "REACT_APP_API_URL=http://localhost:3000" > .env

# 4. Iniciar a aplicação (desenvolvimento)
npm start
```

A aplicação por padrão abrirá em `http://localhost:3000` (modo dev). Para execução dos testes E2E a configuração do Playwright usa `http://localhost:3001` como base do servidor front-end — o Playwright sobe o front automaticamente em `3001` durante a execução dos testes.

Scripts úteis

- `npm start` — inicia dev server
- `npm test` — executa unit tests (Jest)
- `npm run lint` — executa ESLint
- `npm run test:e2e:setup` — prepara ambiente e executa testes E2E (ver `docs/E2E.md` para detalhes)

Se tiver problemas com permissões ao executar scripts, torne o script executável:

```bash
chmod +x scripts/setup-e2e.sh
```
