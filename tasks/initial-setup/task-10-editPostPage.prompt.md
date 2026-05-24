# Task 10 — Página de Edição de Post (EditPost)

## Objetivo

Implementar a página de edição de postagens para docentes, carregando dados existentes via `usePost` (Task 08) e permitindo atualização via Use Case `UpdatePost`. Reutiliza `PostForm` (Task 09) com `initialData`, seguindo todos os padrões arquiteturais já consolidados no projeto.

---

## ✅ Status: IMPLEMENTADO

### Resultados

- **16 testes** escritos e passando
- **100% cobertura** em Statements, Branches, Functions e Lines no `EditPost.js`
- **0 regressões** no test suite existente (413 testes totais passando)
- **0 warnings de lint** introduzidos
- **0 console.log/console.error** esquecidos

### O que foi implementado

**`EditPost.test.js`** — 16 testes BDD cobrindo:
- Loading state (2): spinner visível, PostForm não renderiza
- Post existe (4): dados no formulário, título da página, submitLabel, sem loading/erro
- Post não existe/404 (3): mensagem de erro, sem PostForm, botão Voltar visível
- Edição e submit (2): chamada ao update com id correto, redirect para /admin
- Validação client-side (1): erro exibido sem chamar API
- Erro de API no update (2): mensagem exibida, sem redirect
- Edge case campos opcionais (1): post sem status usa default "draft"
- Botão Voltar (1): navega para /admin

**`EditPost.js`** — Page composer que:
- Extrai `id` via `useParams()`, instancia repository + use cases com `useMemo`
- Instância única de `PostApiRepository` compartilhada entre `GetPost` e `UpdatePost`
- Reutiliza `usePost` hook (Task 08) para carregar dados existentes
- Renderização condicional correta: PostForm **só monta** após dados carregarem
- Cria `UpdatePostDTO` e chama `updatePostUseCase.execute({ id, data: dto })`
- Redirect para `/admin` após sucesso
- Botão "← Voltar" sempre visível
- Todos os `data-testid` conforme especificação
- Responsivo (max-width 800px, padding adaptativo)
- Reutiliza `<Loading />` e `<ErrorMessage />` compartilhados
- styled-components com tema do projeto

---

## Contexto Arquitetural (Lições Aprendidas)

Antes de iniciar, o desenvolvedor **deve** ler e internalizar as convenções abaixo — todas já validadas e estabilizadas nas tasks 07–09:

| Aspecto | Convenção do Projeto | Referência |
|---------|---------------------|------------|
| Instanciação de deps | `useMemo(() => new Repo(), [])` + `useMemo(() => new UseCase(repo), [repo])` | `CreatePost.js` L32-33 |
| Hook pattern | Hooks recebem use cases por injeção (DI). O componente page instancia e injeta. | `usePost.js`, `usePosts.js` |
| Navegação pós-sucesso | `useNavigate()` + `navigate('/admin')` dentro do `handleSubmit` do page (não do hook) | `CreatePost.js` L38 |
| Mock pattern (testes page) | `jest.mock('../../infrastructure/repositories/PostApiRepository')` via constructor function | `CreatePost.test.js` L13-18 |
| Router test pattern | ❗ **NÃO mockar `useNavigate`** diretamente. Usar `MemoryRouter` + `Routes` + `LocationDisplay` | `CreatePost.test.js` L20-44 |
| PostForm reuso | Props: `initialData`, `onSubmit`, `submitLabel`, `loading` | `PostForm.js` L97 |
| Shared components | `<Loading />` (`data-testid: loading-spinner`), `<ErrorMessage />` (`data-testid: error-message`) | Task 05 |
| API data format | `PostApiRepository.findById(id)` retorna raw JSON (não instância de Post) | `PostApiRepository.js` L33-39 |
| UpdatePost use case | `execute({ id, data })` — valida via Value Objects, chama `repository.update(id, validatedData)` | `UpdatePost.js` L10 |
| UpdatePostDTO | Constructor recebe `{ titulo, conteudo, autor, status }`, ignora `undefined` | `UpdatePostDTO.js` |
| Race condition | `usePost` já implementa proteção via `cancelled` flag no cleanup | `usePost.js` L16,41-43 |

