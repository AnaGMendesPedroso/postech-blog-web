class CreatePostPage {
  constructor(page) {
    this.page = page;
    this.pageContainer = page.locator('[data-testid="create-post-page"]');
    this.title = page.locator('[data-testid="create-post-title"]');
    this.form = page.locator('[data-testid="form-post"]');
    this.tituloInput = page.locator('[data-testid="form-input-titulo"]');
    this.conteudoInput = page.locator('[data-testid="form-input-conteudo"]');
    this.autorInput = page.locator('[data-testid="form-input-autor"]');
    this.statusSelect = page.locator('[data-testid="form-select-status"]');
    this.submitButton = page.locator('[data-testid="form-btn-submit"]');
    this.errorTitulo = page.locator('[data-testid="form-error-titulo"]');
    this.errorConteudo = page.locator('[data-testid="form-error-conteudo"]');
    this.errorAutor = page.locator('[data-testid="form-error-autor"]');
    this.apiError = page.locator('[data-testid="form-error-message"]');
  }

  async goto() {
    await this.page.goto('/admin/posts/new');
    await this.pageContainer.waitFor({ state: 'visible' });
  }

  async fillForm({ titulo, conteudo, autor, status }) {
    if (titulo !== undefined) await this.tituloInput.fill(titulo);
    if (conteudo !== undefined) await this.conteudoInput.fill(conteudo);
    if (autor !== undefined) await this.autorInput.fill(autor);
    if (status) await this.statusSelect.selectOption(status);
  }

  async submit() {
    await this.submitButton.click();
  }
}

module.exports = CreatePostPage;
