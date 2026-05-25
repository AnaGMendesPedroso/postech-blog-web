import { renderHook, waitFor, act } from '@testing-library/react';
import usePost from './usePost';

function createMockGetPostUseCase(overrides = {}) {
  return {
    execute: jest.fn().mockResolvedValue({
      id: '1',
      titulo: 'Post de Teste',
      conteudo: 'Conteúdo completo do post de teste',
      autor: 'Professor A',
      status: 'published',
      createdAt: '2024-06-15T10:00:00.000Z',
      updatedAt: '2024-06-15T10:00:00.000Z',
    }),
    ...overrides,
  };
}

describe('usePost', () => {
  describe('dado um id válido e use case com sucesso', () => {
    it('deve retornar loading=true inicialmente e depois false', async () => {
      // Given
      let resolveExecute;
      const executePromise = new Promise((resolve) => { resolveExecute = resolve; });
      const getPostUseCase = createMockGetPostUseCase({
        execute: jest.fn().mockReturnValue(executePromise),
      });

      // When
      const { result } = renderHook(() => usePost({ getPostUseCase, id: '1' }));

      // Then - loading during operation
      expect(result.current.loading).toBe(true);

      // Cleanup
      await act(async () => {
        resolveExecute({ id: '1', titulo: 'Post', conteudo: 'C', autor: 'A', createdAt: '2024-01-01' });
      });

      expect(result.current.loading).toBe(false);
    });

    it('deve retornar o post retornado pelo use case', async () => {
      // Given
      const getPostUseCase = createMockGetPostUseCase();
      const { result } = renderHook(() => usePost({ getPostUseCase, id: '1' }));

      // When & Then
      await waitFor(() => {
        expect(result.current.post).not.toBeNull();
      });
      expect(result.current.post.titulo).toBe('Post de Teste');
      expect(result.current.post.conteudo).toBe('Conteúdo completo do post de teste');
      expect(result.current.post.autor).toBe('Professor A');
    });

    it('deve chamar getPostUseCase.execute com { id }', async () => {
      // Given
      const getPostUseCase = createMockGetPostUseCase();
      renderHook(() => usePost({ getPostUseCase, id: 'abc-123' }));

      // Then
      await waitFor(() => {
        expect(getPostUseCase.execute).toHaveBeenCalledWith({ id: 'abc-123' });
      });
      expect(getPostUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('deve setar error=null após sucesso', async () => {
      // Given
      const getPostUseCase = createMockGetPostUseCase();
      const { result } = renderHook(() => usePost({ getPostUseCase, id: '1' }));

      // Then
      await waitFor(() => {
        expect(result.current.post).not.toBeNull();
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe('dado um id válido e use case lança erro "Post não encontrado"', () => {
    it('deve setar error="Post não encontrado"', async () => {
      // Given
      const getPostUseCase = createMockGetPostUseCase({
        execute: jest.fn().mockRejectedValue(new Error('Post não encontrado')),
      });
      const { result } = renderHook(() => usePost({ getPostUseCase, id: '999' }));

      // Then
      await waitFor(() => {
        expect(result.current.error).toBe('Post não encontrado');
      });
    });

    it('deve setar post=null', async () => {
      // Given
      const getPostUseCase = createMockGetPostUseCase({
        execute: jest.fn().mockRejectedValue(new Error('Post não encontrado')),
      });
      const { result } = renderHook(() => usePost({ getPostUseCase, id: '999' }));

      // Then
      await waitFor(() => {
        expect(result.current.post).toBeNull();
      });
    });

    it('deve setar loading=false', async () => {
      // Given
      const getPostUseCase = createMockGetPostUseCase({
        execute: jest.fn().mockRejectedValue(new Error('Post não encontrado')),
      });
      const { result } = renderHook(() => usePost({ getPostUseCase, id: '999' }));

      // Then
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('dado um id válido e use case lança erro genérico', () => {
    it('deve setar error com a mensagem do erro', async () => {
      // Given
      const getPostUseCase = createMockGetPostUseCase({
        execute: jest.fn().mockRejectedValue(new Error('Erro de conexão. Verifique sua rede.')),
      });
      const { result } = renderHook(() => usePost({ getPostUseCase, id: '1' }));

      // Then
      await waitFor(() => {
        expect(result.current.error).toBe('Erro de conexão. Verifique sua rede.');
      });
    });

    it('deve setar post=null', async () => {
      // Given
      const getPostUseCase = createMockGetPostUseCase({
        execute: jest.fn().mockRejectedValue(new Error('Erro inesperado')),
      });
      const { result } = renderHook(() => usePost({ getPostUseCase, id: '1' }));

      // Then
      await waitFor(() => {
        expect(result.current.post).toBeNull();
      });
    });
  });

  describe('dado id undefined ou vazio', () => {
    it('não deve chamar getPostUseCase.execute quando id é undefined', () => {
      // Given
      const getPostUseCase = createMockGetPostUseCase();

      // When
      renderHook(() => usePost({ getPostUseCase, id: undefined }));

      // Then
      expect(getPostUseCase.execute).not.toHaveBeenCalled();
    });

    it('não deve chamar getPostUseCase.execute quando id é vazio', () => {
      // Given
      const getPostUseCase = createMockGetPostUseCase();

      // When
      renderHook(() => usePost({ getPostUseCase, id: '' }));

      // Then
      expect(getPostUseCase.execute).not.toHaveBeenCalled();
    });

    it('deve setar error="ID é obrigatório" quando id é undefined', () => {
      // Given
      const getPostUseCase = createMockGetPostUseCase();

      // When
      const { result } = renderHook(() => usePost({ getPostUseCase, id: undefined }));

      // Then
      expect(result.current.error).toBe('ID é obrigatório');
    });

    it('deve setar error="ID é obrigatório" quando id é vazio', () => {
      // Given
      const getPostUseCase = createMockGetPostUseCase();

      // When
      const { result } = renderHook(() => usePost({ getPostUseCase, id: '' }));

      // Then
      expect(result.current.error).toBe('ID é obrigatório');
    });

    it('não deve setar loading=true quando id é inválido', () => {
      // Given
      const getPostUseCase = createMockGetPostUseCase();

      // When
      const { result } = renderHook(() => usePost({ getPostUseCase, id: null }));

      // Then
      expect(result.current.loading).toBe(false);
    });
  });

  describe('dado que o id muda', () => {
    it('deve re-executar a busca com o novo id', async () => {
      // Given
      const getPostUseCase = createMockGetPostUseCase();
      const { result, rerender } = renderHook(
        ({ id }) => usePost({ getPostUseCase, id }),
        { initialProps: { id: '1' } }
      );

      await waitFor(() => expect(result.current.post).not.toBeNull());

      // When
      rerender({ id: '2' });

      // Then
      await waitFor(() => {
        expect(getPostUseCase.execute).toHaveBeenCalledWith({ id: '2' });
      });
      expect(getPostUseCase.execute).toHaveBeenCalledTimes(2);
    });

    it('deve resetar o estado antes da nova busca', async () => {
      // Given
      let resolveSecond;
      const secondPromise = new Promise((resolve) => { resolveSecond = resolve; });
      const getPostUseCase = createMockGetPostUseCase({
        execute: jest.fn()
          .mockResolvedValueOnce({ id: '1', titulo: 'Post 1', conteudo: 'C1', autor: 'A', createdAt: '2024-01-01' })
          .mockReturnValueOnce(secondPromise),
      });

      const { result, rerender } = renderHook(
        ({ id }) => usePost({ getPostUseCase, id }),
        { initialProps: { id: '1' } }
      );

      await waitFor(() => expect(result.current.post).not.toBeNull());

      // When - change id
      rerender({ id: '2' });

      // Then - should be loading with error reset
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();

      // Cleanup
      await act(async () => {
        resolveSecond({ id: '2', titulo: 'Post 2', conteudo: 'C2', autor: 'B', createdAt: '2024-01-02' });
      });
    });
  });
});
