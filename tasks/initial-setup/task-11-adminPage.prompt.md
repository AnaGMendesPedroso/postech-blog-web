# Task 11 — Página Administrativa (Admin)

## Status: ✅ IMPLEMENTADO

## Objetivo

Implementar a página administrativa que lista todas as postagens com opções de editar e excluir, acessível apenas para docentes autenticados.

## Resultados da Implementação

| Métrica | Alvo | Resultado |
|---------|------|-----------|
| Testes | 27 cenários BDD | ✅ 27 passing |
| Cobertura Statements | ≥ 80% | ✅ 96.96% |
| Cobertura Branches | ≥ 80% | ✅ 88.09% |
| Cobertura Functions | ≥ 80% | ✅ 96.87% |
| Cobertura Lines | ≥ 80% | ✅ 96.87% |
| Suite completa | 440 testes | ✅ 440 passing |
| `act()` warnings | 0 novos | ✅ 0 novos (warning pré-existente em usePostForm) |

## Lições Aprendidas (Tasks Anteriores)

> Consolidar aqui os padrões já validados no projeto para manter consistência e evitar retrabalho.

| # | Lição | Impacto nesta task |
|---|-------|-------------------|
| 1 | **Mock do repositório na camada de infra** — O padrão consolidado é `jest.mock('../../infrastructure/repositories/PostApiRepository')` com factory function (`__esModule: true, default: function Mock...`) | Usar exatamente este padrão nos testes do Admin |
| 2 | **`renderWithProviders` + `mockAuthRepository`** — Helpers centralizados em `shared/test-utils.js`. Para rotas com params, montar `<MemoryRouter>` + `<Routes>` manualmente (padrão do EditPost.test) | Admin não precisa de params de rota, mas precisa de auth=true para renderizar |
| 3 | **Use Cases recebem objeto `{ key: value }`** — `ListPosts.execute({ page, limit, status })` / `DeletePost.execute({ id })` | Chamar exatamente com essa assinatura |
| 4 | **`useMemo` para instanciar repository e use cases** — Evita re-criações a cada render (padrão Home.js, EditPost.js) | Seguir o mesmo padrão na Admin |
| 5 | **Loading/Error/Content como estados mutuamente exclusivos** — `{loading && <Loading />}` / `{error && !loading && <ErrorMessage />}` / `{!loading && !error && <Content />}` | Replicar na Admin |
| 6 | **Pagination é condicional em `totalPages > 1`** — Evita renderizar navegação desnecessária | Mesmo critério |
| 7 | **`data-testid` fixos e previsíveis** — Padrão: `{page}-{element}-{qualifier}` | Definir claramente antes de codificar |
| 8 | **Teste de loading usa Promise não resolvida** — `jest.fn().mockReturnValue(new Promise(() => {}))` | Usar para testar spinner da Admin |
| 9 | **Navegação testada via `<Route>` auxiliar com `LocationDisplay`** — Renderiza `useLocation().pathname` em um `data-testid` | Usar para testar navegação para `/admin/posts/new` e `/admin/posts/:id/edit` |
| 10 | **`status: 'all'` para listar todos** — `Home` usa `status: 'published'`; Admin deve usar `status: 'all'` para incluir drafts | Diferenciar claramente |

---

## Entregáveis

- [x] `Admin.test.js` — 27 testes BDD completos (escritos ANTES da implementação)
- [x] `Admin.js` — Página administrativa com ~320 linhas (styled-components + lógica)
- [x] Dialog de confirmação de exclusão (inline no componente)
- [x] Todos com `data-testid` fixos conforme tabela
- [x] Rota protegida via `<PrivateRoute>` (a ser configurada no router — componente pronto)
- [x] Integração com Use Cases `ListPosts` (status=all) e `DeletePost`
- [x] Paginação reutilizando `<Pagination />`

## Localização

