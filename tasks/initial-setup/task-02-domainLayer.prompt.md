# Task 02 — Camada de Domínio: Value Objects e Entity (Posts)

## Objetivo

Implementar os Value Objects (`PostTitle`, `PostContent`, `PostStatus`) e a Entity (`Post`) do domínio Posts seguindo TDD/BDD — testes escritos antes da implementação.

## Entregáveis

- [x] `PostTitle.test.js` + `PostTitle.js`
- [x] `PostContent.test.js` + `PostContent.js`
- [x] `PostStatus.test.js` + `PostStatus.js`
- [x] `Post.test.js` + `Post.js`
- [x] `PostRepository.js` (interface/contrato) + `PostRepository.test.js`
- [x] Todos os testes passando (58 testes ✅)
- [x] Cobertura ≥ 80% nesta camada (100% Stmts/Branch/Funcs/Lines ✅)

## Localização

```
src/domains/posts/domain/
├── entities/
│   ├── Post.js
│   └── Post.test.js
├── value-objects/
│   ├── PostTitle.js
│   ├── PostTitle.test.js
│   ├── PostContent.js
│   ├── PostContent.test.js
│   ├── PostStatus.js
│   └── PostStatus.test.js
└── repositories/
    └── PostRepository.js
```

## Especificações

### PostTitle (Value Object)

| Regra | Descrição |
|-------|-----------|
| Obrigatório | Não pode ser vazio/nulo |
| Min length | 3 caracteres |
| Max length | 200 caracteres |
| Imutável | Valor não pode ser alterado após criação |

### PostContent (Value Object)

| Regra | Descrição |
|-------|-----------|
| Obrigatório | Não pode ser vazio/nulo |
| Min length | 10 caracteres |
| Imutável | Valor não pode ser alterado após criação |

### PostStatus (Value Object)

| Regra | Descrição |
|-------|-----------|
| Valores permitidos | `"draft"` ou `"published"` |
| Default | `"draft"` |
| Imutável | Valor não pode ser alterado após criação |

### Post (Entity)

| Campo | Tipo | Regra |
|-------|------|-------|
| id | string | Identidade da entidade |
| titulo | PostTitle | Value Object validado |
| conteudo | PostContent | Value Object validado |
| autor | string | Obrigatório, não vazio |
| status | PostStatus | Value Object, default "draft" |
| createdAt | Date | Gerado automaticamente |
| updatedAt | Date | Gerado automaticamente |

### PostRepository (Interface)

```js
// Contrato — não implementa lógica, apenas define o formato
class PostRepository {
  async findAll(page, limit, status) { throw new Error('Not implemented'); }
  async search(query, page, limit) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async create(post) { throw new Error('Not implemented'); }
  async update(id, post) { throw new Error('Not implemented'); }
  async delete(id) { throw new Error('Not implemented'); }
}
```

## Padrão de Testes (BDD)

```js
describe('PostTitle', () => {
  describe('dado um título válido', () => {
    it('deve criar o value object com sucesso', () => { /* ... */ });
  });
  describe('dado um título vazio', () => {
    it('deve lançar erro de validação', () => { /* ... */ });
  });
  describe('dado um título com menos de 3 caracteres', () => {
    it('deve lançar erro de validação', () => { /* ... */ });
  });
  describe('dado um título com mais de 200 caracteres', () => {
    it('deve lançar erro de validação', () => { /* ... */ });
  });
});
```

## Critérios de Aceitação

- [x] Testes escritos ANTES da implementação (TDD)
- [x] Padrão BDD (Given-When-Then) em todos os testes
- [x] Value Objects são imutáveis (`Object.freeze` + campos privados `#`)
- [x] Validações lançam erros descritivos
- [x] Entity Post compõe os Value Objects
- [x] Cobertura ≥ 80% (atingido 100%)

## Resumo da Implementação

### ✅ Concluído

| Artefato | Detalhes |
|----------|----------|
| `PostTitle.js` | Value Object imutável, validações: obrigatório, min 3 chars, max 200 chars, trim, métodos `equals()` e `toString()` |
| `PostTitle.test.js` | 11 testes BDD cobrindo criação, validações, imutabilidade, equals, toString |
| `PostContent.js` | Value Object imutável, validações: obrigatório, min 10 chars, trim, métodos `equals()` e `toString()` |
| `PostContent.test.js` | 10 testes BDD cobrindo criação, validações, imutabilidade, equals, toString |
| `PostStatus.js` | Value Object imutável, valores permitidos: `draft`/`published`, default `draft`, métodos `isDraft()`, `isPublished()`, `equals()`, `toString()` |
| `PostStatus.test.js` | 12 testes BDD cobrindo criação, default, validações, isDraft, isPublished, equals, toString |
| `Post.js` | Entity compondo Value Objects, campos privados, `Object.freeze`, método `toJSON()` |
| `Post.test.js` | 13 testes BDD cobrindo criação, aceitação de VOs, default status, datas automáticas, imutabilidade, validação autor, toJSON |
| `PostRepository.js` | Interface/contrato com métodos: `findAll`, `search`, `findById`, `create`, `update`, `delete` |
| `PostRepository.test.js` | 6 testes verificando contrato (todos lançam "Not implemented") |

### 📊 Métricas

- **Total de testes:** 58 passando
- **Cobertura:** 100% (Statements, Branches, Functions, Lines)
