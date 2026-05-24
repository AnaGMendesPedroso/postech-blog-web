import httpClient from '../../../../shared/infrastructure/http/httpClient';
import PostApiRepository from './PostApiRepository';

jest.mock('../../../../shared/infrastructure/http/httpClient');

describe('PostApiRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new PostApiRepository();
    jest.clearAllMocks();
  });

  const mockPost = {
    id: '1',
    titulo: 'Post de teste',
    conteudo: 'Conteúdo do post de teste',
    autor: 'Professor Silva',
    status: 'published',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  const mockPagination = { page: 1, limit: 10, total: 1, totalPages: 1 };

  describe('findAll', () => {
    describe('dado uma chamada com sucesso', () => {
      it('deve retornar lista de posts e paginação', async () => {
        // Given
        httpClient.get.mockResolvedValue({
          data: { success: true, data: [mockPost], pagination: mockPagination }
        });

        // When
        const result = await repository.findAll(1, 10, 'published');

        // Then
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual(mockPost);
        expect(result.pagination).toEqual(mockPagination);
      });

      it('deve enviar parâmetros corretos incluindo status', async () => {
        // Given
        httpClient.get.mockResolvedValue({
          data: { success: true, data: [], pagination: mockPagination }
        });

        // When
        await repository.findAll(2, 5, 'draft');

        // Then
        expect(httpClient.get).toHaveBeenCalledWith('/posts', {
          params: { page: 2, limit: 5, status: 'draft' }
        });
      });

      it('não deve enviar status se for undefined', async () => {
        // Given
        httpClient.get.mockResolvedValue({
          data: { success: true, data: [], pagination: mockPagination }
        });

        // When
        await repository.findAll(1, 10, undefined);

        // Then
        expect(httpClient.get).toHaveBeenCalledWith('/posts', {
          params: { page: 1, limit: 10 }
        });
      });

      it('deve usar valores default para page e limit', async () => {
        // Given
        httpClient.get.mockResolvedValue({
          data: { success: true, data: [], pagination: mockPagination }
        });

        // When
        await repository.findAll();

        // Then
        expect(httpClient.get).toHaveBeenCalledWith('/posts', {
          params: { page: 1, limit: 10 }
        });
      });
    });

    describe('dado um erro da API com mensagem', () => {
      it('deve lançar erro com a mensagem da API', async () => {
        // Given
        httpClient.get.mockRejectedValue({
          response: { data: { success: false, error: { message: 'Erro interno do servidor' } } }
        });

        // When & Then
        await expect(repository.findAll(1, 10)).rejects.toThrow('Erro interno do servidor');
      });
    });

    describe('dado um erro da API sem mensagem específica', () => {
      it('deve lançar erro genérico de comunicação', async () => {
        // Given
        httpClient.get.mockRejectedValue({
          response: { status: 500, data: {} }
        });

        // When & Then
        await expect(repository.findAll(1, 10)).rejects.toThrow('Erro ao comunicar com a API');
      });
    });

    describe('dado um erro de rede (sem response)', () => {
      it('deve lançar erro de conexão', async () => {
        // Given
        httpClient.get.mockRejectedValue({
          request: {},
          message: 'Network Error'
        });

        // When & Then
        await expect(repository.findAll(1, 10)).rejects.toThrow('Erro de conexão. Verifique sua rede.');
      });
    });

    describe('dado um erro genérico (sem response nem request)', () => {
      it('deve lançar erro inesperado', async () => {
        // Given
        httpClient.get.mockRejectedValue({});

        // When & Then
        await expect(repository.findAll(1, 10)).rejects.toThrow('Erro inesperado');
      });
    });
  });

  describe('search', () => {
    describe('dado uma busca com sucesso', () => {
      it('deve enviar query como parâmetro q', async () => {
        // Given
        httpClient.get.mockResolvedValue({
          data: { success: true, data: [mockPost], pagination: mockPagination }
        });

        // When
        await repository.search('react', 1, 10);

        // Then
        expect(httpClient.get).toHaveBeenCalledWith('/posts/search', {
          params: { q: 'react', page: 1, limit: 10 }
        });
      });

      it('deve retornar dados e paginação', async () => {
        // Given
        httpClient.get.mockResolvedValue({
          data: { success: true, data: [mockPost], pagination: mockPagination }
        });

        // When
        const result = await repository.search('react', 1, 10);

        // Then
        expect(result.data).toEqual([mockPost]);
        expect(result.pagination).toEqual(mockPagination);
      });

      it('deve usar valores default para page e limit', async () => {
        // Given
        httpClient.get.mockResolvedValue({
          data: { success: true, data: [], pagination: mockPagination }
        });

        // When
        await repository.search('react');

        // Then
        expect(httpClient.get).toHaveBeenCalledWith('/posts/search', {
          params: { q: 'react', page: 1, limit: 10 }
        });
      });
    });

    describe('dado uma busca com erro', () => {
      it('deve propagar erro da API', async () => {
        // Given
        httpClient.get.mockRejectedValue({
          response: { data: { success: false, error: { message: 'Busca inválida' } } }
        });

        // When & Then
        await expect(repository.search('', 1, 10)).rejects.toThrow('Busca inválida');
      });
    });
  });

  describe('findById', () => {
    describe('dado um id existente', () => {
      it('deve retornar o post correspondente', async () => {
        // Given
        httpClient.get.mockResolvedValue({
          data: { success: true, data: mockPost }
        });

        // When
        const result = await repository.findById('1');

        // Then
        expect(httpClient.get).toHaveBeenCalledWith('/posts/1');
        expect(result).toEqual(mockPost);
      });
    });

    describe('dado um id inexistente (404)', () => {
      it('deve lançar erro com mensagem da API', async () => {
        // Given
        httpClient.get.mockRejectedValue({
          response: { status: 404, data: { success: false, error: { message: 'Post não encontrado' } } }
        });

        // When & Then
        await expect(repository.findById('999')).rejects.toThrow('Post não encontrado');
      });
    });
  });

  describe('create', () => {
    describe('dado dados válidos', () => {
      const postData = {
        titulo: 'Novo Post',
        conteudo: 'Conteúdo do novo post',
        autor: 'Professor Silva',
        status: 'draft'
      };

      it('deve enviar POST com body correto', async () => {
        // Given
        httpClient.post.mockResolvedValue({
          data: { success: true, data: { id: '2', ...postData } }
        });

        // When
        await repository.create(postData);

        // Then
        expect(httpClient.post).toHaveBeenCalledWith('/posts', postData);
      });

      it('deve retornar o post criado', async () => {
        // Given
        const createdPost = { id: '2', ...postData, createdAt: '2024-01-01', updatedAt: '2024-01-01' };
        httpClient.post.mockResolvedValue({
          data: { success: true, data: createdPost }
        });

        // When
        const result = await repository.create(postData);

        // Then
        expect(result).toEqual(createdPost);
      });
    });

    describe('dado erro de validação da API (400)', () => {
      it('deve lançar erro com mensagem específica', async () => {
        // Given
        httpClient.post.mockRejectedValue({
          response: { status: 400, data: { success: false, error: { message: 'Título é obrigatório' } } }
        });

        // When & Then
        await expect(repository.create({})).rejects.toThrow('Título é obrigatório');
      });
    });
  });

  describe('update', () => {
    describe('dado dados válidos', () => {
      const updateData = { titulo: 'Post Atualizado', conteudo: 'Conteúdo atualizado' };

      it('deve enviar PUT com id na URL e body', async () => {
        // Given
        httpClient.put.mockResolvedValue({
          data: { success: true, data: { id: '1', ...updateData } }
        });

        // When
        await repository.update('1', updateData);

        // Then
        expect(httpClient.put).toHaveBeenCalledWith('/posts/1', updateData);
      });

      it('deve retornar o post atualizado', async () => {
        // Given
        const updatedPost = { id: '1', ...updateData, updatedAt: '2024-01-02' };
        httpClient.put.mockResolvedValue({
          data: { success: true, data: updatedPost }
        });

        // When
        const result = await repository.update('1', updateData);

        // Then
        expect(result).toEqual(updatedPost);
      });
    });

    describe('dado post inexistente (404)', () => {
      it('deve lançar erro', async () => {
        // Given
        httpClient.put.mockRejectedValue({
          response: { status: 404, data: { success: false, error: { message: 'Post não encontrado' } } }
        });

        // When & Then
        await expect(repository.update('999', {})).rejects.toThrow('Post não encontrado');
      });
    });
  });

  describe('delete', () => {
    describe('dado um id existente', () => {
      it('deve enviar DELETE e resolver sem retorno', async () => {
        // Given
        httpClient.delete.mockResolvedValue({ status: 204 });

        // When
        const result = await repository.delete('1');

        // Then
        expect(httpClient.delete).toHaveBeenCalledWith('/posts/1');
        expect(result).toBeUndefined();
      });
    });

    describe('dado um id inexistente', () => {
      it('deve lançar erro', async () => {
        // Given
        httpClient.delete.mockRejectedValue({
          response: { status: 404, data: { success: false, error: { message: 'Post não encontrado' } } }
        });

        // When & Then
        await expect(repository.delete('999')).rejects.toThrow('Post não encontrado');
      });
    });
  });
});
