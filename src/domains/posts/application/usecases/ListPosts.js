class ListPosts {
  constructor(repository) {
    this.repository = repository;
  }

  async execute({ page, limit, status } = {}) {
    const sanitizedPage = page >= 1 ? page : 1;
    const sanitizedLimit = limit >= 1 && limit <= 100 ? limit : (limit > 100 ? 100 : 10);

    return this.repository.findAll(sanitizedPage, sanitizedLimit, status);
  }
}

export default ListPosts;
