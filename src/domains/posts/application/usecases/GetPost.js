class GetPost {
  constructor(repository) {
    this.repository = repository;
  }

  async execute({ id } = {}) {
    if (!id || id.trim().length === 0) {
      throw new Error('ID é obrigatório');
    }

    const post = await this.repository.findById(id);

    if (!post) {
      throw new Error('Post não encontrado');
    }

    return post;
  }
}

export default GetPost;
