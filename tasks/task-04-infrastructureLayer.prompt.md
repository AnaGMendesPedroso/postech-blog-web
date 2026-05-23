# Task 04 — Camada de Infraestrutura: Repositories HTTP

## Objetivo

Implementar o `PostApiRepository` que conecta os Use Cases à API REST real via Axios, e o `AuthMockRepository` para autenticação simulada.

## Entregáveis

- [ ] `PostApiRepository.test.js` + `PostApiRepository.js`
- [ ] `AuthMockRepository.test.js` + `AuthMockRepository.js`
- [ ] `httpClient.js` (se não criado na Task 01)
- [ ] Todos os testes passando (Axios mockado)
- [ ] Cobertura ≥ 80% nesta camada

## Localização

```
src/shared/infrastructure/http/
└── httpClient.js

src/domains/posts/infrastructure/repositories/
├── PostApiRepository.js
└── PostApiRepository.test.js

src/domains/auth/infrastructure/repositories/
├── AuthMockRepository.js
└── AuthMockRepository.test.js
```

## Especificações

### PostApiRepository

Implementa a interface `PostRepository` (Task 02) usando `httpClient` (Axios).

| Método | Endpoint | Mapeamento |
|--------|----------|------------|
| `findAll(page, limit, status)` | GET `/posts?page=&limit=&status=` | Retorna `{ data, pagination }` |
| `search(query, page, limit)` | GET `/posts/search?q=&page=&limit=` | Retorna `{ data, pagination }` |
| `findById(id)` | GET `/posts/:id` | Retorna `data` (Post) |
| `create(postData)` | POST `/posts` | Envia body, retorna `data` (Post criado) |
| `update(id, postData)` | PUT `/posts/:id` | Envia body, retorna `data` (Post atualizado) |
| `delete(id)` | DELETE `/posts/:id` | Retorna `void` (204) |

**Tratamento de resposta:**
- Sucesso: extrair `response.data.data` (a API retorna `{ success, data }`)
- Paginação: extrair `response.data.pagination`
- Erro: capturar e lançar erro com `response.data.error.message`

### AuthMockRepository

| Método | Comportamento |
|--------|---------------|
| `login(email, password)` | Valida contra credenciais fixas. Retorna `{ user, token }` ou lança erro |
| `logout()` | Limpa token do localStorage |
| `getCurrentUser()` | Retorna user do localStorage ou null |

**Credenciais mock:**
- Email: `professor@postech.com`
- Senha: `postech123`

## Padrão de Testes (BDD)

```js
import httpClient from '../../../shared/infrastructure/http/httpClient';
jest.mock('../../../shared/infrastructure/http/httpClient');

describe('PostApiRepository', () => {
  describe('dado uma chamada findAll com sucesso', () => {
    it('deve retornar a lista de posts e paginação', async () => {
      // Given
      httpClient.get.mockResolvedValue({
        data: { success: true, data: [mockPost], pagination: { page: 1, totalPages: 2 } }
      });
      // When
      const result = await repository.findAll(1, 10, 'published');
      // Then
      expect(httpClient.get).toHaveBeenCalledWith('/posts', { params: { page: 1, limit: 10, status: 'published' } });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('dado uma chamada findAll com erro da API', () => {
    it('deve lançar erro com mensagem da API', async () => {
      // Given
      httpClient.get.mockRejectedValue({
        response: { data: { success: false, error: { message: 'Erro interno' } } }
      });
      // When & Then
      await expect(repository.findAll(1, 10)).rejects.toThrow('Erro interno');
    });
  });
});
```

## Critérios de Aceitação

- Testes escritos ANTES da implementação (TDD)
- Padrão BDD (Given-When-Then) nos testes
- Axios é mockado (sem chamadas HTTP reais nos testes)
- `PostApiRepository` implementa todos os métodos da interface `PostRepository`
- Tratamento de erros da API com mensagens descritivas
- `AuthMockRepository` funciona com credenciais fixas
- Cobertura ≥ 80%
