# Task 09 — Página de Criação de Post (CreatePost)

## Objetivo

Implementar a página de criação de postagens para docentes, com formulário validado e integração com o Use Case `CreatePost`.

## Entregáveis

- [ ] `PostForm.test.js` + `PostForm.js` (componente reutilizável)
- [ ] `usePostForm.test.js` + `usePostForm.js`
- [ ] `CreatePost.test.js` + `CreatePost.js` (page)
- [ ] Todos com `data-testid` fixos
- [ ] Rota protegida (requer autenticação)
- [ ] Validação client-side
- [ ] Redirect para Admin após sucesso

## Localização

```
src/domains/posts/presentation/
├── pages/
│   ├── CreatePost.js
│   └── CreatePost.test.js
├── components/
│   ├── PostForm.js
│   └── PostForm.test.js
└── hooks/
    ├── usePostForm.js
    └── usePostForm.test.js
```

## Especificações

### PostForm (Componente Reutilizável)

Usado tanto em CreatePost quanto em EditPost (DRY).

| data-testid | Elemento | Descrição |
|-------------|----------|-----------|
| `form-post` | form | Container do formulário |
| `form-input-titulo` | input | Campo título |
| `form-input-conteudo` | textarea | Campo conteúdo |
| `form-input-autor` | input | Campo autor |
| `form-select-status` | select | Seleção draft/published |
| `form-btn-submit` | button | Botão enviar |
| `form-error-message` | div | Mensagem de erro (validação ou API) |

**Props:**
```js
{
  initialData?: { titulo, conteudo, autor, status },  // Para edição
  onSubmit: (data) => Promise<void>,
  submitLabel?: string,  // "Criar Post" ou "Salvar Alterações"
  loading?: boolean
}
```

**Validações client-side:**
- Título: obrigatório, min 3, max 200 caracteres
- Conteúdo: obrigatório, min 10 caracteres
- Autor: obrigatório, não vazio

### usePostForm (Hook)

```js
// Retorna:
{
  formData: { titulo, conteudo, autor, status },
  errors: { titulo?, conteudo?, autor? },
  loading: boolean,
  handleChange: (field, value) => void,
  handleSubmit: () => Promise<void>,
  isValid: boolean
}
```

### CreatePost Page

- Rota: `/admin/posts/new` (protegida via PrivateRoute)
- Renderiza `PostForm` com `submitLabel="Criar Post"`
- Ao submeter com sucesso: exibe feedback e redireciona para `/admin`
- Ao falhar: exibe mensagem de erro vinda da API ou validação

## Padrão de Testes (BDD)

```js
describe('CreatePost Page', () => {
  describe('dado que o docente preenche todos os campos corretamente', () => {
    it('deve criar o post e redirecionar para /admin', async () => { /* ... */ });
  });

  describe('dado que o título tem menos de 3 caracteres', () => {
    it('deve exibir erro de validação no campo título', async () => { /* ... */ });
  });

  describe('dado que o conteúdo tem menos de 10 caracteres', () => {
    it('deve exibir erro de validação no campo conteúdo', async () => { /* ... */ });
  });

  describe('dado que o autor está vazio', () => {
    it('deve exibir erro de validação no campo autor', async () => { /* ... */ });
  });

  describe('dado que a API retorna erro', () => {
    it('deve exibir a mensagem de erro da API', async () => { /* ... */ });
  });

  describe('enquanto o formulário está sendo enviado', () => {
    it('deve desabilitar o botão de submit e exibir loading', async () => { /* ... */ });
  });
});
```

## Critérios de Aceitação

- Testes escritos ANTES da implementação (TDD)
- Padrão BDD nos testes
- Rota protegida (redireciona se não autenticado)
- Validação client-side antes de enviar para API
- Consome API via Use Case `CreatePost`
- `PostForm` é reutilizável (também será usado pela Task 10)
- `data-testid` fixos
- Responsivo
- Cobertura ≥ 80%
