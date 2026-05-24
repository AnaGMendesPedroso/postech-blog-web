# Task — Página de Criação de Conta (Register)

## ✅ Status: IMPLEMENTADO

**Data de conclusão:** 2026-05-24

### Resultados

- **581 testes** passando (83 novos adicionados, 0 regressões)
- **49 test suites** passando (5 novos, 3 alterados)
- **0 warnings** de lint
- **0 testes quebrados**

### Artefatos entregues

| # | Artefato | Arquivo | Tipo |
|---|----------|---------|------|
| 1 | User (Entity atualizada) | `src/domains/auth/domain/entities/User.js` | Alteração (+role) |
| 2 | Register (Use Case) | `src/domains/auth/application/usecases/Register.js` | Novo |
| 3 | AuthApiRepository | `src/domains/auth/infrastructure/repositories/AuthApiRepository.js` | Novo |
| 4 | AuthMockRepository (atualizado) | `src/domains/auth/infrastructure/repositories/AuthMockRepository.js` | Alteração (+register) |
| 5 | AuthContext (atualizado) | `src/shared/contexts/AuthContext.js` | Alteração (+register) |
| 6 | RegisterForm | `src/domains/auth/presentation/components/RegisterForm.js` | Novo |
| 7 | RegisterPage | `src/domains/auth/presentation/pages/RegisterPage.js` | Novo |
| 8 | LoginPage (atualizado) | `src/domains/auth/presentation/pages/LoginPage.js` | Alteração (+link register) |
| 9 | TeacherRoute | `src/shared/components/TeacherRoute.js` | Novo |
| 10 | Header (atualizado) | `src/shared/components/Header.js` | Alteração (role-based) |
| 11 | App.js (atualizado) | `src/App.js` | Alteração (+rota, TeacherRoute) |
| 12 | test-utils.js (atualizado) | `src/shared/test-utils.js` | Alteração (+register, +role) |

### Decisões de implementação aplicadas

- **Mapeamento nome↔name**: Responsabilidade do `AuthApiRepository` — entity local usa `name` (EN), API usa `nome` (PT). Repository traduz nos dois sentidos.
- **Fluxo register (2 requests)**: `POST /auth/register` → `POST /auth/login` automático para obter JWT. Implementado no `AuthApiRepository.register()`.
- **`role` obrigatório na entity User**: Valor `'professor'` do mock antigo migrado para `'teacher'` (compatível com API). Testes existentes adaptados com cascade fix.
- **`TeacherRoute` separado de `PrivateRoute`**: SRP — `PrivateRoute` apenas verifica auth, `TeacherRoute` verifica auth + role.
- **Header condicional por role**: Link "Painel" visível apenas para `user.role === 'teacher'`.
- **RegisterForm desacoplado do context**: Via props (`onSubmit`, `error`, `loading`), mesmo padrão do LoginForm.
- **Campo condicional `accessCode`**: Aparece/desaparece ao selecionar teacher/student, com limpeza de valor.
- **Validação duplicada**: Client-side (RegisterForm) + Domain (Register use case) — UX rápida + integridade.

---

## Objetivo

Implementar a página de registro de novas usuárias, acessível a partir da tela de login. O backend já disponibiliza o endpoint `POST /auth/register`. Esta task cobre: extensão da entity User com `role`, criação do `AuthApiRepository` para integração real com a API, formulário de registro com validação client-side, e controle de permissão por role nas rotas.

**Regras de negócio:**
- **Professoras (teacher)** podem criar, editar, excluir e comentar posts.
- **Alunas (student)** podem apenas visualizar e comentar posts.
- Professoras precisam informar um **código de acesso** no registro.

---

## Contexto e Lições Aprendidas

### O que já existe (NÃO reimplementar)

| Artefato | Localização | Status |
|----------|-------------|--------|
| `User` entity | `src/domains/auth/domain/entities/User.js` | ✅ Task 06 — SEM `role` |
| `Login` use case | `src/domains/auth/application/usecases/Login.js` | ✅ Task 06 |
| `Logout` use case | `src/domains/auth/application/usecases/Logout.js` | ✅ Task 06 |
| `AuthMockRepository` | `src/domains/auth/infrastructure/repositories/` | ✅ Task 04 |
| `AuthContext` + `useAuth` | `src/shared/contexts/AuthContext.js` | ✅ Task 05 |
| `PrivateRoute` | `src/shared/components/PrivateRoute.js` | ✅ Task 05 |
| `LoginForm` | `src/domains/auth/presentation/components/LoginForm.js` | ✅ Task 06 |
| `LoginPage` | `src/domains/auth/presentation/pages/LoginPage.js` | ✅ Task 06 |
| `httpClient` (axios) | `src/shared/infrastructure/http/httpClient.js` | ✅ Task 04 |
| `PostApiRepository` | `src/domains/posts/infrastructure/repositories/` | ✅ referência de padrão |
| `renderWithProviders` + `mockAuthRepository` | `src/shared/test-utils.js` | ✅ |

