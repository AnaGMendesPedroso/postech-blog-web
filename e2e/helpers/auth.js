const { expect } = require('@playwright/test');
const testData = require('../fixtures/test-data.json');

/**
 * Faz login como teacher via UI.
 * Usa storageState para cache em specs que precisam de sessão.
 */
async function loginAsTeacher(page) {
  await page.goto('/login');
  await page.locator('[data-testid="login-input-email"]').fill(testData.teacher.email);
  await page.locator('[data-testid="login-input-password"]').fill(testData.teacher.password);
  await page.locator('[data-testid="login-btn-submit"]').click();

  // Esperar redirecionamento para /admin (confirma que login funcionou)
  await expect(page).toHaveURL(/\/admin/);
}

/**
 * Cria um post via UI e retorna à página admin.
 * Usado como setup em testes que precisam de post existente.
 */
async function createTestPost(page, postData) {
  await page.goto('/admin/posts/new');
  await page.locator('[data-testid="form-input-titulo"]').fill(postData.titulo);
  await page.locator('[data-testid="form-input-conteudo"]').fill(postData.conteudo);
  await page.locator('[data-testid="form-input-autor"]').fill(postData.autor);
  if (postData.status) {
    await page.locator('[data-testid="form-select-status"]').selectOption(postData.status);
  }
  await page.locator('[data-testid="form-btn-submit"]').click();

  // Esperar redirect para admin (confirma criação)
  await expect(page).toHaveURL(/\/admin/);
}

module.exports = { loginAsTeacher, createTestPost };
