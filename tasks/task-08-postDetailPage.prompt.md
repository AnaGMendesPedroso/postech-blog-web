# Task 08 — Página de Leitura de Post (PostDetail)

## Objetivo

Implementar a página de leitura que exibe o conteúdo completo de um post selecionado.

## Entregáveis

- [ ] `usePost.test.js` + `usePost.js`
- [ ] `PostDetail.test.js` + `PostDetail.js`
- [ ] Todos com `data-testid` fixos
- [ ] Responsivo
- [ ] Integração com Use Case `GetPost`

## Localização

```
src/domains/posts/presentation/
├── pages/
│   ├── PostDetail.js
│   └── PostDetail.test.js
└── hooks/
    ├── usePost.js
    └── usePost.test.js
```

## Especificações

### PostDetail Page

| Funcionalidade | Descrição |
|----------------|-----------|
| Exibição | Título, autor, data formatada, conteúdo completo |
| Loading | Spinner enquanto carrega dados |
| Erro | Mensagem se post não encontrado (404) ou erro da API |
| Navegação | Botão "Voltar" retorna à Home |

| data-testid | Elemento | Conteúdo |
|-------------|----------|----------|
| `post-title` | h1 | Título completo |
| `post-author` | span | Nome do autor |
| `post-date` | span | Data formatada (createdAt) |
| `post-content` | div | Conteúdo completo do post |
| `post-btn-back` | button/link | Voltar para Home |

### usePost (Hook)

```js
// Input: id (da URL via useParams)
// Retorna:
{
  post: Post | null,
  loading: boolean,
  error: string | null
}
```

- Usa Use Case `GetPost` com o id da URL
- Carrega automaticamente ao montar (useEffect)

## Padrão de Testes (BDD)

```js
describe('PostDetail Page', () => {
  describe('dado um post existente', () => {
    it('deve exibir o título do post', async () => { /* ... */ });
    it('deve exibir o conteúdo completo', async () => { /* ... */ });
    it('deve exibir o autor', async () => { /* ... */ });
    it('deve exibir a data formatada', async () => { /* ... */ });
  });

  describe('dado um post inexistente (404)', () => {
    it('deve exibir mensagem de "post não encontrado"', async () => { /* ... */ });
  });

  describe('quando ocorre erro na API', () => {
    it('deve exibir mensagem de erro genérica', async () => { /* ... */ });
  });

  describe('quando está carregando', () => {
    it('deve exibir o loading spinner', () => { /* ... */ });
  });

  describe('quando o usuário clica em "Voltar"', () => {
    it('deve navegar para a página inicial', async () => { /* ... */ });
  });
});
```

## Critérios de Aceitação

- Testes escritos ANTES da implementação (TDD)
- Padrão BDD nos testes
- Consome API via Use Case `GetPost`
- Exibe conteúdo completo sem truncamento
- Trata estados de loading, erro e 404
- `data-testid` fixos
- Responsivo
- Cobertura ≥ 80%
