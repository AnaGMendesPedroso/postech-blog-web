# Task 03 — Camada de Aplicação: Use Cases (Posts)

## Objetivo

Implementar os Use Cases do domínio Posts seguindo TDD/BDD, com injeção de dependência do repository (mockado nos testes). Esta camada orquestra a lógica de aplicação, delegando validações aos Value Objects (Task 02) e persistência ao Repository.

---

## Contexto Técnico

### Dependências da Task 02 (já implementadas)

| Artefato | Responsabilidade | Acessor |
|----------|-----------------|---------|
| `PostTitle` | Valida título (3–200 chars, obrigatório) | `.value` |
| `PostContent` | Valida conteúdo (≥10 chars, obrigatório) | `.value` |
| `PostStatus` | Valida status (`draft` \| `published`, default: `draft`) | `.value` |
| `PostRepository` | Interface/contrato do repositório | métodos async |

### Contrato do PostRepository (interface)

```js
class PostRepository {
  async findAll(page, limit, status) {}  // → { data: Post[], pagination }
  async search(query, page, limit) {}    // → { data: Post[], pagination }
  async findById(id) {}                  // → Post | null
  async create(post) {}                  // → Post
  async update(id, post) {}             // → Post
  async delete(id) {}                   // → void
}
```

---

## Entregáveis

- [x] `ListPosts.test.js` + `ListPosts.js`
- [x] `SearchPosts.test.js` + `SearchPosts.js`
- [x] `GetPost.test.js` + `GetPost.js`
- [x] `CreatePost.test.js` + `CreatePost.js`
- [x] `UpdatePost.test.js` + `UpdatePost.js`
- [x] `DeletePost.test.js` + `DeletePost.js`
- [x] `CreatePostDTO.js` + `CreatePostDTO.test.js`
- [x] `UpdatePostDTO.js` + `UpdatePostDTO.test.js`
- [x] Todos os testes passando (`npm test -- --watchAll=false`) — 56 testes ✅
- [x] Cobertura ≥ 80% nesta camada — 100% Stmts, 93.22% Branch, 100% Funcs, 100% Lines
- [x] Zero warnings de lint

---

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
    ├── CreatePostDTO.test.js
    ├── UpdatePostDTO.js
    └── UpdatePostDTO.test.js
```

---

## Arquitetura dos Use Cases

### Padrão Estrutural (obrigatório)

```js
class NomeDoUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(input) {
    // 1. Validação de entrada (via Value Objects ou regras simples)
    // 2. Chamada ao repository
    // 3. Retorno do resultado
  }
}

