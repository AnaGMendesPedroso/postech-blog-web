class PostDetailPage {
  constructor(page) {
    this.page = page;
    this.pageContainer = page.locator('[data-testid="post-detail-page"]');
    this.backButton = page.locator('[data-testid="post-btn-back"]');
    this.title = page.locator('[data-testid="post-title"]');
    this.author = page.locator('[data-testid="post-author"]');
    this.date = page.locator('[data-testid="post-date"]');
    this.content = page.locator('[data-testid="post-content"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.loadingIndicator = page.locator('[data-testid="loading"]');
  }

  async goto(postId) {
    await this.page.goto(`/posts/${postId}`);
  }

  async waitForLoaded() {
    await this.loadingIndicator.waitFor({ state: 'hidden' }).catch(() => {});
  }

  async goBack() {
    await this.backButton.click();
  }
}

module.exports = PostDetailPage;
