# Task 06 — Autenticação: Domínio Auth (Entity, Use Cases, Presentation Layer)

## ✅ Status: IMPLEMENTADO

**Data de conclusão:** 2026-05-22

### Artefatos entregues

| # | Artefato | Arquivo | Testes |
|---|----------|---------|--------|
| 1 | User (Entity) | `src/domains/auth/domain/entities/User.js` | 14 testes ✅ |
| 2 | Login (Use Case) | `src/domains/auth/application/usecases/Login.js` | 10 testes ✅ |
| 3 | Logout (Use Case) | `src/domains/auth/application/usecases/Logout.js` | 3 testes ✅ |
| 4 | LoginForm (Component) | `src/domains/auth/presentation/components/LoginForm.js` | 11 testes ✅ |
| 5 | LoginPage (Page) | `src/domains/auth/presentation/pages/LoginPage.js` | 5 testes ✅ |

**Total: 10 arquivos (5 implementação + 5 testes) — 69 testes passando (incluindo AuthMockRepository + AuthContext pré-existentes)**

### Decisões de implementação

- **User Entity**: Classe com `#private fields`, `Object.freeze`, validação de email via regex, `toJSON()`. Aceita campos extras sem erro (compatível com `AuthMockRepository` que retorna `role`).
- **Login Use Case**: Valida inputs antes de delegar ao repo. Transforma plain object → instância de `User` entity.
- **Logout Use Case**: Delegação simples ao repositório.
- **LoginForm**: Props-based (desacoplado do context). Validação client-side com limpeza de erros ao digitar. Styled-components para UI.
- **LoginPage**: Orquestra LoginForm + useAuth + useNavigate. Loading state local. Redirect se já autenticado.
- **Não foi criado `useAuth` separado** — reutilizou o existente em `src/shared/contexts/AuthContext.js`.
- **AuthContext não foi alterado** — loading gerenciado localmente na LoginPage.

---

## Contexto e Justificativa

O domínio `auth` já possui infraestrutura implementada (Task 04: `AuthMockRepository` + testes) e contexto compartilhado (`AuthContext` + `useAuth` em `src/shared/contexts/`). Esta task completa o domínio com a **entity User**, os **use cases Login/Logout** como camada de aplicação, e a **camada de apresentação** (componente LoginForm, page LoginPage).

### O que já existe (NÃO reimplementar)

| Artefato | Localização | Status |
|----------|-------------|--------|
| `AuthMockRepository` | `src/domains/auth/infrastructure/repositories/` | ✅ Implementado (Task 04) |
| `AuthContext` + `useAuth` | `src/shared/contexts/AuthContext.js` | ✅ Implementado (Task 05) |
| `PrivateRoute` | `src/shared/components/PrivateRoute.js` | ✅ Implementado (Task 05) |
| `test-utils.js` (renderWithProviders) | `src/shared/test-utils.js` | ✅ Implementado |

> ⚠️ **ATENÇÃO**: O `AuthContext` atual **não expõe `loading`**. A implementação do `LoginForm` deve lidar com loading state internamente (via prop) e a orchestration fica na Page. Se precisar estender o context, documente a mudança.

---

## Entregáveis

| # | Artefato | Tipo | Depende de |
|---|----------|------|------------|
| 1 | `User.test.js` + `User.js` | Entity | — |
| 2 | `Login.test.js` + `Login.js` | Use Case | User, AuthRepository interface |
| 3 | `Logout.test.js` + `Logout.js` | Use Case | AuthRepository interface |
| 4 | `LoginForm.test.js` + `LoginForm.js` | Component | — (props-based, sem context) |
| 5 | `LoginPage.test.js` + `LoginPage.js` | Page | LoginForm, useAuth |

**Total: 5 artefatos, 10 arquivos (5 de implementação + 5 de teste)**

---

## Estrutura de Diretórios

```
src/domains/auth/
├── domain/
│   └── entities/
│       ├── User.js
│       └── User.test.js
├── application/
│   └── usecases/
│       ├── Login.js
│       ├── Login.test.js
│       ├── Logout.js
│       └── Logout.test.js
├── infrastructure/
│   └── repositories/          ← JÁ EXISTE (Task 04)
│       ├── AuthMockRepository.js
│       └── AuthMockRepository.test.js
└── presentation/
    ├── components/
    │   ├── LoginForm.js
    │   └── LoginForm.test.js
    └── pages/
        ├── LoginPage.js
        └── LoginPage.test.js
```

