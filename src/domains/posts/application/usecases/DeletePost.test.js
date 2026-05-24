import DeletePost from './DeletePost';

describe('DeletePost Use Case', () => {
  let deletePost;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      delete: jest.fn()
    };
    deletePost = new DeletePost(mockRepository);
  });

  describe('dado um ID válido', () => {
    it('deve chamar repository.delete com o ID e não retornar nada', async () => {
      // Given
      mockRepository.delete.mockResolvedValue(undefined);

      // When
      const result = await deletePost.execute({ id: '1' });

      // Then
      expect(result).toBeUndefined();
      expect(mockRepository.delete).toHaveBeenCalledWith('1');
      expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('dado um ID vazio', () => {
    it('deve lançar erro "ID é obrigatório"', async () => {
      // When & Then
      await expect(deletePost.execute({ id: '' })).rejects.toThrow('ID é obrigatório');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('dado ID undefined', () => {
    it('deve lançar erro "ID é obrigatório"', async () => {
      // When & Then
      await expect(deletePost.execute({})).rejects.toThrow('ID é obrigatório');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('dado ID com apenas espaços', () => {
    it('deve lançar erro "ID é obrigatório" sem chamar repositório', async () => {
      // When & Then
      await expect(deletePost.execute({ id: '   ' })).rejects.toThrow('ID é obrigatório');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('dado nenhum argumento', () => {
    it('deve lançar erro "ID é obrigatório"', async () => {
      // When & Then
      await expect(deletePost.execute()).rejects.toThrow('ID é obrigatório');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('dado erro no repositório', () => {
    it('deve propagar o erro', async () => {
      // Given
      mockRepository.delete.mockRejectedValue(new Error('Erro de rede'));

      // When & Then
      await expect(deletePost.execute({ id: '1' })).rejects.toThrow('Erro de rede');
    });
  });
});
