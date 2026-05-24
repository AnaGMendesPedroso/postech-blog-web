class DeletePost {
  constructor(repository) {
    this.repository = repository;
  }

  async execute({ id } = {}) {
    if (!id || id.trim().length === 0) {
      throw new Error('ID é obrigatório');
    }

    await this.repository.delete(id);
  }
}

export default DeletePost;