> **Nota arquitetural**: O hook `useAuth` já vive em `src/shared/contexts/AuthContext.js` (co-localizado com o context). Não duplicar em `presentation/hooks/`. Isso mantém coerência com o padrão já estabelecido no projeto.

---

## Especificações Detalhadas

### 1. User (Entity)

**Responsabilidade**: Value object imutável que representa um usuário autenticado.

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `id` | `string` | Sim | Não pode ser vazio/null/undefined |
| `name` | `string` | Sim | Não pode ser vazio, trim aplicado |
| `email` | `string` | Sim | Formato email válido (regex básico: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) |

**Regras de implementação (seguir padrão de `Post` entity)**:
- Classe com campos privados (`#field`) + getters
- `Object.freeze(this)` no constructor
- Método `toJSON()` para serialização
- Lançar `Error` com mensagem descritiva e em português se validação falhar

**Casos de teste obrigatórios**:
```
describe('User', () => {
  describe('dado dados válidos', () => {
    ✓ deve criar User com id, name e email
    ✓ deve expor id, name, email via getters
    ✓ deve fazer trim no name
    ✓ toJSON() deve retornar objeto plain com todos os campos
    ✓ deve ser imutável (Object.freeze)
  });
  describe('dado dados inválidos', () => {
    ✓ deve lançar erro para id vazio/null/undefined
    ✓ deve lançar erro para name vazio/null/undefined
    ✓ deve lançar erro para email vazio/null/undefined
    ✓ deve lançar erro para email em formato inválido
  });
});
```

---

### 2. Login (Use Case)

**Responsabilidade**: Orquestra a autenticação delegando ao repositório e retornando dados estruturados.

| Aspecto | Detalhe |
|---------|---------|
| Constructor | `constructor(authRepository)` |
| Método | `async execute({ email, password })` |
| Output | `{ user: User, token: string }` |
| Validação | Email e password não podem ser vazios — lançar **antes** de chamar repo |
| Delegação | Chama `authRepository.login(email, password)` |
| Transformação | Resultado do repo → instância de `User` entity |

**Decisão de design**: O use case **valida inputs** antes de delegar ao repositório. Isso evita chamadas de rede desnecessárias e mantém o domínio como guardião das regras.

**Casos de teste obrigatórios**:
```
describe('Login UseCase', () => {
  describe('dado inputs válidos', () => {
    ✓ deve chamar authRepository.login com email e password
    ✓ deve retornar { user, token } quando credenciais válidas
    ✓ user retornado deve ser instância de User entity
  });
  describe('dado inputs inválidos', () => {
    ✓ deve lançar erro quando email é vazio/null/undefined
    ✓ deve lançar erro quando password é vazio/null/undefined
    ✓ não deve chamar repositório se validação falhar
  });
  describe('dado erro do repositório', () => {
    ✓ deve propagar erro quando credenciais inválidas
  });
});
```

---

### 3. Logout (Use Case)

**Responsabilidade**: Encerra a sessão do usuário.

| Aspecto | Detalhe |
|---------|---------|
| Constructor | `constructor(authRepository)` |
| Método | `async execute()` |
| Output | `void` |
| Delegação | Chama `authRepository.logout()` |

**Casos de teste obrigatórios**:
```
describe('Logout UseCase', () => {
  ✓ deve chamar authRepository.logout
  ✓ deve resolver sem valor de retorno
  ✓ deve propagar erro se repositório lançar exceção
});
```

---

### 4. LoginForm (Component)

**Responsabilidade**: Formulário de login reutilizável. Gerencia apenas estado local do form. **Não acessa context diretamente.**

| data-testid | Elemento | Notas |
|-------------|----------|-------|
| `login-form` | `<form>` | Wrapper do formulário |
| `login-input-email` | `<input type="email">` | Controlado (controlled input) |
| `login-input-password` | `<input type="password">` | Controlado |
| `login-btn-submit` | `<button type="submit">` | Texto: "Entrar" / "Entrando..." |
| `login-error-message` | `<div role="alert">` | Visível **apenas** quando há erro |

**Interface (Props)**:
```js
LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,  // (email, password) => Promise<void>
  error: PropTypes.string,               // Mensagem de erro externa (do server/context)
  loading: PropTypes.bool                // Estado de carregamento externo
};
```

> **Por quê props e não useAuth direto?** O componente é mais testável e reutilizável quando desacoplado do context. A page orquestra a conexão com o AuthContext.

