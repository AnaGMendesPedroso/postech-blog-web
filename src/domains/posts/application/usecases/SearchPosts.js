class SearchPosts {
  constructor(repository) {
    this.repository = repository;
  }

  async execute({ query, page = 1, limit = 10 } = {}) {
    if (!query || query.trim().length === 0) {
      throw new Error('A busca é obrigatória');
    }

    return this.repository.search(query.trim(), page, limit);
  }
}

export default SearchPosts;
