# Task 10 — Página de Edição de Post (EditPost)

## Objetivo

Implementar a página de edição de postagens para docentes, carregando dados existentes e permitindo atualização via Use Case `UpdatePost`.

## Entregáveis

- [ ] `EditPost.test.js` + `EditPost.js` (page)
- [ ] Reutiliza `PostForm` (Task 09) e `usePost` (Task 08)
- [ ] Todos com `data-testid` fixos
- [ ] Rota protegida
- [ ] Pré-carrega dados do post existente
- [ ] Redirect para Admin após sucesso

## Localização

```
src/domains/posts/presentation/pages/
├── EditPost.js
└── EditPost.test.js
```

## Especificações

### EditPost Page

| Funcionalidade | Descrição |
|----------------|-----------|
| Rota | `/admin/posts/:id/edit` (protegida) |
| Carregamento | GET `/posts/:id` para pré-popular o formulário |
| Formulário | Reutiliza `PostForm` com `initialData` preenchido |
| Submissão | PUT `/posts/:id` via Use Case `UpdatePost` |
| Sucesso | Feedback + redirect para `/admin` |
| Erro | Exibe mensagem de erro da API |
| Loading | Spinner enquanto carrega dados do post |
| 404 | Mensagem se post não encontrado |

### Fluxo

1. Página monta → usa `usePost(id)` para carregar dados existentes
2. Enquanto carrega → exibe Loading
3. Dados carregados → renderiza `PostForm` com `initialData`
4. Docente edita campos → validação client-side
5. Docente submete → chama Use Case `UpdatePost`
6. Sucesso → redireciona para `/admin`
7. Erro → exibe mensagem

## Padrão de Testes (BDD)

```js
describe('EditPost Page', () => {
  describe('dado que o post existe', () => {
    it('deve carregar e exibir os dados atuais no formulário', async () => { /* ... */ });
  });

  describe('dado que o post não existe (404)', () => {
    it('deve exibir mensagem de "post não encontrado"', async () => { /* ... */ });
  });

  describe('dado que o docente altera o título e salva', () => {
    it('deve chamar updatePost com os dados atualizados', async () => { /* ... */ });
    it('deve redirecionar para /admin após sucesso', async () => { /* ... */ });
  });

  describe('dado que o docente envia dados inválidos', () => {
    it('deve exibir erros de validação sem chamar a API', async () => { /* ... */ });
  });

  describe('dado que a API retorna erro ao atualizar', () => {
    it('deve exibir a mensagem de erro', async () => { /* ... */ });
  });

  describe('enquanto os dados do post estão carregando', () => {
    it('deve exibir o loading spinner', () => { /* ... */ });
  });
});
```

## Critérios de Aceitação

- Testes escritos ANTES da implementação (TDD)
- Padrão BDD nos testes
- Rota protegida (redireciona se não autenticado)
- Carrega dados existentes do post antes de exibir formulário
- Reutiliza `PostForm` com prop `initialData`
- Consome API via Use Cases `GetPost` e `UpdatePost`
- `data-testid` fixos
- Responsivo
- Cobertura ≥ 80%
