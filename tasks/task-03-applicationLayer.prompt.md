# Task 03 — Camada de Aplicação: Use Cases (Posts)

## Objetivo

Implementar os Use Cases do domínio Posts seguindo TDD/BDD, com injeção de dependência do repository (mockado nos testes).

## Entregáveis

- [ ] `ListPosts.test.js` + `ListPosts.js`
- [ ] `SearchPosts.test.js` + `SearchPosts.js`
- [ ] `GetPost.test.js` + `GetPost.js`
- [ ] `CreatePost.test.js` + `CreatePost.js`
- [ ] `UpdatePost.test.js` + `UpdatePost.js`
- [ ] `DeletePost.test.js` + `DeletePost.js`
- [ ] `CreatePostDTO.js` + `UpdatePostDTO.js`
- [ ] Todos os testes passando
- [ ] Cobertura ≥ 80% nesta camada

## Localização

```
src/domains/posts/application/
├── usecases/
│   ├── ListPosts.js
│   ├── ListPosts.test.js
│   ├── SearchPosts.js
│   ├── SearchPosts.test.js
│   ├── GetPost.js
│   ├── GetPost.test.js
│   ├── CreatePost.js
│   ├── CreatePost.test.js
│   ├── UpdatePost.js
│   ├── UpdatePost.test.js
│   ├── DeletePost.js
│   └── DeletePost.test.js
└── dto/
    ├── CreatePostDTO.js
    └── UpdatePostDTO.js
```

## Especificações dos Use Cases

### ListPosts

| Aspecto | Detalhe |
|---------|---------|
| Input | `{ page, limit, status }` |
| Output | `{ data: Post[], pagination }` |
| Regra | Chama `repository.findAll(page, limit, status)` |

### SearchPosts

| Aspecto | Detalhe |
|---------|---------|
| Input | `{ query, page, limit }` |
| Output | `{ data: Post[], pagination }` |
| Regra | `query` obrigatória, mín 1 char. Chama `repository.search(query, page, limit)` |

### GetPost

| Aspecto | Detalhe |
|---------|---------|
| Input | `{ id }` |
| Output | `Post` |
| Regra | `id` obrigatório. Chama `repository.findById(id)` |

### CreatePost

| Aspecto | Detalhe |
|---------|---------|
| Input | `CreatePostDTO { titulo, conteudo, autor, status? }` |
| Output | `Post` criado |
| Regra | Valida via Value Objects ANTES de chamar `repository.create()`. Se validação falhar, NÃO chama repository. |

### UpdatePost

| Aspecto | Detalhe |
|---------|---------|
| Input | `{ id, UpdatePostDTO { titulo?, conteudo?, autor?, status? } }` |
| Output | `Post` atualizado |
| Regra | `id` obrigatório. Valida campos fornecidos via Value Objects. Chama `repository.update(id, data)` |

### DeletePost

| Aspecto | Detalhe |
|---------|---------|
| Input | `{ id }` |
| Output | `void` |
| Regra | `id` obrigatório. Chama `repository.delete(id)` |

## Padrão dos Use Cases (Clean Code)

```js
class CreatePost {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(dto) {
    // Validação via Value Objects
    const titulo = new PostTitle(dto.titulo);
    const conteudo = new PostContent(dto.conteudo);
    const status = new PostStatus(dto.status);
    
    // Persistência
    return this.repository.create({
      titulo: titulo.getValue(),
      conteudo: conteudo.getValue(),
      autor: dto.autor,
      status: status.getValue()
    });
  }
}
```

## Padrão de Testes (BDD)

```js
describe('CreatePost', () => {
  let createPost;
  let mockRepository;

  beforeEach(() => {
    mockRepository = { create: jest.fn() };
    createPost = new CreatePost(mockRepository);
  });

  describe('dado dados válidos de um novo post', () => {
    it('deve criar o post e retornar os dados persistidos', async () => { /* ... */ });
  });

  describe('dado título inválido (menos de 3 caracteres)', () => {
    it('deve lançar erro de validação sem chamar o repositório', async () => { /* ... */ });
  });

  describe('dado conteúdo inválido (menos de 10 caracteres)', () => {
    it('deve lançar erro de validação sem chamar o repositório', async () => { /* ... */ });
  });

  describe('dado status inválido', () => {
    it('deve lançar erro de validação sem chamar o repositório', async () => { /* ... */ });
  });
});
```

## Critérios de Aceitação

- Testes escritos ANTES da implementação (TDD)
- Padrão BDD (Given-When-Then) em todos os testes
- Use Cases recebem repository por injeção de dependência (construtor)
- Use Cases possuem método único `execute()`
- Validações via Value Objects (reutilizando Task 02)
- Repository é mockado nos testes (sem chamadas HTTP reais)
- Cobertura ≥ 80%