### Lições das Tasks Anteriores (aplicar aqui)

| Task | Lição | Ação nesta Task |
|------|-------|--------------------|
| Task 06 | Entity `User` aceita campos extras sem erro — não é strict | Ao adicionar `role`, manter backward-compatible: role pode ser optional para não quebrar testes antigos? **NÃO** — role é obrigatório na API. Atualizar testes existentes. |
| Task 06 | Loading gerenciado na Page (local state), não no context | Manter o mesmo padrão na `RegisterPage` |
| Task 06 | LoginForm desacoplado do context (via props) | `RegisterForm` seguirá o mesmo princípio |
| Task 09 | Validação duplicada (client + use case) para UX rápida no client + integridade no domínio | Aplicar no `Register` use case e `RegisterForm` |
| Task 09 | `usePostForm` internal ao `PostForm` — componente self-contained | NÃO aplicar aqui — RegisterForm é simples o suficiente para gerenciar estado localmente sem hook custom |
| Task 14 | Boundary testing mata mutantes — testar min/max exatos | Testar nome com 2 chars (ok) e 1 char (falha), senha com 6 chars (ok) e 5 chars (falha) |
| Task 14 | Assert negativo explícito (`not.toHaveBeenCalled()`) | Garantir que repo não é chamado quando validação falha |
| Geral | `mockAuthRepository` em test-utils precisa ser atualizado ao adicionar `register` | Atualizar `mockAuthRepository` com `register: jest.fn()` — senão todos os testes que usam `renderWithProviders` podem quebrar |

> ⚠️ **BREAKING CHANGE**: Adicionar `role` como obrigatório na entity `User` vai quebrar testes existentes (Task 06 criou User sem role). Atualizar `User.test.js`, `Login.test.js`, `LoginPage.test.js`, `AuthMockRepository`, `mockAuthRepository` em `test-utils.js`.

---

## Documentação das APIs (Backend)

#### `POST /auth/register` — Registra nova conta

**Request Body:**
```json
{
  "nome": "string (2–100 chars, obrigatório)",
  "email": "string (format: email, obrigatório)",
  "senha": "string (min 6 chars, obrigatório)",
  "role": "string (enum: 'teacher' | 'student', obrigatório)",
  "codigoAcesso": "string (obrigatório apenas para role 'teacher')"
}
```

**Responses:**
| Status | Descrição | Body |
|--------|-----------|------|
| `201` | Conta criada com sucesso | `{ success: true, data: User }` |
| `400` | Dados inválidos | `{ success: false, error: { message, details[] } }` |
| `403` | Código de acesso inválido para teacher | `{ success: false, error: { message } }` |
| `409` | Email já cadastrado | `{ success: false, error: { message } }` |

**Schema `User` (resposta do register):**
```json
{
  "id": "string",
  "nome": "string",
  "email": "string",
  "role": "teacher | student",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

> ⚠️ **Register NÃO retorna token.** Após registro bem-sucedido, o front deve chamar `POST /auth/login` automaticamente para obter o JWT e autenticar a sessão.

---

#### `POST /auth/login` — Realiza login

**Request Body:**
```json
{
  "email": "string (format: email, obrigatório)",
  "senha": "string (obrigatório)"
}
```

**Responses:**
| Status | Descrição | Body |
|--------|-----------|------|
| `200` | Login realizado com sucesso | `AuthResponse` |
| `401` | Credenciais inválidas | `{ success: false, error: { message } }` |

**Schema `AuthResponse`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "nome": "string",
      "email": "string",
      "role": "teacher | student",
      "createdAt": "date-time",
      "updatedAt": "date-time"
    },
    "token": "string (JWT)"
  }
}
```

---

## Entregáveis

| # | Artefato | Caminho | Tipo |
|---|----------|---------|------|
| 1 | `User.js` (estendido com role) | `src/domains/auth/domain/entities/` | Entity (alteração) |
| 2 | `Register.js` | `src/domains/auth/application/usecases/` | Use Case (novo) |
| 3 | `AuthApiRepository.js` | `src/domains/auth/infrastructure/repositories/` | Repository (novo) |
| 4 | `AuthMockRepository.js` (atualizado) | `src/domains/auth/infrastructure/repositories/` | Repository (alteração) |
| 5 | `AuthContext.js` (atualizado) | `src/shared/contexts/` | Context (alteração) |
| 6 | `RegisterForm.js` | `src/domains/auth/presentation/components/` | Component (novo) |
| 7 | `RegisterPage.js` | `src/domains/auth/presentation/pages/` | Page (novo) |
| 8 | `LoginPage.js` (link para register) | `src/domains/auth/presentation/pages/` | Page (alteração) |
| 9 | `TeacherRoute.js` | `src/shared/components/` | Guard (novo) |
| 10 | `Header.js` (controle por role) | `src/shared/components/` | Component (alteração) |
| 11 | `App.js` (rota /register + TeacherRoute) | `src/` | Routing (alteração) |
| 12 | `test-utils.js` (mockAuthRepository atualizado) | `src/shared/` | Test infra (alteração) |

