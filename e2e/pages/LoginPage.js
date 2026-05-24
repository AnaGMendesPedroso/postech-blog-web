class LoginPage {
  constructor(page) {
    this.page = page;
    this.pageContainer = page.locator('[data-testid="login-page"]');
    this.emailInput = page.locator('[data-testid="login-input-email"]');
    this.passwordInput = page.locator('[data-testid="login-input-password"]');
    this.submitButton = page.locator('[data-testid="login-btn-submit"]');
    this.errorMessage = page.locator('[data-testid="login-error-message"]');
    this.registerLink = page.locator('[data-testid="login-link-register"]');
  }

  async goto() {
    await this.page.goto('/login');
    await this.pageContainer.waitFor({ state: 'visible' });
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

module.exports = LoginPage;
