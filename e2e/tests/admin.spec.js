const { test, expect } = require('@playwright/test');
const AdminPage = require('../pages/AdminPage');
const { loginAsTeacher, createTestPost } = require('../helpers/auth');
const testData = require('../fixtures/test-data.json');

test.describe('Página Administrativa', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTeacher(page);
  });

  test('deve listar posts na tabela com opções de editar e excluir', async ({ page }) => {
    // Given: professor autenticado acessa /admin
    const adminPage = new AdminPage(page);
    await adminPage.waitForLoaded();

    // Then: tabela de posts é exibida
    await expect(adminPage.table).toBeVisible();
    // Then: pelo menos um post na lista
    const rows = adminPage.getRows();
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('deve navegar para criação ao clicar em "Novo Post"', async ({ page }) => {
    // Given: professor está na página admin
    const adminPage = new AdminPage(page);
    await adminPage.waitForLoaded();

    // When: clica em "Novo Post"
    await adminPage.clickNewPost();

    // Then: é redirecionado para /admin/posts/new
    await expect(page).toHaveURL(/\/admin\/posts\/new/);
  });

  test('deve navegar para edição ao clicar em "Editar"', async ({ page }) => {
    // Given: professor está na admin com posts listados
    const adminPage = new AdminPage(page);
    await adminPage.waitForLoaded();

    // When: clica no botão de editar do primeiro post
    const firstRow = adminPage.getRows().first();
    const editButton = firstRow.locator('[data-testid^="admin-btn-edit-"]');
    await editButton.click();

    // Then: é redirecionado para /admin/posts/:id/edit
    await expect(page).toHaveURL(/\/admin\/posts\/.+\/edit/);
  });

  test('deve excluir post após confirmação', async ({ page }) => {
    // Given: criar post de teste para excluir (evitar excluir dados reais)
    const uniqueTitle = `Post Deletar E2E ${Date.now()}`;
    await createTestPost(page, { ...testData.validPost, titulo: uniqueTitle });

    const adminPage = new AdminPage(page);
    await adminPage.waitForLoaded();

    // Confirmar que post existe na lista (usar tr para evitar strict mode com CardList mobile)
    const row = page.locator(`tr:has-text("${uniqueTitle}")`);
    await expect(row).toBeVisible();

    // When: clica em excluir no post criado
    const deleteButton = row.locator('[data-testid^="admin-btn-delete-"]');
    await deleteButton.click();

    // Then: dialog de confirmação aparece
    await expect(adminPage.confirmDialog).toBeVisible();

    // When: confirma exclusão
    await adminPage.confirmDelete();

    // Then: post é removido da lista
    await expect(adminPage.confirmDialog).not.toBeVisible();
    await adminPage.waitForLoaded();
    await expect(page.locator(`tr:has-text("${uniqueTitle}")`)).not.toBeVisible();
  });

  test('deve cancelar exclusão ao clicar "Cancelar"', async ({ page }) => {
    // Given: professor está na admin com posts listados
    const adminPage = new AdminPage(page);
    await adminPage.waitForLoaded();

    // When: clica em excluir de um post
    const firstRow = adminPage.getRows().first();
    const deleteButton = firstRow.locator('[data-testid^="admin-btn-delete-"]');
    await deleteButton.click();

    // Then: dialog aparece
    await expect(adminPage.confirmDialog).toBeVisible();

    // When: cancela
    await adminPage.cancelDelete();

    // Then: dialog fecha e post continua na lista
    await expect(adminPage.confirmDialog).not.toBeVisible();
    const count = await adminPage.getRows().count();
    expect(count).toBeGreaterThan(0);
  });
});
