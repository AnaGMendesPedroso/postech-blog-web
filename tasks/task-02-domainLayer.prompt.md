# Task 02 — Camada de Domínio: Value Objects e Entity (Posts)

## Objetivo

Implementar os Value Objects (`PostTitle`, `PostContent`, `PostStatus`) e a Entity (`Post`) do domínio Posts seguindo TDD/BDD — testes escritos antes da implementação.

## Entregáveis

- [ ] `PostTitle.test.js` + `PostTitle.js`
- [ ] `PostContent.test.js` + `PostContent.js`
- [ ] `PostStatus.test.js` + `PostStatus.js`
- [ ] `Post.test.js` + `Post.js`
- [ ] `PostRepository.js` (interface/contrato)
- [ ] Todos os testes passando
- [ ] Cobertura ≥ 80% nesta camada

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

- Testes escritos ANTES da implementação (TDD)
- Padrão BDD (Given-When-Then) em todos os testes
- Value Objects são imutáveis
- Validações lançam erros descritivos
- Entity Post compõe os Value Objects
- Cobertura ≥ 80%
