# Task 06 — Autenticação: Domínio Auth + AuthContext

## Objetivo

Implementar o domínio de autenticação (entity User, use cases Login/Logout, AuthMockRepository) e o AuthContext compartilhado para gerenciar estado de autenticação na aplicação.

## Entregáveis

- [ ] `User.test.js` + `User.js` (entity)
- [ ] `Login.test.js` + `Login.js` (use case)
- [ ] `Logout.test.js` + `Logout.js` (use case)
- [ ] `AuthContext.test.js` + `AuthContext.js`
- [ ] `useAuth.test.js` + `useAuth.js` (hook)
- [ ] `LoginForm.test.js` + `LoginForm.js` (component)
- [ ] `Login.test.js` + `Login.js` (page)
- [ ] Todos os testes passando

## Localização

```
src/domains/auth/
├── domain/entities/
│   ├── User.js
│   └── User.test.js
├── application/usecases/
│   ├── Login.js
│   ├── Login.test.js
│   ├── Logout.js
│   └── Logout.test.js
├── infrastructure/repositories/
│   ├── AuthMockRepository.js
│   └── AuthMockRepository.test.js (da Task 04)
└── presentation/
    ├── pages/
    │   ├── Login.js
    │   └── Login.test.js
    ├── components/
    │   ├── LoginForm.js
    │   └── LoginForm.test.js
    └── hooks/
        ├── useAuth.js
        └── useAuth.test.js

src/shared/contexts/
├── AuthContext.js
└── AuthContext.test.js
```

## Especificações

### User (Entity)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | string | Identificador |
| name | string | Nome do professor |
| email | string | Email do professor |

### Login (Use Case)

| Aspecto | Detalhe |
|---------|---------|
| Input | `{ email, password }` |
| Output | `{ user: User, token: string }` |
| Regra | Email e password obrigatórios. Chama `authRepository.login(email, password)` |
| Erro | Lança erro se credenciais inválidas |

### Logout (Use Case)

| Aspecto | Detalhe |
|---------|---------|
| Input | — |
| Output | void |
| Regra | Chama `authRepository.logout()` |

### AuthContext

```js
// Estado e métodos expostos pelo contexto:
{
  user: User | null,
  isAuthenticated: boolean,
  loading: boolean,
  login: (email, password) => Promise<void>,
  logout: () => void
}
```

- Ao inicializar, verifica `localStorage` para restaurar sessão
- `login()` chama o use case, salva token e user no state + localStorage
- `logout()` limpa state e localStorage

### LoginForm (Component)

| data-testid | Elemento | Descrição |
|-------------|----------|-----------|
| `login-form` | form | Formulário |
| `login-input-email` | input | Campo email |
| `login-input-password` | input | Campo senha |
| `login-btn-submit` | button | Botão "Entrar" |
| `login-error-message` | div | Mensagem de erro |

**Comportamentos:**
- Validação: email e senha não podem ser vazios
- Loading state no botão durante requisição
- Exibir mensagem de erro se login falhar
- Redirect para `/admin` após login bem-sucedido

### Credenciais Mock

- Email: `professor@postech.com`
- Senha: `postech123`
- User retornado: `{ id: '1', name: 'Professor', email: 'professor@postech.com' }`

## Padrão de Testes (BDD)

```js
describe('Login Page', () => {
  describe('dado credenciais válidas', () => {
    it('deve autenticar e redirecionar para /admin', async () => { /* ... */ });
  });
  describe('dado credenciais inválidas', () => {
    it('deve exibir mensagem de erro', async () => { /* ... */ });
  });
  describe('dado campos vazios', () => {
    it('deve exibir validação nos campos obrigatórios', async () => { /* ... */ });
  });
});
```

## Critérios de Aceitação

- Testes escritos ANTES da implementação (TDD)
- Padrão BDD nos testes
- AuthContext fornece estado reativo para toda a app
- Login mock funciona com credenciais fixas
- Sessão persistida em localStorage
- `data-testid` fixos em todos os elementos interativos
- Cobertura ≥ 80%
