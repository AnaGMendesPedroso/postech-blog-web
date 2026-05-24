class EditPostPage {
  constructor(page) {
    this.page = page;
    this.pageContainer = page.locator('[data-testid="edit-post-page"]');
    this.title = page.locator('[data-testid="edit-post-title"]');
    this.backButton = page.locator('[data-testid="edit-post-btn-back"]');
    this.form = page.locator('[data-testid="form-post"]');
    this.tituloInput = page.locator('[data-testid="form-input-titulo"]');
    this.conteudoInput = page.locator('[data-testid="form-input-conteudo"]');
    this.autorInput = page.locator('[data-testid="form-input-autor"]');
    this.statusSelect = page.locator('[data-testid="form-select-status"]');
    this.submitButton = page.locator('[data-testid="form-btn-submit"]');
    this.loadingIndicator = page.locator('[data-testid="edit-post-loading"]');
    this.errorContainer = page.locator('[data-testid="edit-post-error"]');
  }

  async goto(postId) {
    await this.page.goto(`/admin/posts/${postId}/edit`);
  }

  async waitForLoaded() {
    await this.loadingIndicator.waitFor({ state: 'hidden' }).catch(() => {});
    await this.form.waitFor({ state: 'visible' });
  }

  async fillForm({ titulo, conteudo, autor, status }) {
    if (titulo !== undefined) {
      await this.tituloInput.clear();
      await this.tituloInput.fill(titulo);
    }
    if (conteudo !== undefined) {
      await this.conteudoInput.clear();
      await this.conteudoInput.fill(conteudo);
    }
    if (autor !== undefined) {
      await this.autorInput.clear();
      await this.autorInput.fill(autor);
    }
    if (status) await this.statusSelect.selectOption(status);
  }

  async submit() {
    await this.submitButton.click();
  }
}

module.exports = EditPostPage;