export default NomeDoUseCase;
```

### Princípios

- **Single Responsibility**: cada Use Case realiza exatamente UMA operação
- **Dependency Inversion**: depende da interface `PostRepository`, nunca da implementação
- **Fail Fast**: validações ANTES de chamar o repository
- **Sem side effects ocultos**: sem estado interno entre chamadas de `execute()`

---

## Especificações Detalhadas dos Use Cases

### 1. ListPosts

| Aspecto | Detalhe |
|---------|---------|
| **Input** | `{ page?, limit?, status? }` |
| **Output** | `{ data: Post[], pagination: { page, limit, total, totalPages } }` |
| **Defaults** | `page = 1`, `limit = 10`, `status = undefined` (lista todos) |
| **Validações** | `page` ≥ 1, `limit` ≥ 1 e ≤ 100. Se inválido, usar defaults. |
| **Regra** | Chama `repository.findAll(page, limit, status)` e retorna resultado |

#### Cenários de Teste (QA)

| # | Cenário | Given | When | Then |
|---|---------|-------|------|------|
| 1 | Listagem com sucesso | Repository retorna posts | `execute({})` | Retorna `{ data, pagination }` |
| 2 | Listagem com paginação | page=2, limit=5 | `execute({ page: 2, limit: 5 })` | Chama repository com page=2, limit=5 |
| 3 | Filtro por status | status='published' | `execute({ status: 'published' })` | Chama repository com status='published' |
| 4 | Lista vazia | Repository retorna `[]` | `execute({})` | Retorna `{ data: [], pagination }` |
| 5 | Valores default | Nenhum parâmetro | `execute()` ou `execute({})` | Usa page=1, limit=10 |
| 6 | Page negativo | page=-1 | `execute({ page: -1 })` | Usa page=1 (default) |
| 7 | Limit acima do máximo | limit=500 | `execute({ limit: 500 })` | Usa limit=100 (máximo) |
| 8 | Erro no repository | Repository lança exceção | `execute({})` | Propaga o erro (não silencia) |

---

### 2. SearchPosts

| Aspecto | Detalhe |
|---------|---------|
| **Input** | `{ query, page?, limit? }` |
| **Output** | `{ data: Post[], pagination }` |
| **Defaults** | `page = 1`, `limit = 10` |
| **Validações** | `query` obrigatória, tipo string, mín 1 char (após trim) |
| **Regra** | Chama `repository.search(query.trim(), page, limit)` |

#### Cenários de Teste (QA)

| # | Cenário | Given | When | Then |
|---|---------|-------|------|------|
| 1 | Busca com resultados | query='react' | `execute({ query: 'react' })` | Retorna posts encontrados |
| 2 | Busca sem resultados | query='xyz123' | `execute({ query: 'xyz123' })` | Retorna `{ data: [], pagination }` |
| 3 | Query com espaços extras | query='  react  ' | `execute({ query: '  react  ' })` | Chama repository com 'react' (trimmed) |
| 4 | Query vazia | query='' | `execute({ query: '' })` | Lança erro: "A busca é obrigatória" |
| 5 | Query undefined | sem query | `execute({})` | Lança erro: "A busca é obrigatória" |
| 6 | Query apenas espaços | query='   ' | `execute({ query: '   ' })` | Lança erro: "A busca é obrigatória" |
| 7 | Busca com paginação | query='post', page=2 | `execute({ query: 'post', page: 2 })` | Chama repository com page=2 |
| 8 | Erro no repository | Repository lança exceção | `execute({ query: 'test' })` | Propaga o erro |

---

### 3. GetPost

| Aspecto | Detalhe |
|---------|---------|
| **Input** | `{ id }` |
| **Output** | `Post` (objeto completo) |
| **Validações** | `id` obrigatório, não pode ser vazio |
| **Regra** | Chama `repository.findById(id)`. Se retornar `null`, lança erro "Post não encontrado" |

#### Cenários de Teste (QA)

| # | Cenário | Given | When | Then |
|---|---------|-------|------|------|
| 1 | Post encontrado | Repository retorna post | `execute({ id: '1' })` | Retorna o post completo |
| 2 | Post não encontrado | Repository retorna null | `execute({ id: '999' })` | Lança erro "Post não encontrado" |
| 3 | ID vazio | id='' | `execute({ id: '' })` | Lança erro "ID é obrigatório" |
| 4 | ID undefined | sem id | `execute({})` | Lança erro "ID é obrigatório" |
| 5 | Erro no repository | Repository lança exceção | `execute({ id: '1' })` | Propaga o erro |

---

### 4. CreatePost

| Aspecto | Detalhe |
|---------|---------|
| **Input** | `CreatePostDTO { titulo, conteudo, autor, status? }` |
| **Output** | `Post` criado (com id, createdAt, updatedAt do backend) |
| **Validações** | Via Value Objects: `PostTitle(titulo)`, `PostContent(conteudo)`, `PostStatus(status)`. `autor` obrigatório e não vazio. |
| **Regra** | Valida ANTES de chamar repository. Se validação falhar, NÃO chama `repository.create()`. |

#### Cenários de Teste (QA)

| # | Cenário | Given | When | Then |
|---|---------|-------|------|------|
| 1 | Criação com sucesso (todos campos) | DTO válido com status | `execute(dto)` | Post criado retornado, repository.create chamado |
| 2 | Criação com status default | DTO sem status | `execute(dto)` | Usa status='draft' |
| 3 | Título inválido (< 3 chars) | titulo='ab' | `execute(dto)` | Lança erro de validação, repository.create NÃO chamado |
| 4 | Título vazio | titulo='' | `execute(dto)` | Lança erro de validação, repository.create NÃO chamado |
| 5 | Conteúdo inválido (< 10 chars) | conteudo='curto' | `execute(dto)` | Lança erro de validação, repository.create NÃO chamado |
| 6 | Conteúdo vazio | conteudo='' | `execute(dto)` | Lança erro de validação, repository.create NÃO chamado |
| 7 | Status inválido | status='archived' | `execute(dto)` | Lança erro de validação, repository.create NÃO chamado |
| 8 | Autor vazio | autor='' | `execute(dto)` | Lança erro "Autor é obrigatório", repository.create NÃO chamado |
| 9 | Autor undefined | sem autor | `execute(dto)` | Lança erro "Autor é obrigatório", repository.create NÃO chamado |
| 10 | Erro no repository | DTO válido, repository falha | `execute(dto)` | Propaga o erro do repository |
| 11 | Verifica dados passados ao repository | DTO válido | `execute(dto)` | Repository recebe `{ titulo, conteudo, autor, status }` com valores corretos |

---

### 5. UpdatePost

| Aspecto | Detalhe |
|---------|---------|
| **Input** | `{ id, data: UpdatePostDTO { titulo?, conteudo?, autor?, status? } }` |
| **Output** | `Post` atualizado |
| **Validações** | `id` obrigatório. Valida APENAS campos fornecidos via Value Objects. Pelo menos 1 campo deve ser fornecido. |
| **Regra** | Valida campos presentes. Chama `repository.update(id, validatedData)` apenas com campos fornecidos. |

#### Cenários de Teste (QA)

| # | Cenário | Given | When | Then |
|---|---------|-------|------|------|
| 1 | Atualização completa | Todos campos válidos | `execute({ id: '1', data: {...} })` | Post atualizado retornado |
| 2 | Atualização parcial (só título) | Apenas titulo | `execute({ id: '1', data: { titulo: 'Novo' } })` | Repository chamado apenas com titulo |
| 3 | Atualização parcial (só conteúdo) | Apenas conteudo | `execute({ id: '1', data: { conteudo: '...' } })` | Repository chamado apenas com conteudo |
| 4 | Atualização parcial (só status) | Apenas status | `execute({ id: '1', data: { status: 'published' } })` | Repository chamado com status |
| 5 | ID vazio | id='' | `execute({ id: '', data: {...} })` | Lança erro "ID é obrigatório" |
| 6 | ID undefined | sem id | `execute({ data: {...} })` | Lança erro "ID é obrigatório" |
| 7 | Nenhum campo fornecido | data={} | `execute({ id: '1', data: {} })` | Lança erro "Pelo menos um campo deve ser fornecido" |
| 8 | Título inválido | titulo='ab' | `execute({ id: '1', data: { titulo: 'ab' } })` | Lança erro de validação, repository NÃO chamado |
| 9 | Conteúdo inválido | conteudo='curto' | `execute({ id: '1', data: { conteudo: 'curto' } })` | Lança erro de validação, repository NÃO chamado |
| 10 | Status inválido | status='invalid' | `execute({ id: '1', data: { status: 'invalid' } })` | Lança erro de validação, repository NÃO chamado |
| 11 | Erro no repository | Dados válidos, repository falha | `execute({ id: '1', data: {...} })` | Propaga o erro |

---

### 6. DeletePost

| Aspecto | Detalhe |
|---------|---------|
| **Input** | `{ id }` |
| **Output** | `void` (não retorna nada) |
| **Validações** | `id` obrigatório, não pode ser vazio |
| **Regra** | Chama `repository.delete(id)` |

#### Cenários de Teste (QA)

| # | Cenário | Given | When | Then |
|---|---------|-------|------|------|
| 1 | Exclusão com sucesso | id válido | `execute({ id: '1' })` | repository.delete chamado com '1', sem retorno |
| 2 | ID vazio | id='' | `execute({ id: '' })` | Lança erro "ID é obrigatório" |
| 3 | ID undefined | sem id | `execute({})` | Lança erro "ID é obrigatório" |
| 4 | Erro no repository | Repository lança exceção | `execute({ id: '1' })` | Propaga o erro |

---

## DTOs (Data Transfer Objects)

### CreatePostDTO

```js
class CreatePostDTO {
  constructor({ titulo, conteudo, autor, status = 'draft' }) {
    this.titulo = titulo;
    this.conteudo = conteudo;
    this.autor = autor;
    this.status = status;
  }
}
```

#### Cenários de Teste (QA)

| # | Cenário | Then |
|---|---------|------|
| 1 | Criação com todos os campos | Todos atributos preenchidos |
| 2 | Status default | `status` = 'draft' se não fornecido |
| 3 | Preserva valores recebidos | Não altera/valida (validação é no Use Case) |

### UpdatePostDTO

```js
class UpdatePostDTO {
  constructor({ titulo, conteudo, autor, status } = {}) {
    if (titulo !== undefined) this.titulo = titulo;
    if (conteudo !== undefined) this.conteudo = conteudo;
    if (autor !== undefined) this.autor = autor;
    if (status !== undefined) this.status = status;
  }

