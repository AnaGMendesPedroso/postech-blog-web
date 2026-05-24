import PostRepository from './PostRepository';

describe('PostRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new PostRepository();
  });

  describe('contrato da interface', () => {
    it('findAll deve lançar erro "Not implemented"', async () => {
      await expect(repository.findAll(1, 10)).rejects.toThrow('Not implemented');
    });

    it('search deve lançar erro "Not implemented"', async () => {
      await expect(repository.search('query', 1, 10)).rejects.toThrow('Not implemented');
    });

    it('findById deve lançar erro "Not implemented"', async () => {
      await expect(repository.findById('1')).rejects.toThrow('Not implemented');
    });

    it('create deve lançar erro "Not implemented"', async () => {
      await expect(repository.create({})).rejects.toThrow('Not implemented');
    });

    it('update deve lançar erro "Not implemented"', async () => {
      await expect(repository.update('1', {})).rejects.toThrow('Not implemented');
    });

    it('delete deve lançar erro "Not implemented"', async () => {
      await expect(repository.delete('1')).rejects.toThrow('Not implemented');
    });
  });
});
