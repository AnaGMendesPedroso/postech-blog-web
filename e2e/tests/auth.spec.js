const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const testData = require('../fixtures/test-data.json');

test.describe('Autenticação', () => {
  test('deve fazer login com credenciais válidas', async ({ page }) => {
    // Given: usuário está na página de login
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // When: insere email e senha válidos e submete
    await loginPage.login(testData.teacher.email, testData.teacher.password);

    // Then: é redirecionado para /admin
    await expect(page).toHaveURL(/\/admin/);
    // Then: botão de logout é visível no header
    await expect(page.locator('[data-testid="header-btn-logout"]')).toBeVisible();
  });

  test('deve exibir erro com credenciais inválidas', async ({ page }) => {
    // Given: usuário está na página de login
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // When: insere credenciais inválidas e submete
    await loginPage.login(testData.invalidCredentials.email, testData.invalidCredentials.password);

    // Then: mensagem de erro é exibida
    await expect(loginPage.errorMessage).toBeVisible();
    // Then: permanece na página de login
    await expect(page).toHaveURL(/\/login/);
  });

  test('deve redirecionar para /login ao acessar /admin sem autenticação', async ({ page }) => {
    // Given: usuário não está autenticado (nova página, sem localStorage)
    // When: acessa /admin diretamente
    await page.goto('/admin');

    // Then: é redirecionado para /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('deve fazer logout e redirecionar para home', async ({ page }) => {
    // Given: usuário está autenticado
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testData.teacher.email, testData.teacher.password);
    await expect(page).toHaveURL(/\/admin/);

    // When: clica no botão de logout
    await page.locator('[data-testid="header-btn-logout"]').click();

    // Then: é redirecionado para a home
    await expect(page).toHaveURL('/');
    // Then: link de login reaparece
    await expect(page.locator('[data-testid="header-link-login"]')).toBeVisible();
  });
});