  hasChanges() {
    return Object.keys(this).length > 0;
  }
}
```

#### Cenários de Teste (QA)

| # | Cenário | Then |
|---|---------|------|
| 1 | Todos os campos | Todos atributos presentes |
| 2 | Apenas título | Somente `titulo` presente |
| 3 | Nenhum campo | `hasChanges()` retorna `false` |
| 4 | Campos undefined ignorados | Propriedade não é adicionada ao DTO |

---

## Padrão de Implementação (Referência)

### CreatePost (exemplo completo)

```js
import PostTitle from '../../domain/value-objects/PostTitle';
import PostContent from '../../domain/value-objects/PostContent';
import PostStatus from '../../domain/value-objects/PostStatus';

class CreatePost {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(dto) {
    // Validação de autor (não é Value Object)
    if (!dto.autor || dto.autor.trim().length === 0) {
      throw new Error('Autor é obrigatório');
    }

    // Validação via Value Objects (fail fast)
    const titulo = new PostTitle(dto.titulo);
    const conteudo = new PostContent(dto.conteudo);
    const status = new PostStatus(dto.status);

    // Persistência (só chega aqui se validação passou)
    return this.repository.create({
      titulo: titulo.value,
      conteudo: conteudo.value,
      autor: dto.autor.trim(),
      status: status.value
    });
  }
}