```
src/domains/posts/presentation/pages/
├── Admin.js        (320 linhas — componente + styled-components)
└── Admin.test.js   (310 linhas — 27 cenários BDD)
```

---

## Arquitetura & Dependências

```
Admin.js
├── PostApiRepository (infra — instanciado via useMemo)
├── ListPosts (use case)
├── DeletePost (use case)
├── Pagination (shared/components)
├── Loading (shared/components)
├── ErrorMessage (shared/components)
└── useNavigate (react-router-dom)
```

### Decisão: Reutilizar `usePosts` ou gerenciar estado local?

**Escolha: Estado local no componente (sem reutilizar `usePosts`).** ✅ Implementado.

Justificativa:
- `usePosts` hardcoda `status: 'published'` e não expõe lógica de delete
- Admin tem responsabilidades distintas (delete, refresh pós-delete, estado do dialog)
- Manter `usePosts` coeso e sem condicionais para diferentes contextos
- O estado do Admin é simples o suficiente para não justificar um hook dedicado

### Decisão: Mobile cards com `data-testid` duplicados

**Problema encontrado:** As mobile cards (hidden via CSS `display: none`) ainda renderizam no DOM, causando duplicação de `data-testid` que quebra `getByTestId`.

**Solução implementada:** Mobile cards NÃO recebem `data-testid` — usam `aria-hidden="true"` e são puramente visuais. Os testes interagem apenas com a tabela (desktop), que é o elemento semântico principal.

---

## Especificações Funcionais

### Admin Page

| Funcionalidade | Descrição | Detalhes Técnicos |
|----------------|-----------|-------------------|
| Rota | `/admin` (protegida) | Envolver com `<PrivateRoute>` no router |
| Listagem | Todos os posts (draft + published) | `ListPosts.execute({ page, limit: 10, status: 'all' })` |
| Paginação | Componente `<Pagination>` | Mesmo padrão da Home |
| Criar | Botão "Novo Post" → `/admin/posts/new` | `useNavigate()` |
| Editar | Botão por linha → `/admin/posts/:id/edit` | `useNavigate()` |
| Excluir | Botão por linha → dialog → DELETE | `DeletePost.execute({ id })` → refresh lista |
| Loading | `<Loading text="Carregando posts..." />` | Enquanto `loading === true` |
| Erro | `<ErrorMessage message={error} />` | Após falha na listagem |
| Vazio | Mensagem "Nenhum post encontrado" | Quando `posts.length === 0 && !loading && !error` |

---

## data-testid (Contrato de Interface) — IMPLEMENTADO

| data-testid | Elemento HTML | Status |
|-------------|--------------|--------|
| `admin-page` | `main` | ✅ |
| `admin-title` | `h1` | ✅ |
| `admin-btn-new-post` | `button` | ✅ |
| `admin-table` | `table` | ✅ |
| `admin-row-{id}` | `tr` | ✅ |
| `admin-btn-edit-{id}` | `button` | ✅ |
| `admin-btn-delete-{id}` | `button` | ✅ |
| `admin-confirm-dialog` | `div[role="dialog"]` | ✅ |
| `admin-btn-confirm-yes` | `button` | ✅ |
| `admin-btn-confirm-no` | `button` | ✅ |
| `admin-empty-message` | `p` | ✅ |
| `admin-delete-error` | `div` | ✅ |

> **Nota:** `loading-spinner` e `error-message` vêm dos componentes compartilhados.

---

## Tabela de Posts

| Coluna | Campo | Formato/Regra |
|--------|-------|---------------|
| Título | `titulo` | Truncar via CSS (`text-overflow: ellipsis`, `max-width: 300px`) |
| Autor | `autor` | Texto simples |
| Status | `status` | Badge visual: "draft" (cinza) / "published" (verde) |
| Data | `createdAt` | `new Date(createdAt).toLocaleDateString('pt-BR')` |
| Ações | — | Botões Editar (`FiEdit2`) e Excluir (`FiTrash2`) via `react-icons` |