**Testes correspondentes para cada artefato novo/alterado** (12+ arquivos de teste).

---

## Estrutura de Diretórios (resultado final)

```
src/domains/auth/
├── domain/
│   └── entities/
│       ├── User.js                  ← ALTERAR (adicionar #role)
│       └── User.test.js             ← ALTERAR (novos cenários de role)
├── application/
│   └── usecases/
│       ├── Login.js                 ← JÁ EXISTE
│       ├── Logout.js                ← JÁ EXISTE
│       ├── Register.js              ← NOVO
│       └── Register.test.js         ← NOVO
├── infrastructure/
│   └── repositories/
│       ├── AuthMockRepository.js    ← ALTERAR (register, role)
│       ├── AuthMockRepository.test.js ← ALTERAR
│       ├── AuthApiRepository.js     ← NOVO
│       └── AuthApiRepository.test.js ← NOVO
└── presentation/
    ├── components/
    │   ├── LoginForm.js             ← JÁ EXISTE
    │   ├── RegisterForm.js          ← NOVO
    │   └── RegisterForm.test.js     ← NOVO
    └── pages/
        ├── LoginPage.js             ← ALTERAR (link para /register)
        ├── LoginPage.test.js        ← ALTERAR (testar presença do link)
        ├── RegisterPage.js          ← NOVO
        └── RegisterPage.test.js     ← NOVO

src/shared/
├── components/
│   ├── Header.js                    ← ALTERAR (condicionar links por role)
│   ├── Header.test.js               ← ALTERAR
│   ├── TeacherRoute.js              ← NOVO
│   └── TeacherRoute.test.js         ← NOVO
├── contexts/
│   ├── AuthContext.js               ← ALTERAR (expor register)
│   └── AuthContext.test.js          ← ALTERAR
└── test-utils.js                    ← ALTERAR (mockAuthRepository + register)

src/App.js                           ← ALTERAR (rota + TeacherRoute)
src/App.test.js                      ← ALTERAR (se aplicável)
```

---

## Especificações Detalhadas

### 1. User Entity — Adição de `role`

**Arquivo:** `src/domains/auth/domain/entities/User.js`

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `id` | string | Sim | Não vazio (já existe) |
| `name` | string | Sim | Não vazio, trim (já existe) |
| `email` | string | Sim | Formato email (já existe) |
| `role` | string | Sim | **NOVO** — deve ser `"teacher"` ou `"student"` |

**Decisão de mapeamento:** A entity local usa `name` (inglês). O backend retorna `nome`. O mapeamento `nome → name` ocorre na camada de **infrastructure** (repository). A entity permanece com a interface em inglês para consistência com o código existente.

**Motivo:** Mudar todos os pontos que usam `user.name` no front seria uma refatoração massiva e desnecessária. A responsabilidade do repository é traduzir o shape da API para o shape do domínio.

**Casos de teste a ADICIONAR:**
```
describe('User', () => {
  describe('dado dados válidos com role', () => {
    ✓ deve criar User com role "teacher"
    ✓ deve criar User com role "student"
    ✓ deve expor role via getter
    ✓ toJSON() deve incluir role
  });
  describe('dado role inválido', () => {
    ✓ deve lançar erro quando role é vazio/null/undefined
    ✓ deve lançar erro quando role não é "teacher" nem "student"
  });
});
```

---

### 2. Register Use Case

**Arquivo:** `src/domains/auth/application/usecases/Register.js`

| Aspecto | Detalhe |
|---------|---------|
| Constructor | `constructor(authRepository)` |
| Método | `async execute({ name, email, password, role, accessCode })` |
| Output | `{ user: User, token: string }` |
| Validação | name, email, password, role obrigatórios antes de chamar repo |
| Validação role | Deve ser `"teacher"` ou `"student"` |
| Validação accessCode | Se `role === "teacher"`, accessCode é obrigatório |
| Delegação | `authRepository.register(...)` |
| Transformação | Resultado do repo → instância de `User` entity |

