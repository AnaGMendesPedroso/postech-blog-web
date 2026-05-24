# Task 09 — Página de Criação de Post (CreatePost)

## Objetivo

Implementar a página de criação de postagens para docentes, com formulário validado e integração com o Use Case `CreatePost`. O componente `PostForm` deve ser projetado para reuso na Task 10 (EditPost), evitando duplicação.

---

## ✅ Status: IMPLEMENTADO

### Resultados

- **51 testes** escritos e passando (27 hook + 19 componente + 5 page)
- **100% cobertura** em Statements, Branches, Functions e Lines
- **0 warnings** de lint
- **0 regressões** no test suite existente (397 testes totais passando)

---

## Contexto Arquitetural

Este projeto segue **Clean Architecture** com camadas bem definidas:

| Camada | Responsabilidade | Exemplo existente |
|--------|-----------------|-------------------|
| Domain | Value Objects, Entities | `PostTitle`, `PostContent`, `PostStatus` |
| Application | Use Cases, DTOs | `CreatePost.js`, `CreatePostDTO.js` |
| Infrastructure | Repositórios HTTP | `PostApiRepository.js` |
| Presentation | Pages, Hooks, Components | `PostDetail.js`, `usePost.js` |

**Dependências já existentes no projeto:**
- `react-router-dom` v7 (useNavigate, useParams)
- `styled-components` v6 (ThemeProvider, tema centralizado)
- `@testing-library/react` v16 + `@testing-library/user-event` v14
- Shared: `Loading`, `ErrorMessage`, `PrivateRoute`, `AuthContext`
- Use Case `CreatePost` já implementado (valida via Value Objects)
- `CreatePostDTO` já existente

**Padrão de instanciação de dependências (seguir referência em `PostDetail.js`):**
```js
const repository = useMemo(() => new PostApiRepository(), []);
const createPostUseCase = useMemo(() => new CreatePost(repository), [repository]);
```

---

## Entregáveis

| # | Artefato | Caminho | Status |
|---|----------|---------|--------|
| 1 | `usePostForm.test.js` | `src/domains/posts/presentation/hooks/` | ✅ 27 testes |
| 2 | `usePostForm.js` | `src/domains/posts/presentation/hooks/` | ✅ 100% coverage |
| 3 | `PostForm.test.js` | `src/domains/posts/presentation/components/` | ✅ 19 testes |
| 4 | `PostForm.js` | `src/domains/posts/presentation/components/` | ✅ 100% coverage |
| 5 | `CreatePost.test.js` | `src/domains/posts/presentation/pages/` | ✅ 5 testes |
| 6 | `CreatePost.js` | `src/domains/posts/presentation/pages/` | ✅ 100% coverage |

---

## O Que Foi Implementado

### 1. `usePostForm` — Hook de Gerenciamento de Formulário

**Responsabilidade:** Encapsula estado, validação client-side e orquestração de submit. Recebe `onSubmit` como callback (desacoplado do Use Case).

**Interface implementada:**
```js
function usePostForm({ initialData, onSubmit }) {
  return {
    formData: { titulo, conteudo, autor, status },
    errors: { titulo?, conteudo?, autor? },
    loading: boolean,
    handleChange: (field, value) => void,
    handleSubmit: () => Promise<void>,
    isValid: boolean,
    apiError: string | null
  };
}
```

**Validações implementadas (idênticas aos Value Objects):**

| Campo | Regra | Mensagem |
|-------|-------|----------|
| titulo | obrigatório (trim) | "O título é obrigatório" |
| titulo | min 3 chars (trim) | "O título deve ter no mínimo 3 caracteres" |
| titulo | max 200 chars (trim) | "O título deve ter no máximo 200 caracteres" |
| conteudo | obrigatório (trim) | "O conteúdo é obrigatório" |
| conteudo | min 10 chars (trim) | "O conteúdo deve ter no mínimo 10 caracteres" |
| autor | obrigatório (trim) | "O autor é obrigatório" |

**Comportamentos implementados:**
- `handleChange` limpa erro do campo + limpa `apiError`
- `handleSubmit` valida → se inválido seta `errors` e retorna → se válido, `loading=true`, chama `onSubmit`, captura erros em `apiError`, `loading=false` em `finally`
- `isValid` derivado de formData + errors
- Estado inicial mesclado com `initialData`