**Comportamentos**:
- Validação client-side no submit: email vazio → "Email é obrigatório" / senha vazia → "Senha é obrigatória"
- Botão desabilitado (`disabled`) durante loading
- Texto do botão muda para "Entrando..." durante loading
- Campo password com `type="password"` (nunca revelar)
- `role="alert"` na mensagem de erro para acessibilidade (screen readers)
- `e.preventDefault()` no submit
- Limpar erro de validação quando usuário começa a digitar no campo correspondente

**Casos de teste obrigatórios**:
```
describe('LoginForm', () => {
  describe('dado renderização inicial', () => {
    ✓ deve renderizar form com campos email, password e botão "Entrar"
    ✓ botão deve estar habilitado
    ✓ não deve exibir mensagem de erro
  });
  describe('dado submit com dados válidos', () => {
    ✓ deve chamar onSubmit com email e password digitados
  });
  describe('dado submit com campos vazios', () => {
    ✓ deve exibir "Email é obrigatório" quando email vazio
    ✓ deve exibir "Senha é obrigatória" quando senha vazia
    ✓ não deve chamar onSubmit
  });
  describe('dado loading=true', () => {
    ✓ deve desabilitar botão
    ✓ deve exibir "Entrando..." no botão
  });
  describe('dado prop error', () => {
    ✓ deve exibir mensagem de erro com role="alert"
  });
  describe('dado erro de validação exibido', () => {
    ✓ deve limpar erro quando usuário digita no campo
  });
});
```

---

### 5. LoginPage (Page)

**Responsabilidade**: Orquestra LoginForm + useAuth + navegação. Gerencia loading state local.

| data-testid | Elemento | Notas |
|-------------|----------|-------|
| `login-page` | `<div>` | Container da página |
| `login-page-title` | `<h1>` | Texto: "Login" |

**Comportamentos**:
- Se já autenticado (`isAuthenticated === true`) → render `<Navigate to="/admin" replace />`
- Ao submeter form → setar loading=true, chamar `login(email, password)` do useAuth
- Se login falhar → setar error com `err.message`, setar loading=false
- Se login succeeder → navegar para `/admin` com `useNavigate()`

**Casos de teste obrigatórios**:
```
describe('LoginPage', () => {
  describe('dado usuário não autenticado', () => {
    ✓ deve renderizar título "Login" e LoginForm
  });
  describe('dado credenciais válidas no submit', () => {
    ✓ deve chamar login do context e navegar para /admin
    ✓ deve exibir loading state durante a requisição
  });
  describe('dado credenciais inválidas no submit', () => {
    ✓ deve exibir mensagem de erro no form
  });
  describe('dado usuário já autenticado', () => {
    ✓ deve redirecionar para /admin sem renderizar form
  });
});
```

---

## Padrão de Testes — Convenções Obrigatórias

```javascript
// Estrutura obrigatória
describe('[NomeDoArtefato]', () => {
  describe('dado [pré-condição/contexto]', () => {
    it('deve [comportamento esperado]', async () => {
      // Given - setup explícito (arrange)
      // When - ação (act)
      // Then - asserção (assert)
    });
  });
});
```

**Regras inegociáveis**:

| # | Regra | Motivo |
|---|-------|--------|
| 1 | `it()` apenas — sem `test()` | Consistência com BDD |
| 2 | `@testing-library/user-event` para interações | Mais realista que `fireEvent` |
| 3 | Sem `setTimeout` ou delays artificiais | Flaky tests |
| 4 | `findBy*` > `waitFor` genérico | Mais legível e específico |
| 5 | `renderWithProviders` para componentes com context | Reutilizar infra existente |
| 6 | Cada `it()` independente — sem estado entre testes | Isolamento |
| 7 | Mocks extraídos para factory functions | DRY + legibilidade |
| 8 | Assert negativo explícito (ex: `expect(repo.login).not.toHaveBeenCalled()`) | Garantir que algo NÃO acontece |

---

## Decisões Técnicas e Trade-offs

| Decisão | Justificativa | Alternativa descartada |
|---------|---------------|----------------------|
| `loading` gerenciado na Page (local state) | Evita re-renders globais; context minimalista | Estender AuthContext com loading global |
| Use case Login retorna `User` entity | App trabalha com objetos validados; fronteira domain ↔ infra clara | Retornar plain object do repo direto |
| LoginForm recebe props (não usa useAuth) | Testável sem providers; reutilizável; SRP | Hook direto no componente |
| Não criar `useAuth` separado em presentation | Já existe co-localizado; evita confusão de imports | Duplicar hook |
| Mensagem de erro genérica ("Credenciais inválidas") | Segurança — não revela se email existe | Mensagens específicas por campo |

---

## Critérios de Aceitação (QA Checklist)

