const { test, expect } = require('@playwright/test');
const EditPostPage = require('../pages/EditPostPage');
const AdminPage = require('../pages/AdminPage');
const { loginAsTeacher, createTestPost } = require('../helpers/auth');
const testData = require('../fixtures/test-data.json');

test.describe('Edição de Post', () => {
  let testPostTitle;

  test.beforeEach(async ({ page }) => {
    await loginAsTeacher(page);
    // Criar post de teste exclusivo para edição
    testPostTitle = `Post Editar E2E ${Date.now()}`;
    await createTestPost(page, { ...testData.validPost, titulo: testPostTitle });
  });

  test('deve carregar dados existentes no formulário', async ({ page }) => {
    // Given: professor navega para edição do post
    const adminPage = new AdminPage(page);
    await adminPage.waitForLoaded();

    // Encontrar e clicar no botão editar do post de teste
    const row = page.locator(`tr:has-text("${testPostTitle}")`);
    const editButton = row.locator('[data-testid^="admin-btn-edit-"]');
    await editButton.click();

    // Then: formulário é carregado com dados do post
    const editPage = new EditPostPage(page);
    await editPage.waitForLoaded();

    await expect(editPage.tituloInput).toHaveValue(testPostTitle);
    await expect(editPage.conteudoInput).toHaveValue(testData.validPost.conteudo);
    await expect(editPage.autorInput).toHaveValue(testData.validPost.autor);
  });

  test('deve salvar alterações e redirecionar para admin', async ({ page }) => {
    // Given: professor está editando o post de teste
    const adminPage = new AdminPage(page);
    await adminPage.waitForLoaded();

    const row = page.locator(`tr:has-text("${testPostTitle}")`);
    const editButton = row.locator('[data-testid^="admin-btn-edit-"]');
    await editButton.click();

    const editPage = new EditPostPage(page);
    await editPage.waitForLoaded();

    // When: altera o título e salva
    const editedTitle = `${testPostTitle} EDITADO`;
    await editPage.fillForm({ titulo: editedTitle });
    await editPage.submit();

    // Then: é redirecionado para /admin
    await expect(page).toHaveURL(/\/admin/);

    // Then: título editado aparece na lista (usar tr para evitar strict mode com CardList mobile)
    await adminPage.waitForLoaded();
    const editedRow = page.locator(`tr:has-text("${editedTitle}")`);
    await expect(editedRow).toBeVisible();

    // Cleanup
    const deleteButton = editedRow.locator('[data-testid^="admin-btn-delete-"]');
    await deleteButton.click();
    await adminPage.confirmDelete();
  });
});