### ⚠️ Armadilhas conhecidas (evitar)

1. **React Router v7 + jest.mock parcial** — Não funciona bem com `useNavigate` mockado diretamente. Use padrão `MemoryRouter` + `Routes` + componente `LocationDisplay` (veja `CreatePost.test.js`).
2. **usePostForm não reseta state quando `initialData` muda** — O hook usa `useState(() => ...)` (lazy init), então mudanças em `initialData` após mount **não** re-populam o form. A page deve garantir que `PostForm` só monta **após** o loading terminar (conditional rendering).
3. **UpdatePost precisa de `{ id, data }`** — diferente do CreatePost que recebe DTO diretamente. O DTO é passado dentro de `data`, não como argumento raiz.
4. **`PostForm` com `submitLabel` — o default é "Criar Post"** — na EditPost deve explicitamente passar `submitLabel="Salvar Alterações"`.

---

## Entregáveis

| # | Artefato | Caminho |
|---|----------|---------|
| 1 | `EditPost.test.js` | `src/domains/posts/presentation/pages/EditPost.test.js` |
| 2 | `EditPost.js` | `src/domains/posts/presentation/pages/EditPost.js` |

---

## Especificações Técnicas

### EditPost Page

**Rota:** `/admin/posts/:id/edit` (protegida via PrivateRoute — Task 12)

**Responsabilidades:**
1. Extrair `id` da URL via `useParams()`
2. Instanciar `PostApiRepository` + `GetPost` + `UpdatePost` use cases com `useMemo`
3. Carregar dados existentes via `usePost({ getPostUseCase, id })`
4. Renderizar estados: loading → erro/404 → formulário preenchido
5. No submit, chamar `UpdatePost.execute({ id, data: dto })` e redirecionar para `/admin`

**Assinatura esperada do handler:**

```js
const handleUpdate = useCallback(async (formData) => {
  const dto = new UpdatePostDTO(formData);
  await updatePostUseCase.execute({ id, data: dto });
  navigate('/admin');
}, [updatePostUseCase, id, navigate]);
```

**Renderização condicional (ordem de prioridade):**

```
1. loading === true          → <Loading />
2. error !== null            → <ErrorMessage message={error} /> + botão "Voltar"
3. post !== null             → <PostForm initialData={post} onSubmit={handleUpdate} submitLabel="Salvar Alterações" />
```

> ⚠️ **Crítico:** O `PostForm` **NÃO deve montar** enquanto `loading=true` ou `post=null`. Como `usePostForm` usa lazy init no state, renderizar o form antes dos dados carregados resulta em formulário vazio que não se atualiza.

**`data-testid` obrigatórios:**

| data-testid | Elemento | Conteúdo |
|-------------|----------|----------|
| `edit-post-page` | container (`div` ou `main`) | — |
| `edit-post-title` | `h1` | "Editar Post" |
| `edit-post-loading` | wrapper do Loading | — (aparece apenas durante loading) |
| `edit-post-error` | wrapper do ErrorMessage | — (aparece apenas em erro) |
| `edit-post-btn-back` | `button` | "← Voltar" ou "Voltar" |

> Os testids do `PostForm` (`form-post`, `form-input-titulo`, etc.) continuam sendo os definidos na Task 09.

---

## Padrão de Testes (BDD)

### Estrutura do setup

