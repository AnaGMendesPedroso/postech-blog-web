# Task 12 — Roteamento e Integração (App.js)

## Objetivo

Configurar o roteamento da aplicação com React Router DOM, integrando todas as páginas, layouts, rotas protegidas e providers (AuthContext, ThemeProvider).

## Entregáveis

- [ ] `App.test.js` + `App.js` configurado com todas as rotas
- [ ] Layout principal (Header + conteúdo + Footer)
- [ ] Rotas públicas e protegidas definidas
- [ ] Providers configurados (AuthContext, ThemeProvider, GlobalStyles)
- [ ] `index.js` atualizado

## Localização

```
src/
├── App.js
├── App.test.js
└── index.js
```

## Especificações

### Mapa de Rotas

| Rota | Página | Acesso | Descrição |
|------|--------|--------|-----------|
| `/` | Home | Público | Lista de posts publicados |
| `/posts/:id` | PostDetail | Público | Leitura de post |
| `/login` | Login | Público | Formulário de login |
| `/admin` | Admin | Protegido | Gestão de posts |
| `/admin/posts/new` | CreatePost | Protegido | Criar novo post |
| `/admin/posts/:id/edit` | EditPost | Protegido | Editar post existente |
| `*` | NotFound (404) | Público | Página não encontrada |

### Estrutura do App.js

```jsx
<AuthProvider>
  <ThemeProvider theme={theme}>
    <GlobalStyles />
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/login" element={<Login />} />
          
          {/* Rotas protegidas */}
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
          <Route path="/admin/posts/new" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
          <Route path="/admin/posts/:id/edit" element={<PrivateRoute><EditPost /></PrivateRoute>} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  </ThemeProvider>
</AuthProvider>
```

### Injeção de Dependências

Configurar a criação dos Use Cases com repositories reais:

```js
// src/config/dependencies.js
import { PostApiRepository } from '../domains/posts/infrastructure/repositories/PostApiRepository';
import { ListPosts } from '../domains/posts/application/usecases/ListPosts';
// ... etc

const postRepository = new PostApiRepository();

export const listPosts = new ListPosts(postRepository);
export const searchPosts = new SearchPosts(postRepository);
export const getPost = new GetPost(postRepository);
export const createPost = new CreatePost(postRepository);
export const updatePost = new UpdatePost(postRepository);
export const deletePost = new DeletePost(postRepository);
```

## Padrão de Testes (BDD)

```js
describe('App Routing', () => {
  describe('dado que o usuário acessa /', () => {
    it('deve renderizar a Home page', () => { /* ... */ });
  });

  describe('dado que o usuário acessa /posts/123', () => {
    it('deve renderizar a PostDetail page', () => { /* ... */ });
  });

  describe('dado que o usuário NÃO autenticado acessa /admin', () => {
    it('deve redirecionar para /login', () => { /* ... */ });
  });

  describe('dado que o usuário autenticado acessa /admin', () => {
    it('deve renderizar a Admin page', () => { /* ... */ });
  });

  describe('dado que o usuário acessa rota inexistente', () => {
    it('deve renderizar página 404', () => { /* ... */ });
  });
});
```

## Critérios de Aceitação

- Testes para cada rota (pública e protegida)
- PrivateRoute redireciona para `/login` se não autenticado
- Header e Footer visíveis em todas as páginas
- Providers configurados corretamente (Auth, Theme)
- Injeção de dependências centralizada
- Cobertura ≥ 80%
