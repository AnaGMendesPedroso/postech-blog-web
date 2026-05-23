# Plano de Desenvolvimento — Postech Blog Web

## Contexto e Problema

Atualmente, a maioria de professores e professoras da rede pública de educação não têm plataformas onde postar suas aulas e transmitir conhecimento para alunos e alunas de forma prática, centralizada e tecnológica.

Esta aplicação front-end visa resolver esse problema oferecendo uma interface gráfica intuitiva e responsiva onde **docentes** podem criar, editar e gerenciar publicações educacionais, e **alunos(as)** podem visualizar, ler e buscar conteúdos de forma centralizada.

## Objetivo

Desenvolver uma interface gráfica para a aplicação de blogging utilizando React. A aplicação deve ser responsiva, acessível e fácil de usar, permitindo aos docentes e alunos(as) interagir com os diversos endpoints REST já implementados no back-end (`http://localhost:3000`).

## Princípios e Práticas

| Prática | Aplicação no Projeto |
|---------|---------------------|
| **Domain Driven Design (DDD)** | Organização por domínios (`posts`, `auth`), separação de camadas (domain, application, infrastructure, presentation) |
| **Test Driven Development (TDD)** | Red → Green → Refactor para cada funcionalidade; testes escritos antes da implementação |
| **Behavior Driven Development (BDD)** | Testes descrevem comportamentos do usuário/sistema usando padrão Given-When-Then; foco no "o quê" e não no "como" |
| **Clean Code** | Nomes descritivos, funções pequenas e com responsabilidade única, sem comentários desnecessários, DRY, SOLID |
| **Testes Unitários** | Jest + React Testing Library com cobertura mínima de 80% |
| **Testes de Mutação** | Stryker Mutator para validar qualidade dos testes (meta ≥ 90%, break: 80%) |
| **Testes E2E** | Playwright para testes end-to-end; componentes interativos com `data-testid` fixos |

---

## APIs Disponíveis (consultadas em `/api-docs`)

Os seguintes endpoints REST estão implementados e disponibilizados localmente:

| Método | Endpoint | Descrição | Usuário | Parâmetros |
|--------|----------|-----------|---------|------------|
| GET | `/posts` | Lista de posts — permite aos alunos visualizarem todos os posts disponíveis na página principal. Também permite que professores vejam todas as postagens para gestão de conteúdo. | Alunos / Docentes | `?status=draft\|published\|all`, `?page=1`, `?limit=10` |
| GET | `/posts/search` | Busca de posts por palavras-chave — retorna posts que contêm o termo no título ou conteúdo | Alunos / Docentes | `?q=termo` (obrigatório), `?status=`, `?page=`, `?limit=` |
| GET | `/posts/:id` | Leitura de post — alunos podem ler o conteúdo completo de um post específico | Alunos | path param `id` |
| POST | `/posts` | Criação de postagens — permite que docentes criem novas postagens | Docentes | body: `{ titulo*, conteudo*, autor*, status? }` |
| PUT | `/posts/:id` | Edição de postagens — usado para editar uma postagem existente | Docentes | body: `{ titulo?, conteudo?, autor?, status? }` |
| DELETE | `/posts/:id` | Exclusão de postagens — permite que docentes excluam uma postagem específica | Docentes | path param `id` |

### Schema: Post