**Interface interna (use case) usa nomes em inglês. O repository faz a tradução para o payload da API (nome/senha/codigoAcesso).**

**Casos de teste obrigatórios:**
```
describe('Register UseCase', () => {
  describe('dado inputs válidos (student)', () => {
    ✓ deve chamar authRepository.register com dados corretos
    ✓ deve retornar { user, token }
    ✓ user retornado deve ser instância de User entity com role "student"
  });
  describe('dado inputs válidos (teacher com accessCode)', () => {
    ✓ deve chamar authRepository.register incluindo accessCode
    ✓ deve retornar user com role "teacher"
  });
  describe('dado inputs inválidos', () => {
    ✓ deve lançar erro quando name é vazio
    ✓ deve lançar erro quando email é vazio
    ✓ deve lançar erro quando password é vazio
    ✓ deve lançar erro quando role é vazio
    ✓ deve lançar erro quando role é valor inválido
    ✓ deve lançar erro quando role é teacher sem accessCode
    ✓ não deve chamar repositório se validação falhar
  });
  describe('dado erro do repositório', () => {
    ✓ deve propagar erro (ex: "Email já cadastrado")
  });
});
```

---

### 3. AuthApiRepository

**Arquivo:** `src/domains/auth/infrastructure/repositories/AuthApiRepository.js`

**Responsabilidade:** Integração real com a API. Traduz interface de domínio ↔ shape da API.

```js
class AuthApiRepository {
  async register({ name, email, password, role, accessCode }) {
    // 1. POST /auth/register → { nome, email, senha, role, codigoAcesso }
    // 2. Se 201: POST /auth/login para obter token
    // 3. Armazena token + user no localStorage
    // 4. Retorna { user: { id, name, email, role }, token }
  }

  async login(email, password) {
    // 1. POST /auth/login → { email, senha }
    // 2. Armazena token + user no localStorage
    // 3. Retorna { user: { id, name, email, role }, token }
  }

  async logout() { /* limpa localStorage */ }
  getCurrentUser() { /* lê do localStorage */ }
  isAuthenticated() { /* verifica token no localStorage */ }
}
```

**Mapeamento de campos (responsabilidade do repository):**

| Domínio (inglês) | API (português) | Direção |
|------------------|-----------------|---------|
| `name` | `nome` | request ↔ response |
| `password` | `senha` | request only |
| `accessCode` | `codigoAcesso` | request only |

**Error handling (seguir padrão de `PostApiRepository`):**
```js
_extractErrorMessage(error) {
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error.response) return 'Erro ao comunicar com a API';
  if (error.request) return 'Erro de conexão. Verifique sua rede.';
  return 'Erro inesperado';
}
```

**Fluxo de register (2 chamadas):**
1. `POST /auth/register` → 201 (usuária criada, sem token)
2. `POST /auth/login` → 200 (obtém token + user completo)

Se o step 2 falhar (improvável mas possível), lançar erro — a conta foi criada mas a sessão não foi iniciada. A usuária pode fazer login manualmente.

**Casos de teste obrigatórios (mock httpClient):**
```
describe('AuthApiRepository', () => {
  describe('register', () => {
    ✓ deve chamar POST /auth/register com payload mapeado (nome, senha, codigoAcesso)
    ✓ deve chamar POST /auth/login automaticamente após register 201
    ✓ deve armazenar token e user no localStorage
    ✓ deve retornar { user, token } com campos mapeados (name, não nome)
    ✓ deve propagar mensagem de erro quando register retorna 409
    ✓ deve propagar mensagem de erro quando register retorna 403
    ✓ deve propagar mensagem de erro quando register retorna 400
    ✓ deve tratar erro de conexão
  });
  describe('login', () => {
    ✓ deve chamar POST /auth/login com { email, senha }
    ✓ deve armazenar token e user no localStorage
    ✓ deve retornar { user, token } com campos mapeados
    ✓ deve propagar mensagem de erro quando retorna 401
  });
  describe('logout', () => { ... });
  describe('getCurrentUser', () => { ... });
  describe('isAuthenticated', () => { ... });
});
```

---

### 4. AuthMockRepository — Atualização

**Arquivo:** `src/domains/auth/infrastructure/repositories/AuthMockRepository.js`

- Adicionar `role: 'teacher'` ao `MOCK_USER` existente (já está assim — verificar).
- Adicionar array `registeredUsers` em memória.
- Implementar `register({ name, email, password, role, accessCode })`:
  - Se email em uso → throw `'Email já cadastrado'`
  - Se role === 'teacher' e accessCode !== 'POSTECH2024' → throw `'Código de acesso inválido'`
  - Gerar id mock, armazenar, retornar `{ user, token }`
- **NÃO mudar a interface para português** — o mock segifica o DOMAIN interface (inglês), não a API.

