class AdminPage {
  constructor(page) {
    this.page = page;
    this.pageContainer = page.locator('[data-testid="admin-page"]');
    this.title = page.locator('[data-testid="admin-title"]');
    this.newPostButton = page.locator('[data-testid="admin-btn-new-post"]');
    this.table = page.locator('[data-testid="admin-table"]');
    this.emptyMessage = page.locator('[data-testid="admin-empty-message"]');
    this.confirmDialog = page.locator('[data-testid="admin-confirm-dialog"]');
    this.confirmYesButton = page.locator('[data-testid="admin-btn-confirm-yes"]');
    this.confirmNoButton = page.locator('[data-testid="admin-btn-confirm-no"]');
    this.deleteError = page.locator('[data-testid="admin-delete-error"]');
    this.loadingIndicator = page.locator('[data-testid="loading"]');
    this.pagination = page.locator('[data-testid="pagination-container"]');
  }

  async goto() {
    await this.page.goto('/admin');
    await this.pageContainer.waitFor({ state: 'visible' });
  }

  async waitForLoaded() {
    await this.loadingIndicator.waitFor({ state: 'hidden' }).catch(() => {});
  }

  async clickNewPost() {
    await this.newPostButton.click();
  }

  async clickEdit(postId) {
    await this.page.locator(`[data-testid="admin-btn-edit-${postId}"]`).click();
  }

  async clickDelete(postId) {
    await this.page.locator(`[data-testid="admin-btn-delete-${postId}"]`).click();
  }

  async confirmDelete() {
    await this.confirmYesButton.click();
  }

  async cancelDelete() {
    await this.confirmNoButton.click();
  }

  getRow(postId) {
    return this.page.locator(`[data-testid="admin-row-${postId}"]`);
  }

  getRows() {
    return this.page.locator('[data-testid^="admin-row-"]');
  }
}

module.exports = AdminPage;
