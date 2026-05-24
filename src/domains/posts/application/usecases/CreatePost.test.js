import CreatePost from './CreatePost';

describe('CreatePost Use Case', () => {
  let createPost;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn()
    };
    createPost = new CreatePost(mockRepository);
  });

  describe('dado dados válidos de um novo post', () => {
    const validDTO = {
      titulo: 'Título válido do post',
      conteudo: 'Conteúdo com mais de dez caracteres para validação',
      autor: 'Professor Silva',
      status: 'published'
    };

    it('deve criar o post e retornar os dados persistidos', async () => {
      // Given
      const expectedPost = { id: '1', ...validDTO, createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      mockRepository.create.mockResolvedValue(expectedPost);

      // When
      const result = await createPost.execute(validDTO);

      // Then
      expect(result).toEqual(expectedPost);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith({
        titulo: validDTO.titulo,
        conteudo: validDTO.conteudo,
        autor: validDTO.autor,
        status: validDTO.status
      });
    });
  });

  describe('dado DTO sem status', () => {
    it('deve usar status "draft" como default', async () => {
      // Given
      const dto = { titulo: 'Título válido', conteudo: 'Conteúdo válido do post', autor: 'Professor' };
      mockRepository.create.mockResolvedValue({ id: '1', ...dto, status: 'draft' });

      // When
      await createPost.execute(dto);

      // Then
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'draft' })
      );
    });
  });

  describe('dado título inválido (menos de 3 caracteres)', () => {
    it('deve lançar erro de validação sem chamar o repositório', async () => {
      // Given
      const invalidDTO = { titulo: 'ab', conteudo: 'Conteúdo válido aqui', autor: 'Professor' };

      // When & Then
      await expect(createPost.execute(invalidDTO)).rejects.toThrow();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('dado título vazio', () => {
    it('deve lançar erro de validação sem chamar o repositório', async () => {
      // Given
      const invalidDTO = { titulo: '', conteudo: 'Conteúdo válido aqui', autor: 'Professor' };

      // When & Then
      await expect(createPost.execute(invalidDTO)).rejects.toThrow();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('dado conteúdo inválido (menos de 10 caracteres)', () => {
    it('deve lançar erro de validação sem chamar o repositório', async () => {
      // Given
      const invalidDTO = { titulo: 'Título OK', conteudo: 'curto', autor: 'Professor' };

      // When & Then
      await expect(createPost.execute(invalidDTO)).rejects.toThrow();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('dado conteúdo vazio', () => {
    it('deve lançar erro de validação sem chamar o repositório', async () => {
      // Given
      const invalidDTO = { titulo: 'Título OK', conteudo: '', autor: 'Professor' };

      // When & Then
      await expect(createPost.execute(invalidDTO)).rejects.toThrow();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('dado status inválido', () => {
    it('deve lançar erro de validação sem chamar o repositório', async () => {
      // Given
      const invalidDTO = { titulo: 'Título OK', conteudo: 'Conteúdo válido aqui', autor: 'Professor', status: 'archived' };

      // When & Then
      await expect(createPost.execute(invalidDTO)).rejects.toThrow();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('dado autor vazio', () => {
    it('deve lançar erro "Autor é obrigatório" sem chamar o repositório', async () => {
      // Given
      const invalidDTO = { titulo: 'Título OK', conteudo: 'Conteúdo válido aqui', autor: '' };

      // When & Then
      await expect(createPost.execute(invalidDTO)).rejects.toThrow('Autor é obrigatório');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('dado autor com espaços extras', () => {
    it('deve enviar autor trimado ao repositório', async () => {
      // Given
      const dto = { titulo: 'Título OK', conteudo: 'Conteúdo válido aqui', autor: '  Professor Silva  ' };
      mockRepository.create.mockResolvedValue({ id: '1', ...dto, status: 'draft' });

      // When
      await createPost.execute(dto);

      // Then
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ autor: 'Professor Silva' })
      );
    });
  });

  describe('dado autor com apenas espaços', () => {
    it('deve lançar erro "Autor é obrigatório" sem chamar o repositório', async () => {
      // Given
      const invalidDTO = { titulo: 'Título OK', conteudo: 'Conteúdo válido aqui', autor: '   ' };

      // When & Then
      await expect(createPost.execute(invalidDTO)).rejects.toThrow('Autor é obrigatório');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('dado autor undefined', () => {
    it('deve lançar erro "Autor é obrigatório" sem chamar o repositório', async () => {
      // Given
      const invalidDTO = { titulo: 'Título OK', conteudo: 'Conteúdo válido aqui' };

      // When & Then
      await expect(createPost.execute(invalidDTO)).rejects.toThrow('Autor é obrigatório');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('dado erro no repositório', () => {
    it('deve propagar o erro', async () => {
      // Given
      const validDTO = { titulo: 'Título OK', conteudo: 'Conteúdo válido aqui', autor: 'Professor' };
      mockRepository.create.mockRejectedValue(new Error('Erro de rede'));

      // When & Then
      await expect(createPost.execute(validDTO)).rejects.toThrow('Erro de rede');
    });
  });
});