---

### 5. AuthContext — Expor `register`

**Arquivo:** `src/shared/contexts/AuthContext.js`

```js
const register = useCallback(async (name, email, password, role, accessCode) => {
  const result = await authRepository.register({ name, email, password, role, accessCode });
  setUser(result.user);
  return result;
}, [authRepository]);
```

**Value atualizado:**
```js
<AuthContext.Provider value={{ user, login, logout, register, isAuthenticated }}>
```

---

### 6. RegisterForm (Component)

**Arquivo:** `src/domains/auth/presentation/components/RegisterForm.js`

**Interface (Props) — desacoplado do context:**
```js
RegisterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,  // ({ name, email, password, role, accessCode }) => Promise<void>
  error: PropTypes.string,               // Mensagem de erro externa (API)
  loading: PropTypes.bool                // Estado de carregamento
};
```

| data-testid | Elemento | Notas |
|-------------|----------|-------|
| `register-form` | `<form>` | Wrapper |
| `register-input-name` | `<input type="text">` | min 2, max 100 |
| `register-input-email` | `<input type="email">` | Formato válido |
| `register-input-password` | `<input type="password">` | min 6 |
| `register-input-password-confirm` | `<input type="password">` | Deve coincidir |
| `register-radio-student` | `<input type="radio" value="student">` | Default: nenhum |
| `register-radio-teacher` | `<input type="radio" value="teacher">` | |
| `register-input-access-code` | `<input type="text">` | Visível APENAS se teacher |
| `register-btn-submit` | `<button type="submit">` | "Criar Conta" / "Criando..." |
| `register-error-message` | `<div role="alert">` | Erro da API |
| `register-error-name` | `<span>` | Validação inline |
| `register-error-email` | `<span>` | Validação inline |
| `register-error-password` | `<span>` | Validação inline |
| `register-error-password-confirm` | `<span>` | Validação inline |
| `register-error-role` | `<span>` | Validação inline |
| `register-error-access-code` | `<span>` | Validação inline (condicional) |

**Validações client-side:**

| Campo | Regra | Mensagem |
|-------|-------|----------|
| name | obrigatório, trim | "Nome é obrigatório" |
| name | min 2 chars (trimmed) | "Nome deve ter no mínimo 2 caracteres" |
| email | obrigatório | "Email é obrigatório" |
| email | formato válido (regex) | "Email deve ter um formato válido" |
| password | obrigatório | "Senha é obrigatória" |
| password | min 6 chars | "Senha deve ter no mínimo 6 caracteres" |
| passwordConfirm | obrigatório | "Confirmação de senha é obrigatória" |
| passwordConfirm | === password | "As senhas não coincidem" |
| role | obrigatório | "Selecione um perfil" |
| accessCode | obrigatório se teacher | "Código de acesso é obrigatório para professoras" |

**Comportamentos:**
- Limpar erro de validação do campo quando usuário digita (mesmo padrão LoginForm)
- Limpar erro da API quando qualquer campo é alterado
- Campo `accessCode` aparece/desaparece com animação suave ao selecionar teacher/student
- `e.preventDefault()` no submit
- Botão "Criar Conta" → "Criando..." durante loading, disabled

**Acessibilidade:**
- Labels com `htmlFor`/`id`
- `aria-invalid="true"` nos campos com erro
- `aria-describedby` para mensagens de erro
- `role="alert"` no erro da API
- Radio group com `fieldset` + `legend`

**Casos de teste obrigatórios:**
```
describe('RegisterForm', () => {
  describe('dado renderização inicial', () => {
    ✓ deve renderizar todos os campos (name, email, password, confirmação, role radios)
    ✓ não deve renderizar campo de código de acesso
    ✓ botão deve estar habilitado com texto "Criar Conta"
    ✓ não deve exibir mensagens de erro
  });
  describe('dado seleção de role', () => {
    ✓ deve exibir campo de código de acesso quando "Professora" selecionado
    ✓ deve ocultar campo de código de acesso quando "Aluna" selecionado
    ✓ deve limpar valor de accessCode ao trocar de teacher para student
  });
  describe('dado submit com campos vazios', () => {
    ✓ deve exibir erros de validação para todos os campos obrigatórios
    ✓ não deve chamar onSubmit
  });
  describe('dado submit com dados válidos (student)', () => {
    ✓ deve chamar onSubmit com { name, email, password, role: "student" }
    ✓ não deve incluir accessCode
  });
  describe('dado submit com dados válidos (teacher)', () => {
    ✓ deve chamar onSubmit com { name, email, password, role: "teacher", accessCode }
  });
  describe('dado validações de boundary', () => {
    ✓ nome com 1 char → erro
    ✓ nome com 2 chars → OK
    ✓ senha com 5 chars → erro
    ✓ senha com 6 chars → OK
    ✓ senhas que não coincidem → erro
    ✓ email sem @ → erro
  });
  describe('dado teacher sem código de acesso', () => {
    ✓ deve exibir erro "Código de acesso é obrigatório para professoras"
    ✓ não deve chamar onSubmit
  });
  describe('dado loading=true', () => {
    ✓ deve desabilitar botão
    ✓ deve exibir "Criando..." no botão
  });
  describe('dado prop error', () => {
    ✓ deve exibir mensagem de erro da API com role="alert"
  });
  describe('dado erro de validação exibido', () => {
    ✓ deve limpar erro do campo quando usuário digita
    ✓ deve limpar erro da API quando qualquer campo muda
  });
});
```