export default CreatePost;
```

---

## Padrão de Testes (BDD — Referência Completa)

```js
import CreatePost from './CreatePost';

describe('CreatePost Use Case', () => {
  let createPost;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn()
    };
    createPost = new CreatePost(mockRepository);
  });

  describe('dado dados válidos de um novo post', () => {
    const validDTO = {
      titulo: 'Título válido do post',
      conteudo: 'Conteúdo com mais de dez caracteres para validação',
      autor: 'Professor Silva',
      status: 'published'
    };

    it('deve criar o post e retornar os dados persistidos', async () => {
      // Given
      const expectedPost = { id: '1', ...validDTO, createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      mockRepository.create.mockResolvedValue(expectedPost);

      // When
      const result = await createPost.execute(validDTO);

      // Then
      expect(result).toEqual(expectedPost);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith({
        titulo: validDTO.titulo,
        conteudo: validDTO.conteudo,
        autor: validDTO.autor,
        status: validDTO.status
      });
    });
  });

  describe('dado título inválido (menos de 3 caracteres)', () => {
    it('deve lançar erro de validação sem chamar o repositório', async () => {
      // Given
      const invalidDTO = { titulo: 'ab', conteudo: 'Conteúdo válido aqui', autor: 'Professor' };

      // When & Then
      await expect(createPost.execute(invalidDTO)).rejects.toThrow();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('dado conteúdo inválido (menos de 10 caracteres)', () => {
    it('deve lançar erro de validação sem chamar o repositório', async () => {
      // Given
      const invalidDTO = { titulo: 'Título OK', conteudo: 'curto', autor: 'Professor' };

      // When & Then
      await expect(createPost.execute(invalidDTO)).rejects.toThrow();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('dado status inválido', () => {
    it('deve lançar erro de validação sem chamar o repositório', async () => {
      // Given
      const invalidDTO = { titulo: 'Título OK', conteudo: 'Conteúdo válido aqui', autor: 'Professor', status: 'archived' };

      // When & Then
      await expect(createPost.execute(invalidDTO)).rejects.toThrow();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('dado autor vazio', () => {
    it('deve lançar erro de validação sem chamar o repositório', async () => {
      // Given
      const invalidDTO = { titulo: 'Título OK', conteudo: 'Conteúdo válido aqui', autor: '' };

      // When & Then
      await expect(createPost.execute(invalidDTO)).rejects.toThrow('Autor é obrigatório');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('dado erro no repositório', () => {
    it('deve propagar o erro', async () => {
      // Given
      const validDTO = { titulo: 'Título OK', conteudo: 'Conteúdo válido aqui', autor: 'Professor' };
      mockRepository.create.mockRejectedValue(new Error('Erro de rede'));

      // When & Then
      await expect(createPost.execute(validDTO)).rejects.toThrow('Erro de rede');
    });
  });
});
```

---

## Checklist de Revisão Técnica (Tech Lead)

### Código

- [x] Cada Use Case é uma classe com construtor recebendo `repository`
- [x] Método público único: `execute(input)`
- [x] Imports corretos dos Value Objects (`../../domain/value-objects/...`)
- [x] Nenhuma dependência de infraestrutura (axios, fetch, etc.)
- [x] Nenhum `console.log` no código de produção
- [x] `export default` no final de cada arquivo
- [x] Nomes descritivos e em inglês para classes/métodos
- [x] Mensagens de erro em português (consistente com VOs)

### Qualidade

- [x] Testes escritos ANTES da implementação (commits evidenciam TDD)
- [x] Padrão BDD (Given-When-Then) em TODOS os testes
- [x] Mock do repository em todos os testes de use case
- [x] Verificação de que repository NÃO é chamado quando validação falha
- [x] Verificação de propagação de erros do repository
- [x] Sem testes acoplados à implementação interna (testar comportamento, não estrutura)
- [x] Cobertura ≥ 80% (statements, branches, functions, lines)

---

## Checklist de QA (Validação Final)

### Testes Unitários

- [x] `npm test -- --watchAll=false` → todos passam ✅ (56 testes)
- [x] `npm run test:coverage` → camada application ≥ 80% (100% stmts, 93.22% branch)
- [x] Nenhum teste com `.skip` ou `.only`
- [x] Nenhum teste com `setTimeout` ou delays artificiais

### Cenários Cobertos (por Use Case)

- [x] **Happy path** — operação bem-sucedida
- [x] **Validação de entrada** — todos os campos inválidos testados
- [x] **Campos opcionais** — comportamento com e sem valores opcionais
- [x] **Valores default** — page, limit, status usam defaults corretos
- [x] **Edge cases** — strings vazias, undefined, null, espaços
- [x] **Erros do repository** — propagação correta de exceções
- [x] **Isolamento** — repository mockado não faz calls reais

### Contratos Verificados

- [x] Use Cases chamam os métodos corretos do repository
- [x] Use Cases passam os argumentos corretos ao repository
- [x] Use Cases retornam exatamente o que o repository retorna (sem transformações extras)
- [x] Validações usam os mesmos Value Objects da Task 02

---

## Critérios de Aceitação (Definition of Done)

1. ✅ Testes escritos ANTES da implementação (TDD red-green-refactor)
2. ✅ Padrão BDD (Given-When-Then) com `describe` aninhados em português
3. ✅ Use Cases recebem `repository` por injeção de dependência (construtor)
4. ✅ Use Cases possuem método único `execute()`
5. ✅ Validações via Value Objects (reutilizando Task 02)
6. ✅ Validação de `autor` diretamente no Use Case (não é VO)
7. ✅ Repository é mockado nos testes (sem chamadas HTTP reais)
8. ✅ Propagação de erros do repository é testada
9. ✅ DTOs implementados e testados
10. ✅ Cobertura ≥ 80% nesta camada
11. ✅ Zero warnings ou erros de lint
12. ✅ Nenhuma dependência circular entre módulos

---

## Ordem de Implementação Sugerida

1. **DTOs** — `CreatePostDTO` → `UpdatePostDTO` (simples, sem lógica complexa)
2. **GetPost** — use case mais simples (1 validação + 1 chamada)
3. **DeletePost** — similar ao GetPost
4. **ListPosts** — introduz paginação/defaults
5. **SearchPosts** — validação de query + paginação
6. **CreatePost** — validação completa via VOs
7. **UpdatePost** — validação parcial (mais complexo)

---

## Notas para o Desenvolvedor

> ⚠️ **IMPORTANTE**: Os Value Objects usam `.value` (getter), NÃO `.getValue()`. Confira o código da Task 02.

> 💡 **Dica**: Use `jest.fn()` para criar mocks simples. Use `.mockResolvedValue()` para simular retornos async e `.mockRejectedValue()` para simular erros.

> 🔒 **Regra de ouro**: Se a validação falha, o repository NUNCA deve ser chamado. Teste isso explicitamente com `expect(mockRepository.method).not.toHaveBeenCalled()`.


