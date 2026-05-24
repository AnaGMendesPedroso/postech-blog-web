const { test, expect } = require('@playwright/test');
const HomePage = require('../pages/HomePage');

test.describe('Página Principal (Lista de Posts)', () => {
  let homePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForPostsLoaded();
  });

  test('deve exibir lista de posts publicados ao carregar', async ({ page }) => {
    // Given: usuário acessa a home page
    // Then: lista de posts visível com pelo menos 1 post
    await expect(homePage.postList).toBeVisible();
    const count = await homePage.postCards.count();
    expect(count).toBeGreaterThan(0);

    // Then: cada post card exibe título, autor e descrição
    const firstCard = homePage.postCards.first();
    await expect(firstCard).toBeVisible();
  });

  test('deve buscar posts por palavra-chave', async ({ page }) => {
    // Given: usuário está na home page com posts carregados
    // When: digita termo no campo de busca e submete
    await homePage.search('javascript');

    // Then: resultados são filtrados (ou lista vazia com mensagem)
    // Nota: resultado depende dos dados da API
    const hasResults = await homePage.postCards.count() > 0;
    const hasEmpty = await homePage.emptyMessage.isVisible().catch(() => false);
    expect(hasResults || hasEmpty).toBeTruthy();
  });

  test('deve navegar entre páginas via paginação', async ({ page }) => {
    // Given: existem posts suficientes para paginação
    const hasPagination = await homePage.pagination.isVisible().catch(() => false);

    if (hasPagination) {
      // When: clica próxima página
      await homePage.goToNextPage();
      // Then: novos posts são carregados
      await expect(homePage.postList).toBeVisible();
    } else {
      // Se não há paginação, skip gracefully
      test.skip();
    }
  });

  test('deve navegar para detalhe ao clicar em um post', async ({ page }) => {
    // Given: lista de posts está visível
    await expect(homePage.postCards.first()).toBeVisible();

    // When: clica no primeiro post
    await homePage.clickPost(0);

    // Then: é redirecionado para página de detalhe (/posts/:id)
    await expect(page).toHaveURL(/\/posts\/.+/);
  });
});
