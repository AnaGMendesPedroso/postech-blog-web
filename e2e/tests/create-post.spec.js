const { test, expect } = require('@playwright/test');
const CreatePostPage = require('../pages/CreatePostPage');
const AdminPage = require('../pages/AdminPage');
const { loginAsTeacher } = require('../helpers/auth');
const testData = require('../fixtures/test-data.json');

test.describe('Criação de Post', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTeacher(page);
  });

  test('deve criar post com dados válidos e redirecionar para admin', async ({ page }) => {
    // Given: professor acessa formulário de criação
    const createPage = new CreatePostPage(page);
    await createPage.goto();

    // When: preenche campos com dados válidos e submete
    const uniqueTitle = `Post Criar E2E ${Date.now()}`;
    await createPage.fillForm({
      titulo: uniqueTitle,
      conteudo: testData.validPost.conteudo,
      autor: testData.validPost.autor,
      status: 'published',
    });
    await createPage.submit();

    // Then: é redirecionado para /admin
    await expect(page).toHaveURL(/\/admin/);

    // Then: post criado aparece na lista (usar tr para evitar strict mode com CardList mobile)
    const adminPage = new AdminPage(page);
    await adminPage.waitForLoaded();
    const row = page.locator(`tr:has-text("${uniqueTitle}")`);
    await expect(row).toBeVisible();

    // Cleanup: deletar post criado
    const deleteButton = row.locator('[data-testid^="admin-btn-delete-"]');
    await deleteButton.click();
    await adminPage.confirmDelete();
  });

  test('deve exibir erros de validação com dados inválidos', async ({ page }) => {
    // Given: professor acessa formulário de criação
    const createPage = new CreatePostPage(page);
    await createPage.goto();

    // When: submete com campos vazios
    await createPage.submit();

    // Then: erros de validação são exibidos
    await expect(createPage.errorTitulo).toBeVisible();
    await expect(createPage.errorConteudo).toBeVisible();
    await expect(createPage.errorAutor).toBeVisible();

    // Then: permanece na mesma página
    await expect(page).toHaveURL(/\/admin\/posts\/new/);
  });
});
