# Task 05 — Shared Components e Estilização

## Objetivo

Implementar os componentes compartilhados (Header, Footer, Pagination, PrivateRoute, Loading, ErrorMessage), o sistema de estilos (GlobalStyles + theme) e utilitários, todos com testes e `data-testid` fixos.

## Entregáveis

- [ ] `GlobalStyles.js` — reset CSS e estilos base
- [ ] `theme.js` — cores, fontes, espaçamentos, breakpoints
- [ ] `Header.test.js` + `Header.js`
- [ ] `Footer.test.js` + `Footer.js`
- [ ] `Pagination.test.js` + `Pagination.js`
- [ ] `PrivateRoute.test.js` + `PrivateRoute.js`
- [ ] `Loading.test.js` + `Loading.js`
- [ ] `ErrorMessage.test.js` + `ErrorMessage.js`
- [ ] `formatDate.test.js` + `formatDate.js`
- [ ] `truncateText.test.js` + `truncateText.js`
- [ ] Todos com `data-testid` fixos conforme convenção
- [ ] Responsivos (mobile-first)

## Localização

```
src/shared/
├── components/
│   ├── Header.js
│   ├── Header.test.js
│   ├── Footer.js
│   ├── Footer.test.js
│   ├── Pagination.js
│   ├── Pagination.test.js
│   ├── PrivateRoute.js
│   ├── PrivateRoute.test.js
│   ├── Loading.js
│   ├── Loading.test.js
│   ├── ErrorMessage.js
│   └── ErrorMessage.test.js
├── styles/
│   ├── GlobalStyles.js
│   └── theme.js
└── utils/
    ├── formatDate.js
    ├── formatDate.test.js
    ├── truncateText.js
    └── truncateText.test.js
```

## Especificações

### Theme

```js
const theme = {
  colors: {
    primary: '#2563EB',
    secondary: '#1E40AF',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    textLight: '#64748B',
    error: '#DC2626',
    success: '#16A34A',
    border: '#E2E8F0'
  },
  fonts: {
    body: "'Inter', sans-serif",
    heading: "'Inter', sans-serif"
  },
  breakpoints: {
    mobile: '768px',
    desktop: '1024px'
  },
  spacing: {
    xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px'
  }
};
```

### Header

| data-testid | Elemento | Comportamento |
|-------------|----------|---------------|
| `header-nav` | nav | Container principal |
| `header-link-home` | Link | Navega para `/` |
| `header-link-admin` | Link | Navega para `/admin` (só se autenticado) |
| `header-link-login` | Link | Navega para `/login` (só se NÃO autenticado) |
| `header-btn-logout` | button | Chama logout (só se autenticado) |

### Pagination

| data-testid | Elemento | Comportamento |
|-------------|----------|---------------|
| `pagination-container` | div | Container |
| `pagination-btn-prev` | button | Página anterior (disabled se page=1) |
| `pagination-btn-next` | button | Próxima página (disabled se última) |
| `pagination-btn-page-{n}` | button | Vai para página N |

**Props:** `{ currentPage, totalPages, onPageChange }`

### PrivateRoute

- Verifica `AuthContext.isAuthenticated`
- Se autenticado: renderiza children
- Se não: redireciona para `/login`

### Loading

| data-testid | Elemento |
|-------------|----------|
| `loading-spinner` | div com animação |

### ErrorMessage

| data-testid | Elemento |
|-------------|----------|
| `error-message` | div com mensagem |

**Props:** `{ message }`

### Utilitários

- `formatDate(isoString)` → `"22 mai 2026"`
- `truncateText(text, maxLength)` → `"texto trunca..."`

## Padrão de Testes (BDD)

```js
describe('Pagination', () => {
  describe('dado que está na primeira página de 5', () => {
    it('deve desabilitar o botão anterior', () => { /* ... */ });
    it('deve habilitar o botão próximo', () => { /* ... */ });
  });
  describe('quando o usuário clica no botão próximo', () => {
    it('deve chamar onPageChange com página 2', () => { /* ... */ });
  });
});
```

## Critérios de Aceitação

- Testes escritos ANTES da implementação (TDD)
- Todos os componentes interativos possuem `data-testid` fixo
- Componentes responsivos (mobile-first, breakpoints do theme)
- Styled Components utilizados para estilização
- Cobertura ≥ 80%
