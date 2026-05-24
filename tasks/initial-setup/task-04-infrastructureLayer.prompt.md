# Task 04 — Camada de Infraestrutura: Repositories HTTP

## Objetivo

Implementar o `PostApiRepository` que conecta os Use Cases à API REST real via Axios, e o `AuthMockRepository` para autenticação simulada. Esta camada é o **adapter** entre o domínio da aplicação e o mundo externo (API HTTP e storage do browser), respeitando a fronteira definida pelas interfaces da Task 02.

---

## Entregáveis

- [x] `PostApiRepository.test.js` + `PostApiRepository.js`
- [x] `AuthMockRepository.test.js` + `AuthMockRepository.js`
- [x] `httpClient.js` com interceptors de request (token) e response (error normalization)
- [x] `httpClient.test.js` — testar interceptors isoladamente
- [x] Todos os testes passando com Axios totalmente mockado (zero chamadas HTTP reais)
- [x] Cobertura ≥ 80% **em statements, branches, functions e lines** nesta camada
- [x] Nenhum `console.log` residual — usar tratamento de erro explícito

---

## Localização

```
src/shared/infrastructure/http/
├── httpClient.js
├── httpClient.test.js          ← NOVO: testar interceptors

src/domains/posts/infrastructure/repositories/
├── PostApiRepository.js
└── PostApiRepository.test.js

src/domains/auth/infrastructure/repositories/
├── AuthMockRepository.js
└── AuthMockRepository.test.js
```

---

## Especificações Técnicas

### httpClient.js (Evolução)

O arquivo já existe com configuração básica de Axios. Deve ser evoluído:

```js
import axios from 'axios';

const httpClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000 // ← OBRIGATÓRIO: evitar request hanging
});

// Request Interceptor — injeta token se existir
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor — normaliza erros
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Não redirecionar aqui — responsabilidade da UI
    }
    return Promise.reject(error);
  }
);

export default httpClient;
```

**Notas críticas:**
- `timeout` obrigatório — sem ele, requests podem pendurar indefinidamente em produção.
- O interceptor de request resolve o acoplamento com auth sem que cada repository precise saber sobre tokens.
- O interceptor de 401 limpa state local mas **não redireciona** — Single Responsibility.

---

### PostApiRepository

Implementa a classe abstrata `PostRepository` (Task 02). **DEVE** herdar explicitamente para garantir o contrato.

| Método | Endpoint | HTTP Method | Params/Body | Retorno |
|--------|----------|-------------|-------------|---------|
| `findAll(page, limit, status)` | `/posts` | GET | `?page=&limit=&status=` | `{ data: Post[], pagination }` |
| `search(query, page, limit)` | `/posts/search` | GET | `?q=&page=&limit=` | `{ data: Post[], pagination }` |
| `findById(id)` | `/posts/:id` | GET | — | `Post` (single object) |
| `create(postData)` | `/posts` | POST | body JSON | `Post` (criado) |
| `update(id, postData)` | `/posts/:id` | PUT | body JSON | `Post` (atualizado) |
| `delete(id)` | `/posts/:id` | DELETE | — | `void` |

