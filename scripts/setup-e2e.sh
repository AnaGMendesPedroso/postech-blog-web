#!/usr/bin/env bash
# =============================================================================
# setup-e2e.sh — Prepara e executa os testes E2E (Playwright) do postech-blog-web
#
# Pré-requisitos:
#   - Node.js >= 18
#   - API postech-blog-api rodando em http://localhost:3000
#
# Uso:
#   ./scripts/setup-e2e.sh              # setup + executa os testes
#   ./scripts/setup-e2e.sh --only-setup # só prepara o ambiente, não executa
#   ./scripts/setup-e2e.sh --headed     # executa com browser visível
# =============================================================================

set -euo pipefail

# ── Cores ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ── Helpers ──────────────────────────────────────────────────────────────────
info()    { echo -e "${BLUE}ℹ${NC}  $*"; }
success() { echo -e "${GREEN}✔${NC}  $*"; }
warn()    { echo -e "${YELLOW}⚠${NC}  $*"; }
error()   { echo -e "${RED}✖${NC}  $*" >&2; }
step()    { echo -e "\n${BOLD}${BLUE}▶ $*${NC}"; }

ONLY_SETUP=false
HEADED=false

for arg in "$@"; do
  case $arg in
    --only-setup) ONLY_SETUP=true ;;
    --headed)     HEADED=true ;;
    --help|-h)
      echo "Uso: $0 [--only-setup] [--headed]"
      echo "  --only-setup  Instala dependências sem executar os testes"
      echo "  --headed      Executa testes com browser visível"
      exit 0
      ;;
    *)
      error "Argumento desconhecido: $arg"
      exit 1
      ;;
  esac
done

# ── Navegar para a raiz do projeto ───────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "\n${BOLD}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║   postech-blog-web — Setup E2E (Playwright)  ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════╝${NC}\n"

# ── 1. Verificar Node.js ─────────────────────────────────────────────────────
step "1/5  Verificando Node.js"
if ! command -v node &>/dev/null; then
  error "Node.js não encontrado. Instale em https://nodejs.org (>= 18)"
  exit 1
fi

NODE_VERSION=$(node -e "process.stdout.write(process.versions.node)")
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
  error "Node.js >= 18 é necessário. Versão atual: $NODE_VERSION"
  exit 1
fi
success "Node.js $NODE_VERSION  (>= 18 ✔)"

# ── 2. Instalar dependências npm ─────────────────────────────────────────────
step "2/5  Verificando dependências npm"
if [ ! -d "node_modules" ]; then
  info "node_modules não encontrado — executando npm install..."
  npm install
  success "Dependências instaladas"
else
  success "node_modules já existe — pulando npm install"
fi

# ── 3. Criar .env se necessário ──────────────────────────────────────────────
step "3/5  Verificando variáveis de ambiente"
ENV_FILE=".env"
API_URL="http://localhost:3000"

if [ ! -f "$ENV_FILE" ]; then
  echo "REACT_APP_API_URL=${API_URL}" > "$ENV_FILE"
  success ".env criado com REACT_APP_API_URL=${API_URL}"
else
  if grep -q "REACT_APP_API_URL" "$ENV_FILE"; then
    CURRENT_URL=$(grep "REACT_APP_API_URL" "$ENV_FILE" | cut -d= -f2)
    success ".env já existe — REACT_APP_API_URL=${CURRENT_URL}"
  else
    echo "REACT_APP_API_URL=${API_URL}" >> "$ENV_FILE"
    success "REACT_APP_API_URL adicionado ao .env existente"
  fi
fi

# ── 4. Instalar browsers do Playwright ───────────────────────────────────────
step "4/5  Verificando browsers do Playwright"
PLAYWRIGHT_BIN="./node_modules/.bin/playwright"

if [ ! -f "$PLAYWRIGHT_BIN" ]; then
  error "Playwright não encontrado em node_modules. Execute: npm install"
  exit 1
fi

# Verifica se chromium já está instalado para evitar reinstalação desnecessária
if "$PLAYWRIGHT_BIN" install --dry-run chromium 2>&1 | grep -q "already installed" 2>/dev/null || \
   "$PLAYWRIGHT_BIN" install --help &>/dev/null; then
  info "Instalando/verificando browsers do Playwright..."
  "$PLAYWRIGHT_BIN" install --with-deps chromium 2>&1 | tail -5
  success "Browsers do Playwright prontos"
fi

# ── 5. Verificar API backend ─────────────────────────────────────────────────
step "5/5  Verificando API backend (${API_URL})"

API_READY=false
if curl -sf --max-time 5 "${API_URL}/posts" -o /dev/null 2>/dev/null; then
  success "API está respondendo em ${API_URL}"
  API_READY=true
else
  warn "API não está respondendo em ${API_URL}"
  echo
  echo -e "  ${YELLOW}Para iniciar a API:${NC}"
  echo -e "  ${BOLD}  cd ../postech-blog-api && npm start${NC}"
  echo
  echo -e "  ${YELLOW}Aguarde a API subir e execute novamente:${NC}"
  echo -e "  ${BOLD}  npm run test:e2e:setup${NC}"
  echo
  if [ "$ONLY_SETUP" = false ]; then
    error "Não é possível executar os testes sem a API rodando."
    exit 1
  fi
fi

# ── Resumo do setup ──────────────────────────────────────────────────────────
echo
echo -e "${BOLD}${GREEN}══════════════════════════════════════════════${NC}"
echo -e "${BOLD}${GREEN}  Ambiente E2E configurado com sucesso!       ${NC}"
echo -e "${BOLD}${GREEN}══════════════════════════════════════════════${NC}"
echo
echo -e "  ${BOLD}Projeto:${NC}  $PROJECT_ROOT"
echo -e "  ${BOLD}Node.js:${NC}  $NODE_VERSION"
echo -e "  ${BOLD}API URL:${NC}  ${API_URL} $([ "$API_READY" = true ] && echo "${GREEN}(online)${NC}" || echo "${YELLOW}(offline)${NC}")"
  echo -e "  ${BOLD}Browser:${NC}  Chromium $([ "$HEADED" = true ] && echo "(headed — janela visível)" || echo "(headless)")"
echo

if [ "$ONLY_SETUP" = true ]; then
  info "Flag --only-setup ativa — testes NÃO serão executados."
  info "Para executar: npm run test:e2e"
  exit 0
fi

# ── Executar testes E2E ───────────────────────────────────────────────────────
echo -e "${BOLD}${BLUE}▶ Executando testes E2E...${NC}\n"

if [ "$HEADED" = true ]; then
  PLAYWRIGHT_HEADED=true npx playwright test
else
  npm run test:e2e
fi