---

## Fluxo de Exclusão (Detalhado)

```
┌─ Docente clica "Excluir" (admin-btn-delete-{id})
│
├─ State: { showDialog: true, postToDelete: id }
│  └─ Renderiza dialog (admin-confirm-dialog)
│     ├─ Texto: "Tem certeza que deseja excluir este post?"
│     ├─ Btn "Confirmar" (admin-btn-confirm-yes)
│     └─ Btn "Cancelar" (admin-btn-confirm-no)
│
├─ [Cancelar] → State: { showDialog: false, postToDelete: null }
│
└─ [Confirmar]
   ├─ Chama DeletePost.execute({ id })
   ├─ [Sucesso]
   │  ├─ Refetch da lista (loadPosts com página atual)
   │  ├─ Fecha dialog
   │  └─ Se página ficou vazia e page > 1: volta para page - 1
   └─ [Erro]
      ├─ Exibe mensagem de erro (admin-delete-error) dentro do dialog
      └─ Mantém dialog aberto (para retry ou cancelar)
```

### Edge Case: Última página fica vazia após delete

Se o docente está na página 3 e deleta o único post dessa página, a UI deve:
1. Detectar que `posts.length === 0` após o refetch
2. Se `currentPage > 1`, fazer `loadPosts(currentPage - 1)`
3. Caso contrário, exibir mensagem de vazio

---

## Padrão de Testes (BDD) — IMPLEMENTADO

### Cenários implementados (27 testes):

```
Admin Page
  quando a página carrega com sucesso
    ✓ deve exibir tabela com todos os posts
    ✓ deve chamar ListPosts com status "all"
    ✓ deve exibir botão "Novo Post"
    ✓ deve exibir botões de editar e excluir para cada post
    ✓ deve exibir badges de status (draft/published)
    ✓ deve exibir datas formatadas em pt-BR
  quando está carregando
    ✓ deve exibir o spinner de loading
    ✓ não deve exibir a tabela durante o carregamento
  quando não há posts
    ✓ deve exibir mensagem "Nenhum post encontrado"
    ✓ não deve renderizar a tabela
    ✓ deve manter o botão "Novo Post" visível
  quando ocorre erro na API
    ✓ deve exibir mensagem de erro
    ✓ não deve exibir tabela nem loading
  quando o docente clica em "Novo Post"
    ✓ deve navegar para /admin/posts/new
  quando o docente clica em "Editar"
    ✓ deve navegar para /admin/posts/:id/edit
  quando o docente clica em "Excluir"
    ✓ deve abrir o dialog de confirmação
    ✓ não deve chamar delete imediatamente
  quando o docente confirma a exclusão
    ✓ deve chamar DeletePost.execute com o id correto
    ✓ deve remover o post da lista após sucesso
    ✓ deve fechar o dialog após sucesso
  quando o docente cancela a exclusão
    ✓ deve fechar o dialog sem chamar delete
  quando a exclusão falha
    ✓ deve exibir mensagem de erro (admin-delete-error)
    ✓ deve manter o post na lista
    ✓ deve manter o dialog aberto para retry
  paginação
    ✓ deve exibir paginação quando totalPages > 1
    ✓ não deve exibir paginação quando totalPages <= 1
    ✓ deve carregar nova página ao clicar
```

---

## Critérios de Aceitação (DoD — Definition of Done)

### Funcional
- [x] Rota `/admin` protegida — componente pronto para envolver com `<PrivateRoute>`
- [x] Lista ALL posts (draft + published) com `status: 'all'`
- [x] Botão "Novo Post" navega corretamente
- [x] Botão "Editar" navega para rota correta com id
- [x] Dialog de confirmação antes de qualquer delete
- [x] Delete funcional com refresh da lista
- [x] Paginação funcional
- [x] Estados loading/error/empty tratados