```json
{
  "id": "string",
  "titulo": "string (min 3, max 200)",
  "conteudo": "string (min 10)",
  "autor": "string",
  "status": "draft | published (default: draft)",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

### Schema: Resposta Paginada (PaginatedResponse)

```json
{
  "success": true,
  "data": [Post],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Schema: Erro

```json
{
  "success": false,
  "error": {
    "message": "string",
    "details": []
  }
}
```

> **Nota:** A API atualmente **não possui endpoints de autenticação**. A autenticação será implementada no front-end de forma simulada (mock) ou como preparação para futura integração quando a API suportar.

---

## Arquitetura — Domain Driven Design (DDD)

### Estrutura de Pastas

```
src/
├── domains/                    # Bounded Contexts
│   ├── posts/                  # Domínio: Posts
│   │   ├── domain/             # Camada de Domínio
│   │   │   ├── entities/
│   │   │   │   └── Post.js            # Entidade Post (validações, regras de negócio)
│   │   │   ├── value-objects/
│   │   │   │   ├── PostTitle.js       # VO: título (min 3, max 200)
│   │   │   │   ├── PostContent.js     # VO: conteúdo (min 10)
│   │   │   │   └── PostStatus.js      # VO: status (draft | published)
│   │   │   └── repositories/
│   │   │       └── PostRepository.js  # Interface (contrato) do repositório
│   │   ├── application/        # Camada de Aplicação (Use Cases)
│   │   │   ├── usecases/
│   │   │   │   ├── ListPosts.js
│   │   │   │   ├── SearchPosts.js
│   │   │   │   ├── GetPost.js
│   │   │   │   ├── CreatePost.js
│   │   │   │   ├── UpdatePost.js
│   │   │   │   └── DeletePost.js
│   │   │   └── dto/
│   │   │       ├── CreatePostDTO.js
│   │   │       └── UpdatePostDTO.js
│   │   ├── infrastructure/     # Camada de Infraestrutura
│   │   │   └── repositories/
│   │   │       └── PostApiRepository.js  # Implementação com Axios
│   │   └── presentation/       # Camada de Apresentação
│   │       ├── pages/
│   │       │   ├── Home.js
│   │       │   ├── PostDetail.js
│   │       │   ├── CreatePost.js
│   │       │   ├── EditPost.js
│   │       │   └── Admin.js
│   │       ├── components/
│   │       │   ├── PostCard.js
│   │       │   ├── PostForm.js
│   │       │   ├── PostList.js
│   │       │   └── SearchBar.js
│   │       └── hooks/
│   │           ├── usePosts.js
│   │           ├── usePost.js
│   │           └── usePostForm.js
│   └── auth/                   # Domínio: Autenticação
│       ├── domain/
│       │   └── entities/
│       │       └── User.js
│       ├── application/
│       │   └── usecases/
│       │       ├── Login.js
│       │       └── Logout.js
│       ├── infrastructure/
│       │   └── repositories/
│       │       └── AuthMockRepository.js
│       └── presentation/
│           ├── pages/
│           │   └── Login.js
│           ├── components/
│           │   └── LoginForm.js
│           └── hooks/
│               └── useAuth.js
├── shared/                     # Código compartilhado entre domínios
│   ├── components/
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── Pagination.js
│   │   ├── PrivateRoute.js
│   │   ├── Loading.js
│   │   └── ErrorMessage.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── infrastructure/
│   │   └── http/
│   │       └── httpClient.js   # Instância Axios configurada
│   ├── styles/
│   │   ├── GlobalStyles.js
│   │   └── theme.js
│   └── utils/
│       ├── formatDate.js
│       └── truncateText.js
├── App.js                      # Rotas e layout principal
├── App.test.js
└── index.js
```

### Mapeamento DDD

| Conceito DDD | Implementação |
|--------------|---------------|
| **Bounded Context** | `domains/posts/`, `domains/auth/` |
| **Entity** | `Post.js` — identidade por `id`, ciclo de vida |
| **Value Object** | `PostTitle`, `PostContent`, `PostStatus` — imutáveis, validam invariantes |
| **Repository (Interface)** | `PostRepository.js` — contrato de acesso a dados |
| **Repository (Impl)** | `PostApiRepository.js` — implementação HTTP |
| **Use Case** | `ListPosts.js`, `CreatePost.js`, etc. — orquestram lógica de aplicação |
| **DTO** | `CreatePostDTO.js` — transferência de dados entre camadas |
| **Presentation** | Pages, Components, Hooks — UI desacoplada do domínio |

---

## Steps

### 1. Setup do Projeto e Dependências

```bash
npm install react-router-dom axios styled-components react-icons
npm install -D @stryker-mutator/core @stryker-mutator/jest-runner @stryker-mutator/html-reporter @playwright/test
```

Adicionar scripts ao `package.json`:
```json
{
  "scripts": {
    "test": "react-scripts test",
    "test:coverage": "react-scripts test --coverage --watchAll=false",
    "test:mutation": "stryker run",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### 2. Configurar Stryker (teste de mutação)

Criar `stryker.config.mjs`:
```js
export default {
  mutate: ['src/domains/**/*.js', '!src/**/*.test.js', '!src/**/*.spec.js'],
  testRunner: 'jest',
  jest: { projectType: 'create-react-app' },
  reporters: ['html', 'clear-text', 'progress'],
  thresholds: { high: 90, low: 80, break: 80 }
};
```

### 3. Implementar Camada de Domínio (TDD/BDD — testes primeiro)

**Ciclo TDD para cada Value Object e Entity:**

1. ❌ Escrever teste que falha (ex: `PostTitle.test.js`)
2. ✅ Implementar código mínimo para passar
3. 🔄 Refatorar mantendo testes verdes

**Padrão BDD nos testes (Given-When-Then):**

```js
describe('PostTitle', () => {
  describe('dado um título válido', () => {
    it('deve criar o value object com sucesso', () => {
      // Given
      const value = 'Meu primeiro post';
      // When
      const title = new PostTitle(value);
      // Then
      expect(title.getValue()).toBe(value);
    });
  });

  describe('dado um título com menos de 3 caracteres', () => {
    it('deve lançar erro de validação', () => {
      // Given
      const value = 'ab';
      // When & Then
      expect(() => new PostTitle(value)).toThrow('Título deve ter no mínimo 3 caracteres');
    });
  });
});
```

Exemplo de sequência:
- `PostTitle.test.js` → `PostTitle.js`
- `PostContent.test.js` → `PostContent.js`
- `PostStatus.test.js` → `PostStatus.js`
- `Post.test.js` → `Post.js`

### 4. Implementar Camada de Aplicação (Use Cases — TDD/BDD)

Para cada use case:
1. Escrever teste descrevendo o comportamento esperado (BDD)
2. Implementar use case injetando dependência do repository
3. Refatorar

**Padrão BDD nos Use Cases:**

```js
describe('CreatePost', () => {
  describe('dado dados válidos de um novo post', () => {
    it('deve criar o post e retornar os dados persistidos', async () => {
      // Given
      const postData = { titulo: 'Novo Post', conteudo: 'Conteúdo válido do post', autor: 'Professor' };
      mockRepository.create.mockResolvedValue({ id: '1', ...postData, status: 'draft' });
      // When
      const result = await createPost.execute(postData);
      // Then
      expect(result.id).toBe('1');
      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining(postData));
    });
  });

  describe('dado dados inválidos (título muito curto)', () => {
    it('deve lançar erro de validação sem chamar o repositório', async () => {
      // Given
      const postData = { titulo: 'ab', conteudo: 'Conteúdo válido', autor: 'Professor' };
      // When & Then
      await expect(createPost.execute(postData)).rejects.toThrow();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });
});
```

Sequência:
- `ListPosts.test.js` → `ListPosts.js`
- `SearchPosts.test.js` → `SearchPosts.js`
- `GetPost.test.js` → `GetPost.js`
- `CreatePost.test.js` → `CreatePost.js`
- `UpdatePost.test.js` → `UpdatePost.js`
- `DeletePost.test.js` → `DeletePost.js`

### 5. Implementar Camada de Infraestrutura

- `httpClient.js` — instância Axios com `baseURL: process.env.REACT_APP_API_URL`
- `PostApiRepository.js` — implementa interface `PostRepository`
- `AuthMockRepository.js` — autenticação simulada
- Testes com mocks do Axios

### 6. Implementar Camada de Apresentação (TDD/BDD com React Testing Library)

Para cada componente/página:
1. Escrever teste descrevendo o comportamento do usuário (BDD)
2. Implementar componente
3. Refatorar

**Padrão BDD nos componentes:**

```js
describe('Home Page', () => {
  describe('quando a página carrega com sucesso', () => {
    it('deve exibir a lista de posts publicados', async () => {
      // Given
      mockGetPosts.mockResolvedValue({ data: [mockPost], pagination: { totalPages: 1 } });
      // When
      render(<Home />);
      // Then
      expect(await screen.findByText(mockPost.titulo)).toBeInTheDocument();
    });
  });

  describe('quando o usuário busca por uma palavra-chave', () => {
    it('deve exibir apenas os posts filtrados', async () => {
      // Given
      render(<Home />);
      // When
      await userEvent.type(screen.getByPlaceholderText(/buscar/i), 'react');
      await userEvent.click(screen.getByRole('button', { name: /buscar/i }));
      // Then
      expect(mockSearchPosts).toHaveBeenCalledWith('react', expect.any(Number), expect.any(Number));
    });
  });
});
```

#### 6.1 Shared Components
- `Header`, `Footer`, `Pagination`, `PrivateRoute`, `Loading`, `ErrorMessage`

#### 6.2 Posts — Pages
- **Home**: lista posts publicados, busca, paginação
- **PostDetail**: exibe post completo
- **CreatePost**: formulário de criação
- **EditPost**: formulário de edição com dados pré-carregados
- **Admin**: tabela com ações (editar/excluir)

#### 6.3 Auth — Pages
- **Login**: formulário com validação

### 7. Configurar Roteamento (`App.js`)

- `/` → Home
- `/posts/:id` → PostDetail
- `/login` → Login
- `/admin` → Admin (protegida)
- `/admin/posts/new` → CreatePost (protegida)
- `/admin/posts/:id/edit` → EditPost (protegida)

### 8. Estilização Responsiva

- `GlobalStyles.js` — reset CSS, tipografia base
- `theme.js` — cores, espaçamentos, breakpoints (mobile: 768px, desktop: 1024px)
- Styled Components em cada componente
- Mobile-first approach

### 9. Validação de Qualidade

```bash
# Rodar testes unitários com cobertura
npm run test:coverage

# Rodar testes de mutação
npm run test:mutation
```

**Metas de qualidade:**
- Cobertura de testes unitários: ≥ 80% (statements, branches, functions, lines)
- Score de mutação (Stryker): ≥ 90% (threshold break: 80%)

### 10. Documentação (README.md)

- Descrição do projeto
- Arquitetura DDD explicada
- Setup inicial
- Scripts disponíveis (dev, test, coverage, mutation)
- Guia de uso
- Decisões técnicas
- Como contribuir (padrão TDD)

---

## Práticas de Clean Code Aplicadas

| Princípio | Exemplo no Projeto |
|-----------|-------------------|
| **Nomes significativos** | `usePosts()`, `PostApiRepository`, `CreatePostDTO` |
| **Funções pequenas** | Use cases com um único método `execute()` |
| **Single Responsibility** | Cada use case faz apenas uma coisa |
| **Dependency Inversion** | Use cases dependem de interface `PostRepository`, não da implementação |
| **DRY** | `PostForm` reutilizado em Create e Edit |
| **Sem side effects inesperados** | Value Objects imutáveis, validação pura |
| **Tratamento de erros** | Error boundaries, mensagens claras ao usuário |
| **Código auto-documentável** | Sem comentários óbvios, nomes explicam a intenção |

---

## Estratégia de Testes

### Pirâmide de Testes

```
        /  E2E  \          ← Playwright (fluxos completos)
       /----------\
      / Integração \       ← Hooks + API mocks
     /--------------\
    /   Unitários    \     ← Entities, VOs, Use Cases, Components
   /------------------\
```

### O que testar em cada camada (abordagem BDD)

| Camada | Comportamento a validar | Ferramentas |
|--------|------------------------|-------------|
| **Domain (Entities/VOs)** | "Dado X, quando criar/validar, então deve..." — invariantes e regras de negócio | Jest |
| **Application (Use Cases)** | "Dado um repositório com dados X, quando executar Y, então deve..." — orquestração | Jest + mocks |
| **Infrastructure** | "Dado uma resposta HTTP X, quando o repositório mapear, então deve..." — integração HTTP | Jest + axios mock |
| **Presentation** | "Dado a página carregada, quando o usuário faz X, então deve ver/acontecer Y" — comportamento do usuário | React Testing Library + userEvent |

### Convenções de Escrita dos Testes

- `describe` externo: nome do módulo/componente
- `describe` interno: cenário com "dado/quando" (Given/When)
- `it`: resultado esperado com "deve..." (Then)
- Comentários `// Given`, `// When`, `// Then` dentro do teste para clareza
- Nomes descritivos que formem frases legíveis em português

### IDs Fixos para Testes E2E (data-testid)

Todos os componentes interativos devem possuir `data-testid` fixo para seletores estáveis no Playwright.

**Convenção de nomenclatura:** `{contexto}-{elemento}-{ação/nome}`

| Componente | data-testid | Descrição |
|------------|-------------|-----------|
| **Header** | `header-nav` | Container da navegação |
| | `header-link-home` | Link para home |
| | `header-link-admin` | Link para admin |
| | `header-link-login` | Link para login |
| | `header-btn-logout` | Botão de logout |
| **SearchBar** | `search-input` | Campo de busca |
| | `search-btn-submit` | Botão de buscar |
| **PostCard** | `post-card-{id}` | Card do post (dinâmico por id) |
| | `post-card-title-{id}` | Título do post no card |
| | `post-card-author-{id}` | Autor do post no card |
| **PostDetail** | `post-title` | Título do post completo |
| | `post-content` | Conteúdo do post |
| | `post-author` | Autor do post |
| | `post-date` | Data do post |
| | `post-btn-back` | Botão voltar |
| **PostForm** | `form-post` | Formulário de post |
| | `form-input-titulo` | Campo título |
| | `form-input-conteudo` | Campo conteúdo |
| | `form-input-autor` | Campo autor |
| | `form-select-status` | Select de status |
| | `form-btn-submit` | Botão enviar/salvar |
| | `form-error-message` | Mensagem de erro |
| **Admin** | `admin-table` | Tabela de posts |
| | `admin-btn-new-post` | Botão criar novo post |
| | `admin-btn-edit-{id}` | Botão editar (dinâmico) |
| | `admin-btn-delete-{id}` | Botão excluir (dinâmico) |
| | `admin-confirm-dialog` | Dialog de confirmação |
| | `admin-btn-confirm-yes` | Confirmar exclusão |
| | `admin-btn-confirm-no` | Cancelar exclusão |
| **Login** | `login-form` | Formulário de login |
| | `login-input-email` | Campo email |
| | `login-input-password` | Campo senha |
| | `login-btn-submit` | Botão entrar |
| | `login-error-message` | Mensagem de erro |
| **Pagination** | `pagination-container` | Container da paginação |
| | `pagination-btn-prev` | Botão anterior |
| | `pagination-btn-next` | Botão próximo |
| | `pagination-btn-page-{n}` | Botão de página específica |
| **Loading** | `loading-spinner` | Indicador de carregamento |

### Testes E2E com Playwright

Criar pasta `e2e/` na raiz do projeto:

```
e2e/
├── fixtures/
│   └── posts.json              # Dados de teste
├── pages/                      # Page Objects
│   ├── HomePage.js
│   ├── PostDetailPage.js
│   ├── AdminPage.js
│   ├── CreatePostPage.js
│   ├── EditPostPage.js
│   └── LoginPage.js
├── tests/
│   ├── home.spec.js
│   ├── post-detail.spec.js
│   ├── create-post.spec.js
│   ├── edit-post.spec.js
│   ├── admin.spec.js
│   └── login.spec.js
└── playwright.config.js
```

**Exemplo de teste E2E (BDD):**

```js
import { test, expect } from '@playwright/test';

test.describe('Página Principal', () => {
  test('deve exibir lista de posts publicados', async ({ page }) => {
    // Given
    await page.goto('/');
    // When
    await page.waitForSelector('[data-testid="post-card-1"]');
    // Then
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    await expect(page.locator('[data-testid^="post-card-"]')).toHaveCount.greaterThan(0);
  });

  test('deve buscar posts por palavra-chave', async ({ page }) => {
    // Given
    await page.goto('/');
    // When
    await page.fill('[data-testid="search-input"]', 'react');
    await page.click('[data-testid="search-btn-submit"]');
    // Then
    await expect(page.locator('[data-testid^="post-card-"]')).toBeVisible();
  });
});
```

### Teste de Mutação (Stryker)

O Stryker altera o código-fonte (mutantes) e roda os testes para verificar se detectam as mudanças. Mutantes que sobrevivem indicam testes fracos.

**Mutações aplicadas:**
- Troca de operadores (`===` → `!==`)
- Remoção de chamadas de função
- Alteração de strings e números
- Inversão de condicionais

---

## Decisões Técnicas

| Decisão | Justificativa |
|---------|---------------|
| **React 19 + Hooks** | Já configurado no projeto, componentes funcionais modernos |
| **React Router DOM** | Roteamento SPA padrão do ecossistema React |
| **Axios** | HTTP client robusto com interceptors e tratamento de erros |
| **Styled Components** | CSS-in-JS com escopo, temas e responsividade |
| **Context API** | Gerenciamento de estado simples, suficiente para auth |
| **Autenticação mock** | API não possui auth; estrutura preparada para expansão |
| **DDD** | Separação clara de responsabilidades, domínio isolado da infra |
| **TDD** | Qualidade garantida desde o início, design emergente |
| **BDD** | Testes legíveis como documentação viva do comportamento do sistema |
| **Stryker** | Valida eficácia real dos testes, não apenas cobertura |
| **Playwright** | Testes E2E confiáveis com seletores `data-testid` estáveis |

---

## Variáveis de Ambiente

```env
REACT_APP_API_URL=http://localhost:3000
```

---

## Critérios de Aceitação

- [ ] Página principal lista posts publicados com paginação
- [ ] Campo de busca filtra posts por palavra-chave
- [ ] Página de leitura exibe post completo
- [ ] Professor autenticado pode criar posts
- [ ] Professor autenticado pode editar posts existentes
- [ ] Página admin lista todos os posts com opções de editar/excluir
- [ ] Aplicação responsiva (mobile e desktop)
- [ ] Integração funcional com todos os endpoints da API
- [ ] Cobertura de testes unitários ≥ 80%
- [ ] Score de mutação (Stryker) ≥ 90%
- [ ] Arquitetura DDD implementada corretamente
- [ ] Testes E2E com Playwright cobrindo fluxos principais
- [ ] Todos os componentes interativos possuem data-testid fixo
- [ ] README documentado com setup, arquitetura e guia de testes
