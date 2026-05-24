import UpdatePost from './UpdatePost';

describe('UpdatePost Use Case', () => {
  let updatePost;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      update: jest.fn()
    };
    updatePost = new UpdatePost(mockRepository);
  });

  describe('dado atualização completa com todos os campos válidos', () => {
    it('deve atualizar o post e retornar os dados atualizados', async () => {
      // Given
      const data = { titulo: 'Novo Título Válido', conteudo: 'Novo conteúdo válido do post', autor: 'Novo Autor', status: 'published' };
      const expectedPost = { id: '1', ...data, updatedAt: '2024-01-02' };
      mockRepository.update.mockResolvedValue(expectedPost);

      // When
      const result = await updatePost.execute({ id: '1', data });

      // Then
      expect(result).toEqual(expectedPost);
      expect(mockRepository.update).toHaveBeenCalledWith('1', {
        titulo: 'Novo Título Válido',
        conteudo: 'Novo conteúdo válido do post',
        autor: 'Novo Autor',
        status: 'published'
      });
    });
  });

  describe('dado atualização parcial (só título)', () => {
    it('deve chamar repository apenas com o título', async () => {
      // Given
      mockRepository.update.mockResolvedValue({ id: '1', titulo: 'Título Atualizado' });

      // When
      await updatePost.execute({ id: '1', data: { titulo: 'Título Atualizado' } });

      // Then
      expect(mockRepository.update).toHaveBeenCalledWith('1', { titulo: 'Título Atualizado' });
    });

    it('não deve incluir autor no payload quando não fornecido', async () => {
      // Given
      mockRepository.update.mockResolvedValue({ id: '1', titulo: 'Título Atualizado' });

      // When
      await updatePost.execute({ id: '1', data: { titulo: 'Título Atualizado' } });

      // Then
      const callArgs = mockRepository.update.mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('autor');
    });
  });

  describe('dado atualização parcial (só conteúdo)', () => {
    it('deve chamar repository apenas com o conteúdo', async () => {
      // Given
      mockRepository.update.mockResolvedValue({ id: '1', conteudo: 'Conteúdo atualizado do post' });

      // When
      await updatePost.execute({ id: '1', data: { conteudo: 'Conteúdo atualizado do post' } });

      // Then
      expect(mockRepository.update).toHaveBeenCalledWith('1', { conteudo: 'Conteúdo atualizado do post' });
    });
  });

  describe('dado atualização parcial (só status)', () => {
    it('deve chamar repository com o status', async () => {
      // Given
      mockRepository.update.mockResolvedValue({ id: '1', status: 'published' });

      // When
      await updatePost.execute({ id: '1', data: { status: 'published' } });

      // Then
      expect(mockRepository.update).toHaveBeenCalledWith('1', { status: 'published' });
    });
  });

  describe('dado atualização parcial (só autor)', () => {
    it('deve chamar repository com o autor', async () => {
      // Given
      mockRepository.update.mockResolvedValue({ id: '1', autor: 'Novo Autor' });

      // When
      await updatePost.execute({ id: '1', data: { autor: 'Novo Autor' } });

      // Then
      expect(mockRepository.update).toHaveBeenCalledWith('1', { autor: 'Novo Autor' });
    });
  });

  describe('dado ID vazio', () => {
    it('deve lançar erro "ID é obrigatório"', async () => {
      // When & Then
      await expect(updatePost.execute({ id: '', data: { titulo: 'Novo' } })).rejects.toThrow('ID é obrigatório');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('dado ID undefined', () => {
    it('deve lançar erro "ID é obrigatório"', async () => {
      // When & Then
      await expect(updatePost.execute({ data: { titulo: 'Novo' } })).rejects.toThrow('ID é obrigatório');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('dado ID com apenas espaços', () => {
    it('deve lançar erro "ID é obrigatório" sem chamar repositório', async () => {
      // When & Then
      await expect(updatePost.execute({ id: '   ', data: { titulo: 'Novo' } })).rejects.toThrow('ID é obrigatório');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('dado nenhum argumento', () => {
    it('deve lançar erro "ID é obrigatório"', async () => {
      // When & Then
      await expect(updatePost.execute()).rejects.toThrow('ID é obrigatório');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('dado data null', () => {
    it('deve lançar erro "Pelo menos um campo deve ser fornecido"', async () => {
      // When & Then
      await expect(updatePost.execute({ id: '1', data: null })).rejects.toThrow('Pelo menos um campo deve ser fornecido');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('dado nenhum campo fornecido', () => {
    it('deve lançar erro "Pelo menos um campo deve ser fornecido"', async () => {
      // When & Then
      await expect(updatePost.execute({ id: '1', data: {} })).rejects.toThrow('Pelo menos um campo deve ser fornecido');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('dado título inválido (menos de 3 caracteres)', () => {
    it('deve lançar erro de validação sem chamar o repositório', async () => {
      // When & Then
      await expect(updatePost.execute({ id: '1', data: { titulo: 'ab' } })).rejects.toThrow();
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('dado conteúdo inválido (menos de 10 caracteres)', () => {
    it('deve lançar erro de validação sem chamar o repositório', async () => {
      // When & Then
      await expect(updatePost.execute({ id: '1', data: { conteudo: 'curto' } })).rejects.toThrow();
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('dado status inválido', () => {
    it('deve lançar erro de validação sem chamar o repositório', async () => {
      // When & Then
      await expect(updatePost.execute({ id: '1', data: { status: 'invalid' } })).rejects.toThrow();
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('dado erro no repositório', () => {
    it('deve propagar o erro', async () => {
      // Given
      mockRepository.update.mockRejectedValue(new Error('Erro de rede'));

      // When & Then
      await expect(updatePost.execute({ id: '1', data: { status: 'published' } })).rejects.toThrow('Erro de rede');
    });
  });
});
