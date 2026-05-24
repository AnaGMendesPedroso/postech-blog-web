class PostRepository {
  async findAll(page, limit, status) {
    throw new Error('Not implemented');
  }

  async search(query, page, limit) {
    throw new Error('Not implemented');
  }

  async findById(id) {
    throw new Error('Not implemented');
  }

  async create(post) {
    throw new Error('Not implemented');
  }

  async update(id, post) {
    throw new Error('Not implemented');
  }

  async delete(id) {
    throw new Error('Not implemented');
  }
}

export default PostRepository;
