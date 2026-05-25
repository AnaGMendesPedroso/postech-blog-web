import { renderHook, act, waitFor } from '@testing-library/react';
import usePosts from './usePosts';

function createMockUseCases(overrides = {}) {
  return {
    listPostsUseCase: {
      execute: jest.fn().mockResolvedValue({
        data: [
          { id: '1', titulo: 'Post 1', conteudo: 'Conteúdo 1', autor: 'Autor 1', createdAt: '2024-01-01' },
          { id: '2', titulo: 'Post 2', conteudo: 'Conteúdo 2', autor: 'Autor 2', createdAt: '2024-01-02' },
        ],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      }),
    },
    searchPostsUseCase: {
      execute: jest.fn().mockResolvedValue({
        data: [
          { id: '1', titulo: 'React Post', conteudo: 'Sobre React', autor: 'Autor', createdAt: '2024-01-01' },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      }),
    },
    ...overrides,
  };
}

describe('usePosts', () => {
  describe('dado loadPosts chamado', () => {
    it('deve setar loading=true e depois false', async () => {
      // Given
      const mocks = createMockUseCases();
      const { result } = renderHook(() => usePosts(mocks));

      // Initially not loading
      expect(result.current.loading).toBe(false);

      // When
      await act(async () => {
        result.current.loadPosts(1);
      });

      // Then
      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('deve retornar posts e pagination do use case', async () => {
      // Given
      const mocks = createMockUseCases();
      const { result } = renderHook(() => usePosts(mocks));

      // When
      await act(async () => {
        result.current.loadPosts(1);
      });

      // Then
      await waitFor(() => {
        expect(result.current.posts).toHaveLength(2);
      });
      expect(result.current.pagination.totalPages).toBe(1);
      expect(result.current.pagination.page).toBe(1);
    });

    it('deve chamar listPostsUseCase com status=published', async () => {
      // Given
      const mocks = createMockUseCases();
      const { result } = renderHook(() => usePosts(mocks));

      // When
      await act(async () => {
        result.current.loadPosts(1);
      });

      // Then
      expect(mocks.listPostsUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'published' })
      );
    });

    it('deve chamar com page e limit corretos', async () => {
      // Given
      const mocks = createMockUseCases();
      const { result } = renderHook(() => usePosts({ ...mocks, limit: 5 }));

      // When
      await act(async () => {
        result.current.loadPosts(2);
      });

      // Then
      expect(mocks.listPostsUseCase.execute).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        status: 'published',
      });
    });
  });

  describe('dado erro no loadPosts', () => {
    it('deve setar error com mensagem do erro', async () => {
      // Given
      const mocks = createMockUseCases({
        listPostsUseCase: {
          execute: jest.fn().mockRejectedValue(new Error('Erro de conexão')),
        },
      });
      const { result } = renderHook(() => usePosts(mocks));

      // When
      await act(async () => {
        result.current.loadPosts(1);
      });

      // Then
      await waitFor(() => {
        expect(result.current.error).toBe('Erro de conexão');
      });
    });

    it('deve setar posts como array vazio', async () => {
      // Given
      const mocks = createMockUseCases({
        listPostsUseCase: {
          execute: jest.fn().mockRejectedValue(new Error('Erro')),
        },
      });
      const { result } = renderHook(() => usePosts(mocks));

      // When
      await act(async () => {
        result.current.loadPosts(1);
      });

      // Then
      await waitFor(() => {
        expect(result.current.posts).toEqual([]);
      });
    });

    it('deve setar loading=false', async () => {
      // Given
      const mocks = createMockUseCases({
        listPostsUseCase: {
          execute: jest.fn().mockRejectedValue(new Error('Erro')),
        },
      });
      const { result } = renderHook(() => usePosts(mocks));

      // When
      await act(async () => {
        result.current.loadPosts(1);
      });

      // Then
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('dado searchPosts chamado', () => {
    it('deve chamar searchPostsUseCase com query, page, limit', async () => {
      // Given
      const mocks = createMockUseCases();
      const { result } = renderHook(() => usePosts(mocks));

      // When
      await act(async () => {
        result.current.searchPosts('react', 1);
      });

      // Then
      expect(mocks.searchPostsUseCase.execute).toHaveBeenCalledWith({
        query: 'react',
        page: 1,
        limit: 10,
      });
    });

    it('deve retornar posts filtrados', async () => {
      // Given
      const mocks = createMockUseCases();
      const { result } = renderHook(() => usePosts(mocks));

      // When
      await act(async () => {
        result.current.searchPosts('react', 1);
      });

      // Then
      await waitFor(() => {
        expect(result.current.posts).toHaveLength(1);
      });
      expect(result.current.posts[0].titulo).toBe('React Post');
    });

    it('deve setar loading durante a operação', async () => {
      // Given
      let resolveSearch;
      const searchPromise = new Promise((resolve) => { resolveSearch = resolve; });
      const mocks = createMockUseCases({
        searchPostsUseCase: { execute: jest.fn().mockReturnValue(searchPromise) },
      });
      const { result } = renderHook(() => usePosts(mocks));

      // When
      act(() => {
        result.current.searchPosts('react', 1);
      });

      // Then - loading during operation
      expect(result.current.loading).toBe(true);

      // Cleanup
      await act(async () => {
        resolveSearch({ data: [], pagination: { page: 1, totalPages: 0, total: 0 } });
      });
    });
  });

  describe('dado erro no searchPosts', () => {
    it('deve setar error com mensagem do erro', async () => {
      // Given
      const mocks = createMockUseCases({
        searchPostsUseCase: {
          execute: jest.fn().mockRejectedValue(new Error('Busca falhou')),
        },
      });
      const { result } = renderHook(() => usePosts(mocks));

      // When
      await act(async () => {
        result.current.searchPosts('react', 1);
      });

      // Then
      await waitFor(() => {
        expect(result.current.error).toBe('Busca falhou');
      });
    });
  });

  describe('dado clearSearch chamado', () => {
    it('deve recarregar listagem (loadPosts página 1)', async () => {
      // Given
      const mocks = createMockUseCases();
      const { result } = renderHook(() => usePosts(mocks));

      // First do a search
      await act(async () => {
        result.current.searchPosts('react', 1);
      });

      // When
      await act(async () => {
        result.current.clearSearch();
      });

      // Then
      await waitFor(() => {
        expect(mocks.listPostsUseCase.execute).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1, status: 'published' })
        );
      });
    });
  });
});