**Contrato da API (response envelope):**
```json
{
  "success": true,
  "data": { ... },
  "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

**Contrato de erro da API:**
```json
{
  "success": false,
  "error": { "message": "Recurso não encontrado", "code": "NOT_FOUND" }
}
```

**Regras de implementação:**

1. **Herança explícita:** `class PostApiRepository extends PostRepository`
2. **Extração de dados:** sucesso → `response.data.data`; paginação → `response.data.pagination`
3. **Tratamento de erro robusto (3 camadas):**
   - Se `error.response?.data?.error?.message` existe → usar mensagem da API
   - Se `error.response` existe mas sem mensagem → fallback: `"Erro ao comunicar com a API"`
   - Se `error.request` existe (network error) → `"Erro de conexão. Verifique sua rede."`
   - Caso genérico → `"Erro inesperado"`
4. **Não instanciar entidade Post no repositório** — retornar dados "crus" (plain objects). O mapeamento para entidades de domínio é responsabilidade do Use Case ou de um Mapper dedicado, se necessário no futuro.
5. **Parâmetros opcionais:** `status` em `findAll` não deve ser enviado se for `undefined`/`null` (evitar `?status=undefined` na URL).
6. **Valores default:** `page = 1`, `limit = 10` para todos os métodos paginados.

**Exemplo de implementação esperada (findAll):**
```js
async findAll(page = 1, limit = 10, status) {
  try {
    const params = { page, limit };
    if (status) params.status = status;

    const response = await httpClient.get('/posts', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination
    };
  } catch (error) {
    throw new Error(this._extractErrorMessage(error));
  }
}
```

**Método auxiliar privado para extração de erro:**
```js
_extractErrorMessage(error) {
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error.response) {
    return 'Erro ao comunicar com a API';
  }
  if (error.request) {
    return 'Erro de conexão. Verifique sua rede.';
  }
  return 'Erro inesperado';
}
```

---

### AuthMockRepository

Simula autenticação para desenvolvimento e testes sem backend de auth.

| Método | Comportamento | Retorno |
|--------|---------------|---------|
| `login(email, password)` | Valida contra credenciais fixas | `{ user: { id, name, email, role }, token }` |
| `logout()` | Remove `auth_token` e `auth_user` do localStorage | `void` |
| `getCurrentUser()` | Lê `auth_user` do localStorage | `User object \| null` |
| `isAuthenticated()` | Verifica se token existe no localStorage | `boolean` |

**Credenciais mock:**
| Campo | Valor |
|-------|-------|
| Email | `professor@postech.com` |
| Senha | `postech123` |

**User mock retornado:**
```json
{
  "id": "usr_mock_001",
  "name": "Professor FIAP",
  "email": "professor@postech.com",
  "role": "professor"
}
```

**Token mock:** `"mock_jwt_token_postech_2024"` (string fixa para facilitar testes)

**Regras:**
1. `login` com credenciais inválidas deve lançar `Error('Credenciais inválidas')`.
2. `login` com email válido mas senha errada deve lançar `Error('Credenciais inválidas')` — **não diferençar** email inexistente de senha incorreta (segurança básica).
3. `login` com sucesso deve persistir em `localStorage` as chaves `auth_token` e `auth_user` (JSON stringified).
4. `logout` deve ser idempotente — chamar múltiplas vezes não deve lançar erro.
5. `getCurrentUser` retorna `null` se não há user no localStorage ou se o parse falhar (JSON inválido).
6. `isAuthenticated` retorna `true` se `auth_token` existe no localStorage.

---

## Padrão de Testes (BDD com Given-When-Then)

### PostApiRepository.test.js — Cenários obrigatórios:

```js
import httpClient from '../../../../shared/infrastructure/http/httpClient';
import PostApiRepository from './PostApiRepository';

jest.mock('../../../../shared/infrastructure/http/httpClient');