---

### 7. RegisterPage (Page)

**Arquivo:** `src/domains/auth/presentation/pages/RegisterPage.js`

| data-testid | Elemento |
|-------------|----------|
| `register-page` | Container |
| `register-page-title` | `<h1>` "Criar Conta" |
| `register-link-login` | Link para `/login` |

**Comportamentos:**
- Se já autenticada → `<Navigate to="/admin" replace />` (teacher) ou `<Navigate to="/" replace />` (student)
- Chamar `register(name, email, password, role, accessCode)` do AuthContext
- Loading gerenciado localmente (state)
- Após sucesso: teacher → `/admin`, student → `/`
- Erro → exibir via prop `error` no RegisterForm

**Casos de teste obrigatórios:**
```
describe('RegisterPage', () => {
  describe('dado usuária não autenticada', () => {
    ✓ deve renderizar título "Criar Conta" e RegisterForm
    ✓ deve renderizar link para login
  });
  describe('dado registro como student bem-sucedido', () => {
    ✓ deve chamar register do context
    ✓ deve navegar para /
  });
  describe('dado registro como teacher bem-sucedido', () => {
    ✓ deve navegar para /admin
  });
  describe('dado erro no registro', () => {
    ✓ deve exibir mensagem de erro no form
    ✓ deve manter formulário preenchido
  });
  describe('dado usuária já autenticada (teacher)', () => {
    ✓ deve redirecionar para /admin
  });
  describe('dado usuária já autenticada (student)', () => {
    ✓ deve redirecionar para /
  });
});
```

---

### 8. LoginPage — Link para Register

**Alteração:** Adicionar link "Não tem uma conta? Criar conta" abaixo do form.

| data-testid | Elemento |
|-------------|----------|
| `login-link-register` | `<Link to="/register">` |

---

### 9. TeacherRoute (Guard Component)

**Arquivo:** `src/shared/components/TeacherRoute.js`

```js
function TeacherRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'teacher') {
    return <Navigate to="/" replace />;
  }

  return children;
}
```

**Casos de teste:**
```
describe('TeacherRoute', () => {
  ✓ deve renderizar children quando user é teacher autenticado
  ✓ deve redirecionar para /login quando não autenticado
  ✓ deve redirecionar para / quando user é student
});
```

---

### 10. Header — Controle por Role

**Alteração em `src/shared/components/Header.js`:**

- Link "Painel" → visível apenas para `user.role === 'teacher'`
- Botão "Sair" → visível para qualquer autenticada
- Para students logadas: mostrar "Sair" mas NOT "Painel"

---

### 11. App.js — Rotas Atualizadas

```jsx
<Route path="/register" element={<RegisterPage />} />
<Route path="/admin" element={<TeacherRoute><Admin /></TeacherRoute>} />
<Route path="/admin/posts/new" element={<TeacherRoute><CreatePostPage /></TeacherRoute>} />
<Route path="/admin/posts/:id/edit" element={<TeacherRoute><EditPostPage /></TeacherRoute>} />
```

---

### 12. test-utils.js — Atualização obrigatória

```js
export function mockAuthRepository(overrides = {}) {
  return {
    login: jest.fn().mockResolvedValue({
      user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'teacher' },
      token: 'tok'
    }),
    logout: jest.fn().mockResolvedValue(undefined),
    register: jest.fn().mockResolvedValue({
      user: { id: '2', name: 'New User', email: 'new@test.com', role: 'student' },
      token: 'tok2'
    }),
    getCurrentUser: jest.fn(() => null),
    isAuthenticated: jest.fn(() => false),
    ...overrides,
  };
}
```

---

## Padrão de Testes — Convenções Obrigatórias

```javascript
describe('[NomeDoArtefato]', () => {
  describe('dado [pré-condição/contexto]', () => {
    it('deve [comportamento esperado]', async () => {
      // Given - setup explícito
      // When - ação
      // Then - asserção
    });
  });
});
```

