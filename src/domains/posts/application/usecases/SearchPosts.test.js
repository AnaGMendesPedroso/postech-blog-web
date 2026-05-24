import SearchPosts from './SearchPosts';

describe('SearchPosts Use Case', () => {
  let searchPosts;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      search: jest.fn()
    };
    searchPosts = new SearchPosts(mockRepository);
  });

  describe('dado uma busca com resultados', () => {
    it('deve retornar os posts encontrados', async () => {
      // Given
      const expectedResult = {
        data: [{ id: '1', titulo: 'React Hooks' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      };
      mockRepository.search.mockResolvedValue(expectedResult);

      // When
      const result = await searchPosts.execute({ query: 'react' });

      // Then
      expect(result).toEqual(expectedResult);
      expect(mockRepository.search).toHaveBeenCalledWith('react', 1, 10);
    });
  });

  describe('dado uma busca sem resultados', () => {
    it('deve retornar data vazia com pagination', async () => {
      // Given
      const expectedResult = { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
      mockRepository.search.mockResolvedValue(expectedResult);

      // When
      const result = await searchPosts.execute({ query: 'xyz123' });

      // Then
      expect(result.data).toEqual([]);
    });
  });

  describe('dado query com espaços extras', () => {
    it('deve chamar repository com query trimada', async () => {
      // Given
      mockRepository.search.mockResolvedValue({ data: [], pagination: {} });

      // When
      await searchPosts.execute({ query: '  react  ' });

      // Then
      expect(mockRepository.search).toHaveBeenCalledWith('react', 1, 10);
    });
  });

  describe('dado query vazia', () => {
    it('deve lançar erro "A busca é obrigatória"', async () => {
      // When & Then
      await expect(searchPosts.execute({ query: '' })).rejects.toThrow('A busca é obrigatória');
      expect(mockRepository.search).not.toHaveBeenCalled();
    });
  });

  describe('dado query undefined', () => {
    it('deve lançar erro "A busca é obrigatória"', async () => {
      // When & Then
      await expect(searchPosts.execute({})).rejects.toThrow('A busca é obrigatória');
      expect(mockRepository.search).not.toHaveBeenCalled();
    });
  });

  describe('dado query apenas com espaços', () => {
    it('deve lançar erro "A busca é obrigatória"', async () => {
      // When & Then
      await expect(searchPosts.execute({ query: '   ' })).rejects.toThrow('A busca é obrigatória');
      expect(mockRepository.search).not.toHaveBeenCalled();
    });
  });

  describe('dado nenhum argumento', () => {
    it('deve lançar erro "A busca é obrigatória"', async () => {
      // When & Then
      await expect(searchPosts.execute()).rejects.toThrow('A busca é obrigatória');
      expect(mockRepository.search).not.toHaveBeenCalled();
    });
  });

  describe('dado busca com paginação', () => {
    it('deve chamar repository com page e limit fornecidos', async () => {
      // Given
      mockRepository.search.mockResolvedValue({ data: [], pagination: {} });

      // When
      await searchPosts.execute({ query: 'post', page: 2, limit: 5 });

      // Then
      expect(mockRepository.search).toHaveBeenCalledWith('post', 2, 5);
    });
  });

  describe('dado erro no repositório', () => {
    it('deve propagar o erro', async () => {
      // Given
      mockRepository.search.mockRejectedValue(new Error('Erro de rede'));

      // When & Then
      await expect(searchPosts.execute({ query: 'test' })).rejects.toThrow('Erro de rede');
    });
  });
});