describe('PostApiRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new PostApiRepository();
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    describe('dado uma chamada com sucesso', () => {
      it('deve retornar lista de posts e paginação', async () => { /* ... */ });
      it('deve enviar parâmetros corretos incluindo status', async () => { /* ... */ });
      it('não deve enviar status se for undefined', async () => { /* ... */ });
      it('deve usar valores default para page e limit', async () => { /* ... */ });
    });

    describe('dado um erro da API com mensagem', () => {
      it('deve lançar erro com a mensagem da API', async () => { /* ... */ });
    });

    describe('dado um erro de rede (sem response)', () => {
      it('deve lançar erro de conexão', async () => { /* ... */ });
    });

    describe('dado um erro genérico (sem response nem request)', () => {
      it('deve lançar erro inesperado', async () => { /* ... */ });
    });
  });

  describe('search', () => {
    describe('dado uma busca com sucesso', () => {
      it('deve enviar query como parâmetro q', async () => { /* ... */ });
      it('deve retornar dados e paginação', async () => { /* ... */ });
    });

    describe('dado uma busca com erro', () => {
      it('deve propagar erro da API', async () => { /* ... */ });
    });
  });

  describe('findById', () => {
    describe('dado um id existente', () => {
      it('deve retornar o post correspondente', async () => { /* ... */ });
    });

    describe('dado um id inexistente (404)', () => {
      it('deve lançar erro com mensagem da API', async () => { /* ... */ });
    });
  });

  describe('create', () => {
    describe('dado dados válidos', () => {
      it('deve enviar POST com body correto', async () => { /* ... */ });
      it('deve retornar o post criado', async () => { /* ... */ });
    });

    describe('dado erro de validação da API (400)', () => {
      it('deve lançar erro com mensagem específica', async () => { /* ... */ });
    });
  });

  describe('update', () => {
    describe('dado dados válidos', () => {
      it('deve enviar PUT com id na URL e body', async () => { /* ... */ });
      it('deve retornar o post atualizado', async () => { /* ... */ });
    });

    describe('dado post inexistente (404)', () => {
      it('deve lançar erro', async () => { /* ... */ });
    });
  });

  describe('delete', () => {
    describe('dado um id existente', () => {
      it('deve enviar DELETE e resolver sem retorno', async () => { /* ... */ });
    });

    describe('dado um id inexistente', () => {
      it('deve lançar erro', async () => { /* ... */ });
    });
  });
});
```

### AuthMockRepository.test.js — Cenários obrigatórios:

```js
describe('AuthMockRepository', () => {
  let repository;
  let localStorageMock;

  beforeEach(() => {
    repository = new AuthMockRepository();
    localStorageMock = (() => {
      let store = {};
      return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => { store[key] = value; }),
        removeItem: jest.fn((key) => { delete store[key]; }),
        clear: jest.fn(() => { store = {}; })
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  describe('login', () => {
    describe('dado credenciais válidas', () => {
      it('deve retornar user e token', async () => { /* ... */ });
      it('deve persistir token no localStorage', async () => { /* ... */ });
      it('deve persistir user no localStorage como JSON', async () => { /* ... */ });
    });

    describe('dado email incorreto', () => {
      it('deve lançar erro de credenciais inválidas', async () => { /* ... */ });
    });

    describe('dado senha incorreta', () => {
      it('deve lançar erro de credenciais inválidas', async () => { /* ... */ });
      it('não deve revelar se o email existe (mesma mensagem)', async () => { /* ... */ });
    });

    describe('dado campos vazios', () => {
      it('deve lançar erro de credenciais inválidas', async () => { /* ... */ });
    });
  });

  describe('logout', () => {
    it('deve remover token do localStorage', async () => { /* ... */ });
    it('deve remover user do localStorage', async () => { /* ... */ });
    it('deve ser idempotente (não lançar erro se já deslogado)', async () => { /* ... */ });
  });

  describe('getCurrentUser', () => {
    describe('dado usuario logado', () => {
      it('deve retornar o objeto user parseado', () => { /* ... */ });
    });

    describe('dado usuario não logado', () => {
      it('deve retornar null', () => { /* ... */ });
    });

    describe('dado JSON corrompido no localStorage', () => {
      it('deve retornar null sem lançar erro', () => { /* ... */ });
    });
  });

  describe('isAuthenticated', () => {
    it('deve retornar true quando token existe', () => { /* ... */ });
    it('deve retornar false quando token não existe', () => { /* ... */ });
  });
});
```

---

## Revisão Crítica — O que NÃO fazer (Anti-patterns)

| Anti-pattern | Por quê é problema | Solução |
|---|---|---|
| Instanciar entidade `Post` dentro do repository | Acopla infra ao domínio; se a API retorna campo extra, quebra | Retornar plain objects; mapeamento é responsabilidade de camada superior |
| Catch genérico sem re-throw | Engole erros silenciosamente | Sempre `throw new Error(...)` no catch |
| Hardcode de URL no repository | Dificulta testes e deploy | Usar `httpClient` centralizado com baseURL configurável via env |
| `localStorage.getItem` sem try-catch no JSON.parse | JSON.parse de string inválida crasha a app | Wrap em try-catch, retornar null no fallback |
| Testar implementação interna (verificar variáveis privadas) | Testes frágeis que quebram em refactoring | Testar comportamento/output, não internals |
| Mock global de localStorage sem cleanup | Vaza estado entre testes | `beforeEach` com store limpo |
| Mensagem de erro diferente para email vs senha inválida | Enumeração de usuarios = falha de segurança | Mesma mensagem genérica para ambos |

---

## Decisões Arquiteturais (ADR Resumidos)

### ADR-04.1: Repository retorna plain objects, não entidades

**Contexto:** A API retorna JSON. Queremos desacoplar a camada de infra do domínio.  
**Decisão:** `PostApiRepository` retorna objetos planos `{ id, titulo, conteudo, autor, status, createdAt, updatedAt }`.  
**Consequência:** Os Use Cases são responsáveis por instanciar entidades se necessário. Simplifica testes do repository.

### ADR-04.2: AuthMockRepository como adapter temporário

**Contexto:** Não há backend de auth implementado. Precisamos simular autenticação para o fluxo de professor.  
**Decisão:** Implementar mock com credenciais fixas em um adapter que respeita a mesma interface que um `AuthApiRepository` futuro terá.  
**Consequência:** Quando o backend de auth estiver pronto, basta trocar a implementação sem alterar nenhum Use Case (Open/Closed Principle).

### ADR-04.3: Erro normalizado em português

**Contexto:** A app é em português (pt-BR), alinhado com a API.  
**Decisão:** Mensagens de erro devem ser em português e user-friendly.  
**Consequência:** A UI pode exibir diretamente a mensagem do erro sem tradução adicional.

---

## Critérios de Aceitação (Definition of Done)

- [x] `PostApiRepository` herda de `PostRepository` e implementa todos os 6 métodos
- [x] Todos os cenários de teste listados acima estão implementados e passando
- [x] Axios é mockado — `jest.mock(...)` no módulo do httpClient
- [x] Tratamento de erro cobre 3 cenários: erro da API, erro de rede, erro genérico
- [x] `AuthMockRepository` funciona com credenciais fixas e persiste em localStorage
- [x] `getCurrentUser` é resiliente a JSON inválido no localStorage
- [x] `logout` é idempotente
- [x] Não há `console.log` ou `console.error` no código de produção
- [x] httpClient tem `timeout` configurado (≥ 10s, ≤ 30s)
- [x] httpClient tem interceptor de request para injetar token Authorization Bearer
- [x] httpClient tem interceptor de response para tratar 401 (limpar localStorage)
- [x] Cobertura ≥ 80% em todas as métricas (statements, branches, functions, lines)
- [x] Código segue nomenclatura existente (português nos campos de domínio: titulo, conteudo, autor)
- [x] Nenhum teste depende de ordem de execução (isolamento total via beforeEach)
- [x] Imports relativos consistentes com a estrutura de pastas do projeto

---

## Dependências

| De | Para | Status |
|----|------|--------|
| Task 02 | `PostRepository` (interface/classe abstrata) | ✅ Concluída |
| Task 01 | `httpClient.js` (configuração base) | ✅ Concluída |
| Task 04 → | Task 06 (AuthDomain) | ⚠️ AuthMockRepository será consumido |
| Task 04 → | Task 07+ (Pages) | ⚠️ Repositories serão injetados nos Use Cases |

---

## Estimativa

| Item | Tempo estimado |
|------|----------------|
| httpClient interceptors + testes | 30 min |
| PostApiRepository + testes (6 métodos × cenários) | 1h30 |
| AuthMockRepository + testes (4 métodos × cenários) | 1h |
| Revisão, cobertura e cleanup | 30 min |
| **Total** | **~3h30** |

---

## Resultado da Implementação

**Status:** ✅ Concluída  
**Data:** 2026-05-22

### Arquivos criados/modificados:

| Arquivo | Ação | Testes |
|---------|------|--------|
| `src/shared/infrastructure/http/httpClient.js` | Evoluído (timeout + interceptors) | 7 testes |
| `src/shared/infrastructure/http/httpClient.test.js` | Criado | ✅ |
| `src/domains/posts/infrastructure/repositories/PostApiRepository.js` | Criado | 22 testes |
| `src/domains/posts/infrastructure/repositories/PostApiRepository.test.js` | Criado | ✅ |
| `src/domains/auth/infrastructure/repositories/AuthMockRepository.js` | Criado | 16 testes |
| `src/domains/auth/infrastructure/repositories/AuthMockRepository.test.js` | Criado | ✅ |

### Cobertura alcançada:

| Arquivo | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| `AuthMockRepository.js` | 100% | 100% | 100% | 100% |
| `PostApiRepository.js` | 100% | 100% | 100% | 100% |
| `httpClient.js` | 100% | 83.33% | 100% | 100% |
| **Global (camada)** | **100%** | **95.83%** | **100%** | **100%** |

### Resultado dos testes:

- **Total project:** 17 suites, 160 testes, 0 falhas
- **Task 04:** 3 suites, 45 testes, 0 falhas