**Regras (herdadas da Task 06):**

| # | Regra |
|---|-------|
| 1 | `it()` apenas — sem `test()` |
| 2 | `@testing-library/user-event` para interações |
| 3 | Sem `setTimeout` ou delays artificiais |
| 4 | `findBy*` > `waitFor` genérico |
| 5 | `renderWithProviders` para componentes com context |
| 6 | Cada `it()` independente |
| 7 | Mocks extraídos para factory functions |
| 8 | Assert negativo explícito |
| 9 | Boundary tests para validações numéricas (min/max) |
| 10 | Testar mensagem exata de erro em validações de entidades |

---

## Decisões Técnicas e Trade-offs

| Decisão | Justificativa | Alternativa descartada |
|---------|---------------|----------------------|
| Mapeamento nome↔name no repository | Entity mantém interface em inglês (consistência com codebase) | Mudar toda entity para português — refatoração massiva |
| Register + Login automático (2 requests) | API não retorna token no register | Pedir ao backend para retornar token — out of scope |
| `TeacherRoute` separado de `PrivateRoute` | SRP — cada guard tem uma responsabilidade. Evita `if` chains | Prop `requiredRole` no PrivateRoute — viola OCP |
| `RegisterForm` sem hook custom | Form é mais simples que PostForm (sem initialData/mode); useState basta | `useRegisterForm` custom — over-engineering |
| Role obrigatório na entity | API sempre retorna role; garante integridade no front | Role opcional — permite states ambíguos |
| Validação em PT-BR nas mensagens | Projeto é em português; consistência com LoginForm existente | Mensagens em inglês — inconsistente |
| Radio buttons para role (não select) | Apenas 2 opções; melhor UX; mais acessível | Select/dropdown — overhead para 2 items |
| accessCode campo condicional | Menos ruído para students; validação contextual | Sempre visível com nota "apenas professoras" — confuso |

---

## Ordem de Implementação (TDD)

```
 1. test-utils.js           (atualizar mockAuthRepository com register + role)
 2. User.test.js → User.js  (adicionar role — verifica que testes antigos adaptam)
 3. Register.test.js → Register.js  (use case, depende de User)
 4. AuthApiRepository.test.js → AuthApiRepository.js  (integração com API)
 5. AuthMockRepository.test.js → AuthMockRepository.js  (atualizar register)
 6. AuthContext.test.js → AuthContext.js  (expor register)
 7. RegisterForm.test.js → RegisterForm.js  (componente puro via props)
 8. RegisterPage.test.js → RegisterPage.js  (integração: form + context + router)
 9. TeacherRoute.test.js → TeacherRoute.js  (guard)
10. LoginPage.test.js → LoginPage.js  (adicionar link)
11. Header.test.js → Header.js  (condicionar por role)
12. App.js  (rotas finais)
```

**Gate entre steps:** Cada step deve ter todos os testes passando (green) antes de avançar. Rodar `npm test -- --watchAll=false` entre cada step.

> **ATENÇÃO ao step 2:** Adicionar `role` obrigatório na entity vai quebrar testes existentes. Atualizar imediatamente: `Login.test.js`, `LoginPage.test.js`, `AuthMockRepository.test.js`, `AuthContext.test.js`, e qualquer outro que crie instância de User sem role.

---

## Red Flags — O que Rejeitar em Code Review

| Anti-pattern | Por quê | Correção |
|---|---|---|
| `useAuth()` dentro de `RegisterForm` | Acoplamento; testa-se com dificuldade | Props-based |
| Payload da API com campos em inglês (`name`, `password`) | API espera `nome`, `senha` | Repository faz mapeamento |
| `localStorage` direto na Page/Component | Responsabilidade do repository | Usar AuthContext → repo |
| Esquecer de chamar login após register | Sessão não inicia; UX quebrada | Fluxo register → login automático no repo |
| `try/catch` que silencia erros | Impossível debugar; UX sem feedback | Propagar; tratar na page |
| Testar com `fireEvent` ao invés de `userEvent` | Menos realista; não dispara todos os eventos | Sempre `userEvent` |
| Radio sem `fieldset`/`legend` | Acessibilidade comprometida | Semântica HTML correta |
| Mock global de httpClient em todos os testes | Impede teste de mapeamento real | Mock cirúrgico por teste |
| Não testar o fluxo de 2 requests (register + login) | Bug silencioso se login falha após register | Teste explícito com mock sequencial |
| `role` hardcoded em vez de usar resposta da API | Fonte de verdade deve ser o backend | Mapear do response |

---

## Critérios de Aceitação (QA Checklist)