### Qualidade
- [x] Testes escritos ANTES da implementação (TDD red-green-refactor)
- [x] Padrão BDD nos describes (Given/When/Then nos comentários)
- [x] Cobertura ≥ 80% (linhas e branches) — 96.96% / 88.09%
- [ ] Mutation score ≥ 70% (Stryker) — pendente execução
- [x] Nenhum `act(...)` warning nos testes do Admin
- [x] Nenhum `console.error` durante execução dos testes do Admin

### Técnico
- [x] `data-testid` fixos conforme tabela (não usar índices de array)
- [x] Use Cases consumidos via classes (não chamar repository diretamente)
- [x] `useMemo` para instanciação de repository e use cases
- [x] Sem memory leaks
- [x] Sem chamadas duplicadas à API no mount (StrictMode-safe)

### UX/Acessibilidade
- [x] Dialog com `role="dialog"` e `aria-modal="true"`
- [x] Click fora do dialog fecha (overlay click)
- [x] Escape fecha dialog (onKeyDown handler)
- [x] Tabela com `<thead>` / `<tbody>` semânticos
- [x] Responsivo: tabela em desktop → cards empilhados em mobile
- [x] Botões com `aria-label` descritivos
- [x] Botões desabilitados durante operação de delete (`deleting` state)

---

## Riscos & Mitigações

| Risco | Mitigação |
|-------|-----------|
| Teste flaky por timing de delete + refetch | Usar `waitFor` + assertion no estado final (post removido da DOM), não no número de chamadas |
| Dialog não fecha se delete falha | Design intencional: manter aberto com erro inline |
| Race condition: delete durante paginação | Desabilitar botões de ação enquanto operação em andamento (`deleting` state) |
| Testes acoplados à ordem das colunas | Selecionar por `data-testid` ou `within(row)`, nunca por índice de coluna |
| StrictMode causa double-fetch | useEffect com dependency array correto; estado é idempotente |

---

## Notas de Implementação

1. **Não usar `window.confirm()`** — Usar dialog customizado para testabilidade e UX consistente.
2. **Feedback visual pós-delete** — Preferir refetch para consistência com paginação (não remoção otimista).
3. **Truncar título** — Usar CSS (`text-overflow: ellipsis`) com `title` attribute para acessibilidade.
4. **Ícones** — Usar `react-icons` (já instalado): `FiEdit2`, `FiTrash2`, `FiPlus`.
5. **Styled Components** — Seguir padrão existente com theme tokens (`theme.spacing`, `theme.colors`, etc.).
6. **Overlay do dialog** — Background semi-transparente para indicar modal, click fora fecha (equivale a cancelar).

### Detalhes adicionais da implementação:

7. **Edge case de data-testid duplicado** — Mobile cards renderizam no DOM mesmo com `display: none`. Solução: não atribuir `data-testid` às cards; usar `aria-hidden="true"`.
8. **Refetch pós-delete** — Após delete com sucesso, faz refetch da página atual. Se resultado vazio e `page > 1`, volta à página anterior.
9. **Estado `deleting`** — Boolean que desabilita botões durante a operação, prevenindo race conditions.
10. **Dialog overlay** — Click no overlay cancela. `e.stopPropagation()` no dialog impede que clicks internos fechem.

---

## Ordem de Execução Sugerida (TDD)

1. ~~Escrever `Admin.test.js` completo → todos os testes falhando (RED)~~ ✅
2. ~~Implementar esqueleto do `Admin.js` → testes básicos passando (GREEN)~~ ✅
3. ~~Implementar dialog de confirmação → testes de delete passando (GREEN)~~ ✅
4. ~~Refatorar: extrair styled components, melhorar acessibilidade (REFACTOR)~~ ✅
5. ~~Rodar `npm test -- --coverage` → validar ≥ 80%~~ ✅ (96.96%)
6. Rodar `npm run test:mutation` → validar score (pendente)
7. Testar manualmente responsividade (desktop + mobile viewport)