### 2. `PostForm` — Componente Reutilizável

**Props implementadas:**
- `initialData` — dados iniciais do formulário (para edição)
- `onSubmit` — callback async
- `submitLabel` — label do botão (default: "Criar Post")
- `loading` — external loading state

**Usa `usePostForm` internamente** — self-contained, testável isoladamente.

**`data-testid` implementados:**

| data-testid | Elemento |
|-------------|----------|
| `form-post` | `<form>` |
| `form-input-titulo` | `<input type="text">` |
| `form-input-conteudo` | `<textarea rows=10>` |
| `form-input-autor` | `<input type="text">` |
| `form-select-status` | `<select>` (draft/published) |
| `form-btn-submit` | `<button type="submit">` |
| `form-error-titulo` | `<span>` |
| `form-error-conteudo` | `<span>` |
| `form-error-autor` | `<span>` |
| `form-error-message` | `<div>` (wrapper do ErrorMessage) |

**Acessibilidade:**
- ✅ Labels com `htmlFor` associados
- ✅ `aria-invalid="true"` nos campos com erro
- ✅ `aria-describedby` apontando para spans de erro
- ✅ Botão mostra "Enviando..." e `disabled` durante loading

**Estilização:**
- ✅ styled-components com tema
- ✅ Borda vermelha em campos com erro
- ✅ Responsivo (max-width 720px, full-width inputs)

### 3. `CreatePost` — Page (Composer)

**Rota planejada:** `/admin/posts/new` (protegida via PrivateRoute — Task 12)

**Comportamento implementado:**
1. Instancia `PostApiRepository` e `CreatePost` use case via `useMemo`
2. `handleCreate` cria `CreatePostDTO`, executa use case, navega para `/admin`
3. Renderiza `PostForm` com `submitLabel="Criar Post"`
4. Title da página com `data-testid="create-post-title"`

---

## Decisões Técnicas Aplicadas

| Decisão | Justificativa |
|---------|---------------|
| Validação duplicada (client + Use Case) | UX rápida no client, integridade no domínio |
| `usePostForm` interno ao `PostForm` | Componente self-contained, API simples |
| Não mockear `useNavigate` diretamente | React Router v7 com moduleNameMapper conflita; usado Routes + LocationDisplay nos testes |
| Mock via constructor function | `jest.fn().mockImplementation` não funciona com classes ES6 importadas via jest moduleNameMapper |
| `apiError` separado de `errors` | Erros de validação vs erros de rede/servidor |

---

## Testes Cobertos

### usePostForm (27 testes)
- Estado inicial (4): defaults, merge, isValid
- handleChange (3): atualização, limpeza de erros, limpeza de apiError
- Validação no submit (12): título vazio/curto/longo, conteúdo vazio/curto, autor vazio/espaços, múltiplos erros, boundary (3/200/10 chars), onSubmit não chamado
- Submit sucesso (3): loading true/false, onSubmit chamado
- Submit erro (4): apiError setado, loading false, formData preservado, apiError limpo em novo submit

### PostForm (19 testes)
- Renderização (5): campos, botão, initialData, status padrão
- Interação (4): digitação em todos os campos + select
- Validação client-side (3): título, conteúdo, autor
- Submissão (3): dados enviados, botão disabled, texto "Enviando..."
- Erro de API (2): exibição e limpeza
- Acessibilidade (2): labels e aria-invalid

### CreatePost Page (5 testes)
- Sucesso: redirecionamento para /admin, mockCreate chamado
- Erro: form-error-message exibido, sem redirecionamento
- Integração: submitLabel, título da página

---

## Critérios de Aceite — Checklist Final

- [x] Testes escritos ANTES da implementação (TDD)
- [x] Padrão BDD nos describes
- [x] Todos os `data-testid` especificados presentes
- [x] Validação client-side com mensagens idênticas aos Value Objects
- [x] Consome API via Use Case `CreatePost` + `CreatePostDTO`
- [x] `PostForm` reutilizável — zero acoplamento com page
- [x] styled-components com tema do projeto
- [x] Responsivo
- [x] Nenhum `console.log` esquecido
- [x] Sem warnings de lint
- [x] Cobertura = 100% nos arquivos entregues
- [x] Não quebra testes existentes (397 testes passando)