### Funcional
- [ ] Navegar de `/login` para `/register` via link "Criar conta"
- [ ] Navegar de `/register` para `/login` via link "Já tem conta? Entrar"
- [ ] Criar conta como student sem código de acesso → autenticada e redirecionada para `/`
- [ ] Criar conta como teacher com código válido → autenticada e redirecionada para `/admin`
- [ ] Campos vazios bloqueiam submit e exibem validação inline (cada campo)
- [ ] Campo "Código de acesso" visível apenas quando "Professora" selecionado
- [ ] Erro 409 (email duplicado) exibido no form
- [ ] Erro 403 (código inválido) exibido no form
- [ ] Erro 400 (dados inválidos) exibido no form
- [ ] Após registro, sessão é persistida (reload mantém login)
- [ ] Teacher autenticada vê "Painel" no Header
- [ ] Student autenticada NÃO vê "Painel" no Header
- [ ] Student que acessa `/admin` é redirecionada para `/`
- [ ] Student que acessa `/admin/posts/new` é redirecionada para `/`
- [ ] User não autenticada que acessa `/admin` é redirecionada para `/login`
- [ ] `PrivateRoute` continua funcionando para rotas que aceitam qualquer role (se houver)

### Qualidade de Código
- [ ] Entity User segue padrão existente (private fields #, freeze, toJSON, getters)
- [ ] Use case segue padrão de Login (constructor com repo, método execute, validação antes de delegar)
- [ ] Repository segue padrão de PostApiRepository (httpClient, _extractErrorMessage)
- [ ] Nenhum `console.log` em código de produção
- [ ] Imports seguem direção: presentation → application → domain (nunca inverso)
- [ ] Nenhum import de infrastructure na camada domain
- [ ] Nenhum campo da API (nome/senha/codigoAcesso) vaza para fora do repository

### Qualidade de Testes
- [ ] `npm test -- --watchAll=false` → TODOS passando (zero broken)
- [ ] Cobertura ≥ 80% nos artefatos novos
- [ ] Todos os testes usam `user-event` para interações
- [ ] Sem `setTimeout` ou delays artificiais
- [ ] Boundary tests presentes (2 chars nome, 6 chars senha)
- [ ] Testes de assert negativo (`not.toHaveBeenCalled` quando validação falha)
- [ ] Nenhum teste existente removido ou enfraquecido
- [ ] Total de testes do test suite NÃO diminui

### Acessibilidade
- [ ] Labels associados a todos os inputs
- [ ] `role="alert"` em mensagens de erro da API
- [ ] `aria-invalid` + `aria-describedby` em campos com erro
- [ ] Radio group em `fieldset` com `legend`
- [ ] Form navegável via teclado (Tab order, Enter submete)

### Segurança
- [ ] Password inputs com `type="password"` sempre
- [ ] Token não exposto em DOM ou console
- [ ] Código de acesso não exposto em DOM após submit
- [ ] Mensagem de erro genérica para credenciais inválidas (login existente não muda)

---

## Estimativa de Esforço

| Atividade | Tempo Estimado |
|-----------|---------------|
| Step 1-2: test-utils + User entity update | 30 min |
| Step 3: Register use case (TDD) | 45 min |
| Step 4-5: Repositories (API + Mock) | 1h |
| Step 6: AuthContext update | 15 min |
| Step 7: RegisterForm (TDD) | 1.5h |
| Step 8: RegisterPage (TDD) | 45 min |
| Step 9: TeacherRoute + Header + App routing | 45 min |
| Step 10-11: LoginPage link + ajustes | 15 min |
| Step 12: Fix testes existentes quebrados | 30 min |
| Validação final (all tests green + smoke test manual) | 30 min |
| **Total** | **~6-7h** |

---

## Notas para o Desenvolvedor

1. **Rode TODOS os testes antes de começar**: `npm test -- --watchAll=false`. Se algo quebra, corrija antes.
2. **O step 2 (User + role) vai quebrar coisas.** Esteja preparado para cascade fix em 4-6 arquivos de teste.
3. **`renderWithProviders` é seu amigo** — para RegisterPage, customize authRepository mock com register success/failure.
4. **React Router v7** — usar `useNavigate` e `<Navigate>` (não `useHistory` ou `Redirect`).
5. **httpClient já tem interceptor de auth** — o token no localStorage é incluído automaticamente em requests futuras. O repository apenas precisa salvar.
6. **O `AuthMockRepository` existente já retorna `role: 'professor'`** — MAS o valor é `'professor'` e a API usa `'teacher'`. **Migrar para `'teacher'`** no mock para consistência com a API real.
7. **Não criar useRegisterForm** — o formulário é simples; estado local com useState é suficiente. Extrair hook só se começar a duplicar lógica (YAGNI).
