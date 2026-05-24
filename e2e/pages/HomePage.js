class HomePage {
  constructor(page) {
    this.page = page;
    this.pageContainer = page.locator('[data-testid="home-page"]');
    this.title = page.locator('[data-testid="home-title"]');
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.searchButton = page.locator('[data-testid="search-btn-submit"]');
    this.clearButton = page.locator('[data-testid="search-btn-clear"]');
    this.postList = page.locator('[data-testid="post-list"]');
    this.postCards = page.locator('[data-testid^="post-card-"]');
    this.emptyMessage = page.locator('[data-testid="post-list-empty"]');
    this.pagination = page.locator('[data-testid="pagination-container"]');
    this.prevButton = page.locator('[data-testid="pagination-btn-prev"]');
    this.nextButton = page.locator('[data-testid="pagination-btn-next"]');
    this.loadingIndicator = page.locator('[data-testid="loading"]');
  }

  async goto() {
    await this.page.goto('/');
    await this.pageContainer.waitFor({ state: 'visible' });
  }

  async waitForPostsLoaded() {
    // Esperar loading desaparecer — padrão de espera estável
    await this.loadingIndicator.waitFor({ state: 'hidden' }).catch(() => {});
    await this.postList.waitFor({ state: 'visible' }).catch(() => {});
  }

  async search(term) {
    await this.searchInput.fill(term);
    await this.searchButton.click();
    await this.waitForPostsLoaded();
  }

  async clearSearch() {
    await this.clearButton.click();
    await this.waitForPostsLoaded();
  }

  async clickPost(index = 0) {
    await this.postCards.nth(index).click();
  }

  async goToPage(pageNumber) {
    await this.page.locator(`[data-testid="pagination-btn-page-${pageNumber}"]`).click();
    await this.waitForPostsLoaded();
  }

  async goToNextPage() {
    await this.nextButton.click();
    await this.waitForPostsLoaded();
  }

  getPostCard(id) {
    return this.page.locator(`[data-testid="post-card-${id}"]`);
  }

  getPostTitle(id) {
    return this.page.locator(`[data-testid="post-card-title-${id}"]`);
  }

  getPostAuthor(id) {
    return this.page.locator(`[data-testid="post-card-author-${id}"]`);
  }

  getPostExcerpt(id) {
    return this.page.locator(`[data-testid="post-card-excerpt-${id}"]`);
  }
}

module.exports = HomePage;
