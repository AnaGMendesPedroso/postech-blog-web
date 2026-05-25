# Integração com a API

Descrição dos endpoints consumidos pelo front-end e os contratos esperados.

## Endpoints principais

- POST /auth/login — autenticação (retorna token JWT)
- GET /posts — lista paginada de posts (filtro por status)
- GET /posts/:id — obtém post por id
- POST /posts — cria post (docente)
- PUT /posts/:id — atualiza post
- DELETE /posts/:id — remove post

## Schemas

### Post

```json
{
  "id": "string",
  "titulo": "string",
  "conteudo": "string",
  "autor": "string",
  "status": "draft | published",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

### Resposta paginada

```json
{
  "success": true,
  "data": [/* posts */],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

## Observações

- O `httpClient` centraliza a injeção do token via `localStorage` e trata 401 para forçar re-login.
- Para E2E, espera-se que a API esteja disponível em `REACT_APP_API_URL` (default: `http://localhost:3000`).
