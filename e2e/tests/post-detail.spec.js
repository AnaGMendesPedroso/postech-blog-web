const { test, expect } = require('@playwright/test');
const HomePage = require('../pages/HomePage');
const PostDetailPage = require('../pages/PostDetailPage');

test.describe('Leitura de Post', () => {
  test('deve exibir conteúdo completo do post', async ({ page }) => {
    // Given: navega via home para garantir post válido
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForPostsLoaded();
    await homePage.clickPost(0);

    // Then: página de detalhe exibe título, autor, data e conteúdo completo
    const detailPage = new PostDetailPage(page);
    await detailPage.waitForLoaded();

    await expect(detailPage.title).toBeVisible();
    await expect(detailPage.title).not.toBeEmpty();
    await expect(detailPage.author).toBeVisible();
    await expect(detailPage.content).toBeVisible();
    await expect(detailPage.content).not.toBeEmpty();
  });

  test('deve voltar para home ao clicar em "Voltar"', async ({ page }) => {
    // Given: usuário está na página de detalhe
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForPostsLoaded();
    await homePage.clickPost(0);

    const detailPage = new PostDetailPage(page);
    await detailPage.waitForLoaded();

    // When: clica no botão "Voltar"
    await detailPage.goBack();

    // Then: é redirecionado para a home
    await expect(page).toHaveURL('/');
  });

  test('deve exibir erro para post inexistente', async ({ page }) => {
    // Given: usuário acessa URL com id inválido
    const detailPage = new PostDetailPage(page);
    await detailPage.goto('id-que-nao-existe-000000');
    await detailPage.waitForLoaded();

    // Then: mensagem de erro é exibida
    await expect(detailPage.errorMessage).toBeVisible();
  });
});