```js
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from '../../../../shared/contexts/AuthContext';
import { mockAuthRepository } from '../../../../shared/test-utils';
import theme from '../../../../shared/styles/theme';
import EditPostPage from './EditPost';

const mockFindById = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../../infrastructure/repositories/PostApiRepository', () => ({
  __esModule: true,
  default: function MockPostApiRepository() {
    this.findById = mockFindById;
    this.update = mockUpdate;
  },
}));

function LocationDisplay() {
  const location = require('react-router-dom').useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
}

const MOCK_POST = {
  id: '123',
  titulo: 'Post Original',
  conteudo: 'Conteúdo original com mais de dez caracteres',
  autor: 'Professor Teste',
  status: 'published',
  createdAt: '2025-01-15T10:00:00Z',
};

function renderPage(id = '123') {
  const authRepo = mockAuthRepository({
    isAuthenticated: () => true,
    getCurrentUser: () => ({ id: '1', name: 'User' }),
  });
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider authRepository={authRepo}>
        <MemoryRouter initialEntries={[`/admin/posts/${id}/edit`]}>
          <Routes>
            <Route path="/admin/posts/:id/edit" element={<EditPostPage />} />
            <Route path="/admin" element={<LocationDisplay />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

### Cenários de teste

```js
describe('EditPost Page', () => {
  beforeEach(() => {
    mockFindById.mockReset();
    mockUpdate.mockReset();
  });

  describe('enquanto os dados do post estão carregando', () => {
    it('deve exibir o loading spinner (data-testid="edit-post-loading")', () => {
      // mockFindById retorna Promise que nunca resolve
      mockFindById.mockReturnValue(new Promise(() => {}));
      renderPage();
      expect(screen.getByTestId('edit-post-loading')).toBeInTheDocument();
    });

    it('não deve renderizar o PostForm enquanto carrega', () => {
      mockFindById.mockReturnValue(new Promise(() => {}));
      renderPage();
      expect(screen.queryByTestId('form-post')).not.toBeInTheDocument();
    });
  });

  describe('dado que o post existe', () => {
    beforeEach(() => {
      mockFindById.mockResolvedValue(MOCK_POST);
    });

    it('deve carregar e exibir os dados atuais no formulário', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByTestId('form-input-titulo')).toHaveValue('Post Original');
      });
      expect(screen.getByTestId('form-input-conteudo')).toHaveValue(MOCK_POST.conteudo);
      expect(screen.getByTestId('form-input-autor')).toHaveValue(MOCK_POST.autor);
      expect(screen.getByTestId('form-select-status')).toHaveValue('published');
    });

    it('deve renderizar o título "Editar Post"', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByTestId('edit-post-title')).toHaveTextContent('Editar Post');
      });
    });

    it('deve renderizar PostForm com submitLabel="Salvar Alterações"', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByTestId('form-btn-submit')).toHaveTextContent('Salvar Alterações');
      });
    });

    it('não deve exibir loading nem erro após carregar', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByTestId('form-post')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('edit-post-loading')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edit-post-error')).not.toBeInTheDocument();
    });
  });

  describe('dado que o post não existe (404)', () => {
    beforeEach(() => {
      mockFindById.mockRejectedValue(new Error('Post não encontrado'));
    });

    it('deve exibir mensagem de erro "Post não encontrado"', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByTestId('edit-post-error')).toBeInTheDocument();
      });
    });

    it('não deve renderizar o PostForm', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByTestId('edit-post-error')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('form-post')).not.toBeInTheDocument();
    });

    it('deve exibir botão "Voltar" para navegação', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByTestId('edit-post-btn-back')).toBeInTheDocument();
      });
    });
  });

  describe('dado que o docente altera o título e salva', () => {
    beforeEach(() => {
      mockFindById.mockResolvedValue(MOCK_POST);
      mockUpdate.mockResolvedValue({ ...MOCK_POST, titulo: 'Título Alterado' });
    });

    it('deve chamar updatePost com id e os dados atualizados', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('form-input-titulo')).toBeInTheDocument();
      });

      const tituloInput = screen.getByTestId('form-input-titulo');
      await user.clear(tituloInput);
      await user.type(tituloInput, 'Título Alterado');
      await user.click(screen.getByTestId('form-btn-submit'));

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledTimes(1);
      });

      // Verifica que update foi chamado com o id correto
      expect(mockUpdate).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({ titulo: 'Título Alterado' })
      );
    });

    it('deve redirecionar para /admin após sucesso', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('form-input-titulo')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('form-btn-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent('/admin');
      });
    });
  });

  describe('dado que o docente envia dados inválidos', () => {
    beforeEach(() => {
      mockFindById.mockResolvedValue(MOCK_POST);
    });

    it('deve exibir erros de validação sem chamar a API de update', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('form-input-titulo')).toBeInTheDocument();
      });

      const tituloInput = screen.getByTestId('form-input-titulo');
      await user.clear(tituloInput);
      await user.click(screen.getByTestId('form-btn-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('form-error-titulo')).toBeInTheDocument();
      });

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('dado que a API retorna erro ao atualizar', () => {
    beforeEach(() => {
      mockFindById.mockResolvedValue(MOCK_POST);
      mockUpdate.mockRejectedValue(new Error('Erro ao comunicar com a API'));
    });

    it('deve exibir a mensagem de erro no formulário', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('form-input-titulo')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('form-btn-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('form-error-message')).toBeInTheDocument();
      });
    });

    it('não deve redirecionar', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('form-input-titulo')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('form-btn-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('form-error-message')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('location-display')).not.toBeInTheDocument();
    });
  });

  describe('botão Voltar', () => {
    it('deve navegar para /admin ao clicar', async () => {
      mockFindById.mockResolvedValue(MOCK_POST);
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('edit-post-btn-back')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('edit-post-btn-back'));

      await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent('/admin');
      });
    });
  });
});
```

---

## Implementação Esperada (Referência)

```js
// EditPost.js
import { useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PostApiRepository from '../../infrastructure/repositories/PostApiRepository';
import GetPost from '../../application/usecases/GetPost';
import UpdatePost from '../../application/usecases/UpdatePost';
import UpdatePostDTO from '../../application/dto/UpdatePostDTO';
import usePost from '../hooks/usePost';
import PostForm from '../components/PostForm';
import Loading from '../../../../shared/components/Loading';
import ErrorMessage from '../../../../shared/components/ErrorMessage';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`;

const BackButton = styled.button`
  /* styled similar to PostDetail back button */
`;

function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const repository = useMemo(() => new PostApiRepository(), []);
  const getPostUseCase = useMemo(() => new GetPost(repository), [repository]);
  const updatePostUseCase = useMemo(() => new UpdatePost(repository), [repository]);

  const { post, loading, error } = usePost({ getPostUseCase, id });

  const handleUpdate = useCallback(async (formData) => {
    const dto = new UpdatePostDTO(formData);
    await updatePostUseCase.execute({ id, data: dto });
    navigate('/admin');
  }, [updatePostUseCase, id, navigate]);

  return (
    <Container data-testid="edit-post-page">
      <BackButton data-testid="edit-post-btn-back" onClick={() => navigate('/admin')}>
        ← Voltar
      </BackButton>
      <Title data-testid="edit-post-title">Editar Post</Title>

      {loading && (
        <div data-testid="edit-post-loading">
          <Loading />
        </div>
      )}

      {error && !loading && (
        <div data-testid="edit-post-error">
          <ErrorMessage message={error} />
        </div>
      )}

      {post && !loading && (
        <PostForm
          initialData={post}
          onSubmit={handleUpdate}
          submitLabel="Salvar Alterações"
        />
      )}
    </Container>
  );
}

export default EditPostPage;
```

---

## Observações Críticas (Tech Lead & QA)

### 🏗️ Arquitetura

1. **Reutilize `usePost` exatamente como implementado na Task 08.** Não criar hook novo. O hook já gerencia loading, error e race condition.
2. **Não expor `handleUpdate` para fora do componente page.** O handler é responsabilidade exclusiva do composer (page).
3. **Respeitar a separação DTO ↔ Use Case:** O page cria o `UpdatePostDTO`, passa para `execute({ id, data: dto })`. O Use Case valida via Value Objects antes de chamar o repository.
4. **Instanciar apenas UM `PostApiRepository`.** Reutilizá-lo tanto para `GetPost` quanto para `UpdatePost`, assim como faria em produção.

### 🧪 Qualidade de Testes

5. **Testar o estado intermediário de loading.** Usar `new Promise(() => {})` (never-resolving) para capturar o snapshot de loading sem race.
6. **Garantir que PostForm NÃO renderiza durante loading.** Esse é um bug sutil — se renderizar antes dos dados, `usePostForm` inicializa com campos vazios e nunca atualiza (lazy init do `useState`).
7. **Não testar validação do formulário em detalhe no teste da page.** A validação é responsabilidade do `PostForm`/`usePostForm` (já 100% coberta na Task 09). Testar apenas um cenário de validação para provar integração.
8. **Mock do `findById` e `update` no MESMO mock do repository.** Não criar mocks separados — reflete a realidade de um único repository.
9. **Testar que o `mockUpdate` recebe o id correto.** É o diferencial do EditPost vs CreatePost — o id precisa fluir corretamente de `useParams` → `handleUpdate` → `useCase.execute({ id, data })` → `repository.update(id, ...)`.

### 🐛 Edge Cases

10. **Post carregado com campos opcionais faltando** (ex: `status` pode ser undefined no backend). O `PostForm` já trata via `DEFAULT_FORM_DATA` merge no `usePostForm`, mas o teste deve cobrir esse cenário.
11. **Duplo clique no botão submit.** O `PostForm` já desabilita o botão durante `loading`, mas vale um teste de sanidade.
12. **Navegação direta via URL** (`/admin/posts/123/edit`) deve funcionar standalone — o teste já garante isso via `MemoryRouter` com `initialEntries`.

### ♿ Acessibilidade

13. **Botão "Voltar" com texto legível** — usar texto visível "← Voltar" (dispensa aria-label).
14. **Loading deve ter `role` ou `aria-label`** — já coberto pelo componente `<Loading />` compartilhado.

---

## Critérios de Aceite — Definition of Done

- [x] Testes escritos ANTES da implementação (TDD)
- [x] Padrão BDD nos describes
- [x] Todos os `data-testid` especificados presentes e corretos
- [x] Rota protegida (integração com PrivateRoute na Task 12)
- [x] Carrega dados existentes via `usePost` (Task 08) — não reimplementar fetch
- [x] `PostForm` recebe `initialData` preenchido — NÃO renderiza antes dos dados carregarem
- [x] Consome API via Use Cases `GetPost` + `UpdatePost` + `UpdatePostDTO`
- [x] Instância única de `PostApiRepository` compartilhada entre use cases
- [x] `submitLabel="Salvar Alterações"` (não usar default "Criar Post")
- [x] Redirect para `/admin` após sucesso (não para `/posts/:id`)
- [x] Botão "Voltar" sempre visível (mesmo em estado de erro)
- [x] Responsivo (max-width 800px, padding adaptativo)
- [x] Cobertura ≥ 80% no arquivo `EditPost.js` (100% atingido)
- [x] Nenhum `console.log` ou `console.error` esquecido
- [x] Não quebra testes existentes (413 testes passando)
- [x] Sem dependências novas — tudo necessário já existe no projeto

---

## Dependências desta Task

| Depende de | Status | O que usa |
|-----------|--------|-----------|
| Task 02 — Entidade `Post`, Value Objects | ✅ | Validação no UpdatePost |
| Task 03 — Use Cases `GetPost`, `UpdatePost`, `UpdatePostDTO` | ✅ | Orquestração da page |
| Task 04 — `PostApiRepository.findById`, `.update` | ✅ | Infra HTTP |
| Task 05 — `<Loading />`, `<ErrorMessage />` | ✅ | Feedback visual |
| Task 08 — `usePost` hook | ✅ | Carregamento de dados |
| Task 09 — `PostForm`, `usePostForm` | ✅ | Formulário reutilizável |

## Bloqueia

| Task | Motivo |
|------|--------|
| Task 11 — Admin Page | Precisa do link "Editar" apontar para `/admin/posts/:id/edit` |
| Task 12 — Routing Integration | Precisa da rota protegida registrada |
| Task 13 — E2E Tests | Depende dos `data-testid` definidos aqui |

---

## Estimativa

| Item | Esforço |
|------|---------|
| Testes (TDD) | ~30 min |
| Implementação | ~20 min |
| Review + ajustes | ~10 min |
| **Total** | **~1h** |

> **Nota:** Baixa complexidade. 80% do trabalho é orquestração de peças existentes. O risco está apenas em garantir a renderização condicional correta (PostForm só monta após dados carregarem).
