import ListPosts from './ListPosts';

describe('ListPosts Use Case', () => {
  let listPosts;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn()
    };
    listPosts = new ListPosts(mockRepository);
  });

  describe('dado uma listagem com sucesso', () => {
    it('deve retornar data e pagination do repositório', async () => {
      // Given
      const expectedResult = {
        data: [{ id: '1', titulo: 'Post 1' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      };
      mockRepository.findAll.mockResolvedValue(expectedResult);

      // When
      const result = await listPosts.execute({});

      // Then
      expect(result).toEqual(expectedResult);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('dado parâmetros de paginação', () => {
    it('deve chamar repository com page e limit fornecidos', async () => {
      // Given
      mockRepository.findAll.mockResolvedValue({ data: [], pagination: {} });

      // When
      await listPosts.execute({ page: 2, limit: 5 });

      // Then
      expect(mockRepository.findAll).toHaveBeenCalledWith(2, 5, undefined);
    });
  });

  describe('dado filtro por status', () => {
    it('deve chamar repository com status fornecido', async () => {
      // Given
      mockRepository.findAll.mockResolvedValue({ data: [], pagination: {} });

      // When
      await listPosts.execute({ status: 'published' });

      // Then
      expect(mockRepository.findAll).toHaveBeenCalledWith(1, 10, 'published');
    });
  });

  describe('dado lista vazia retornada pelo repositório', () => {
    it('deve retornar data vazia com pagination', async () => {
      // Given
      const expectedResult = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      };
      mockRepository.findAll.mockResolvedValue(expectedResult);

      // When
      const result = await listPosts.execute({});

      // Then
      expect(result.data).toEqual([]);
      expect(result.pagination).toBeDefined();
    });
  });

  describe('dado nenhum parâmetro fornecido', () => {
    it('deve usar valores default (page=1, limit=10)', async () => {
      // Given
      mockRepository.findAll.mockResolvedValue({ data: [], pagination: {} });

      // When
      await listPosts.execute();

      // Then
      expect(mockRepository.findAll).toHaveBeenCalledWith(1, 10, undefined);
    });
  });

  describe('dado page negativo', () => {
    it('deve usar page=1 como default', async () => {
      // Given
      mockRepository.findAll.mockResolvedValue({ data: [], pagination: {} });

      // When
      await listPosts.execute({ page: -1 });

      // Then
      expect(mockRepository.findAll).toHaveBeenCalledWith(1, 10, undefined);
    });
  });

  describe('dado limit acima do máximo (100)', () => {
    it('deve usar limit=100', async () => {
      // Given
      mockRepository.findAll.mockResolvedValue({ data: [], pagination: {} });

      // When
      await listPosts.execute({ limit: 500 });

      // Then
      expect(mockRepository.findAll).toHaveBeenCalledWith(1, 100, undefined);
    });

    it('deve usar limit=100 para limit=101 (boundary + 1)', async () => {
      // Given
      mockRepository.findAll.mockResolvedValue({ data: [], pagination: {} });

      // When
      await listPosts.execute({ limit: 101 });

      // Then
      expect(mockRepository.findAll).toHaveBeenCalledWith(1, 100, undefined);
    });
  });

  describe('dado limit exatamente 100 (boundary)', () => {
    it('deve aceitar limit=100', async () => {
      // Given
      mockRepository.findAll.mockResolvedValue({ data: [], pagination: {} });

      // When
      await listPosts.execute({ limit: 100 });

      // Then
      expect(mockRepository.findAll).toHaveBeenCalledWith(1, 100, undefined);
    });
  });

  describe('dado limit exatamente 1 (boundary inferior)', () => {
    it('deve aceitar limit=1', async () => {
      // Given
      mockRepository.findAll.mockResolvedValue({ data: [], pagination: {} });

      // When
      await listPosts.execute({ limit: 1 });

      // Then
      expect(mockRepository.findAll).toHaveBeenCalledWith(1, 1, undefined);
    });
  });

  describe('dado limit menor que 1', () => {
    it('deve usar limit=10 como default', async () => {
      // Given
      mockRepository.findAll.mockResolvedValue({ data: [], pagination: {} });

      // When
      await listPosts.execute({ limit: 0 });

      // Then
      expect(mockRepository.findAll).toHaveBeenCalledWith(1, 10, undefined);
    });

    it('deve usar limit=10 para limit negativo', async () => {
      // Given
      mockRepository.findAll.mockResolvedValue({ data: [], pagination: {} });

      // When
      await listPosts.execute({ limit: -5 });

      // Then
      expect(mockRepository.findAll).toHaveBeenCalledWith(1, 10, undefined);
    });
  });

  describe('dado page exatamente 1 (boundary)', () => {
    it('deve aceitar page=1', async () => {
      // Given
      mockRepository.findAll.mockResolvedValue({ data: [], pagination: {} });

      // When
      await listPosts.execute({ page: 1 });

      // Then
      expect(mockRepository.findAll).toHaveBeenCalledWith(1, 10, undefined);
    });
  });

  describe('dado page=0', () => {
    it('deve usar page=1 como default', async () => {
      // Given
      mockRepository.findAll.mockResolvedValue({ data: [], pagination: {} });

      // When
      await listPosts.execute({ page: 0 });

      // Then
      expect(mockRepository.findAll).toHaveBeenCalledWith(1, 10, undefined);
    });
  });

  describe('dado erro no repositório', () => {
    it('deve propagar o erro', async () => {
      // Given
      mockRepository.findAll.mockRejectedValue(new Error('Erro de rede'));

      // When & Then
      await expect(listPosts.execute({})).rejects.toThrow('Erro de rede');
    });
  });
});
