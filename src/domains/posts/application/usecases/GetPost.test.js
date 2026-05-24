import GetPost from './GetPost';

describe('GetPost Use Case', () => {
  let getPost;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn()
    };
    getPost = new GetPost(mockRepository);
  });

  describe('dado um ID válido de um post existente', () => {
    it('deve retornar o post completo', async () => {
      // Given
      const expectedPost = { id: '1', titulo: 'Post Teste', conteudo: 'Conteúdo do post', autor: 'Professor', status: 'published' };
      mockRepository.findById.mockResolvedValue(expectedPost);

      // When
      const result = await getPost.execute({ id: '1' });

      // Then
      expect(result).toEqual(expectedPost);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('dado um ID de um post que não existe', () => {
    it('deve lançar erro "Post não encontrado"', async () => {
      // Given
      mockRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(getPost.execute({ id: '999' })).rejects.toThrow('Post não encontrado');
      expect(mockRepository.findById).toHaveBeenCalledWith('999');
    });
  });

  describe('dado um ID vazio', () => {
    it('deve lançar erro "ID é obrigatório"', async () => {
      // When & Then
      await expect(getPost.execute({ id: '' })).rejects.toThrow('ID é obrigatório');
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('dado ID undefined', () => {
    it('deve lançar erro "ID é obrigatório"', async () => {
      // When & Then
      await expect(getPost.execute({})).rejects.toThrow('ID é obrigatório');
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('dado ID com apenas espaços', () => {
    it('deve lançar erro "ID é obrigatório" sem chamar repositório', async () => {
      // When & Then
      await expect(getPost.execute({ id: '   ' })).rejects.toThrow('ID é obrigatório');
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('dado nenhum argumento', () => {
    it('deve lançar erro "ID é obrigatório"', async () => {
      // When & Then
      await expect(getPost.execute()).rejects.toThrow('ID é obrigatório');
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('dado erro no repositório', () => {
    it('deve propagar o erro', async () => {
      // Given
      mockRepository.findById.mockRejectedValue(new Error('Erro de rede'));

      // When & Then
      await expect(getPost.execute({ id: '1' })).rejects.toThrow('Erro de rede');
    });
  });
});