### ✅ Funcional
- [x] Login com `professor@postech.com` / `postech123` autentica e redireciona para `/admin`
- [x] Login com credenciais inválidas exibe "Credenciais inválidas" no form
- [x] Campos vazios bloqueiam submit e exibem validação inline
- [x] Sessão é restaurada ao recarregar página (localStorage via AuthMockRepository)
- [x] Usuário já autenticado acessando `/login` é redirecionado para `/admin`
- [x] Logout limpa estado e localStorage (via context existente)

### ✅ Qualidade de Código
- [x] Entity User segue padrão de Post (private fields `#`, freeze, toJSON, getters)
- [x] Use cases seguem padrão de CreatePost (constructor com repo, método `execute`)
- [x] Nenhum `console.log` em código de produção
- [x] Sem dependências circulares entre layers
- [x] Imports seguem direção: presentation → application → domain (nunca inverso)
- [x] Nenhum import de `infrastructure` na camada `domain`

### ✅ Qualidade de Testes
- [x] `npm test -- --coverage --watchAll=false` → cobertura ≥ 80% (resultado: **100%** em todos os artefatos auth)
- [x] Todos os testes usam `user-event` para interações (não `fireEvent`)
- [x] Nenhum teste com `setTimeout` ou delays artificiais
- [x] Cada `describe` testa um cenário/contexto isolado
- [x] Testes falham quando implementação é removida (não são false positives)
- [ ] Stryker mutation score ≥ 70% nos artefatos novos _(pendente execução manual)_

### ✅ Acessibilidade
- [x] `role="alert"` em mensagens de erro
- [x] Labels associados aos inputs (`htmlFor`/`id` ou `aria-label`)
- [x] Botão indica estado via `disabled` + texto alterado
- [x] Form navegável via teclado (Tab order natural)

### ✅ Segurança (mesmo sendo mock)
- [x] Password input com `type="password"` sempre
- [x] Token não exposto em DOM ou console
- [x] Mensagem de erro genérica (não revela se email existe no sistema)

---

## Ordem de Implementação (TDD rigoroso)

```
1. User.test.js        → User.js            (entity, zero dependências)
2. Login.test.js       → Login.js           (use case, depende apenas de User)
3. Logout.test.js      → Logout.js          (use case, independente)
4. LoginForm.test.js   → LoginForm.js       (componente puro via props, sem context)
5. LoginPage.test.js   → LoginPage.js       (integração: form + context + router)
```

**Cada step deve ter todos os testes passando (green) antes de avançar.**

---

## Red Flags — O que Rejeitar em Code Review

| Anti-pattern | Por quê | Correção |
|---|---|---|
| `useAuth()` dentro de `LoginForm` | Acoplamento; dificulta teste unitário | Receber via props |
| `localStorage` direto na Page/Component | Responsabilidade do repository | Usar via AuthContext → repo |
| `window.location.href = '/admin'` | Bypassa React Router; impossibilita teste | `useNavigate()` |
| `try/catch` silencioso no use case | Engole erros; dificulta debug | Propagar; tratar na page |
| Testar implementação (ex: verificar setState chamado) | Frágil; quebra em refactor | Testar comportamento visível |
| Mock de módulo inteiro (`jest.mock('./AuthContext')`) | Difícil variar entre testes | `renderWithProviders` com repo mockado |
| `data-testid` dinâmico (template literal) | Impossibilita seleção em e2e | Sempre literal estático |
| `async` sem `await` no use case | Promessa silenciosamente ignorada | Sempre `await` ou retornar promessa |
| Validação apenas no componente (sem use case) | Domain bypass possível | Validar em ambos (defense in depth) |

---

## Notas para o Desenvolvedor

1. **Rode os testes existentes antes de começar**: `npm test -- --watchAll=false`. Se algo quebra, corrija antes.
2. **O `AuthMockRepository` retorna `role: 'professor'`** — a entity `User` pode ignorar campos extras ou aceitar `role` como campo opcional para manter compatibilidade.
3. **O `renderWithProviders` já injeta `AuthProvider`** — nos testes de LoginPage, customize o `authRepository` mock para simular cenários (login success, login failure, user already logged in).
4. **React Router v7** — usar `useNavigate` e `<Navigate>` (não `useHistory` ou `Redirect`).
5. **Se a implementação exigir alterar `AuthContext`** (ex: adicionar loading), atualize também `AuthContext.test.js` e documente no PR.
6. **Compatibilidade**: O `User` entity deve aceitar o shape retornado por `AuthMockRepository.login()` — ou seja, `{ id, name, email, role }`.

