import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../../shared/test-utils';
import Home from './Home';
import PostApiRepository from '../../infrastructure/repositories/PostApiRepository';

jest.mock('../../infrastructure/repositories/PostApiRepository');

const mockPosts = [
  { id: '1', titulo: 'Post sobre React', conteudo: 'Conteúdo sobre React hooks e componentes', autor: 'Professor A', createdAt: '2024-06-15T10:00:00.000Z' },
  { id: '2', titulo: 'Post sobre Node', conteudo: 'Conteúdo sobre Node.js e Express', autor: 'Professor B', createdAt: '2024-06-16T10:00:00.000Z' },
];

const mockPaginatedResponse = {
  data: mockPosts,
  pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
};

const mockMultiPageResponse = {
  data: mockPosts,
  pagination: { page: 1, limit: 10, total: 25, totalPages: 3 },
};

function setupMocks(overrides = {}) {
  const mockFindAll = jest.fn().mockResolvedValue(mockPaginatedResponse);
  const mockSearch = jest.fn().mockResolvedValue({
    data: [mockPosts[0]],
    pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
  });

  PostApiRepository.mockImplementation(() => ({
    findAll: overrides.findAll || mockFindAll,
    search: overrides.search || mockSearch,
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }));

  return { mockFindAll, mockSearch };
}

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('quando a página carrega com sucesso', () => {
    it('deve exibir a lista de posts publicados', async () => {
      // Given
      setupMocks();

      // When
      renderWithProviders(<Home />);

      // Then
      expect(await screen.findByTestId('post-card-title-1')).toHaveTextContent('Post sobre React');
      expect(screen.getByTestId('post-card-title-2')).toHaveTextContent('Post sobre Node');
    });

    it('deve exibir a paginação quando há múltiplas páginas', async () => {
      // Given
      setupMocks({
        findAll: jest.fn().mockResolvedValue(mockMultiPageResponse),
      });

      // When
      renderWithProviders(<Home />);

      // Then
      expect(await screen.findByTestId('pagination-container')).toBeInTheDocument();
    });

    it('não deve exibir paginação se totalPages <= 1', async () => {
      // Given
      setupMocks();

      // When
      renderWithProviders(<Home />);

      // Then
      await screen.findByTestId('post-card-1');
      expect(screen.queryByTestId('pagination-container')).not.toBeInTheDocument();
    });
  });

  describe('quando está carregando', () => {
    it('deve exibir o spinner de loading', async () => {
      // Given
      let resolveFind;
      const findPromise = new Promise((resolve) => { resolveFind = resolve; });
      setupMocks({ findAll: jest.fn().mockReturnValue(findPromise) });

      // When
      renderWithProviders(<Home />);

      // Then
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // Cleanup
      resolveFind(mockPaginatedResponse);
      await waitFor(() => expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument());
    });
  });

  describe('quando não há posts', () => {
    it('deve exibir "Nenhum post encontrado"', async () => {
      // Given
      setupMocks({
        findAll: jest.fn().mockResolvedValue({
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        }),
      });

      // When
      renderWithProviders(<Home />);

      // Then
      expect(await screen.findByTestId('post-list-empty')).toHaveTextContent('Nenhum post encontrado');
    });
  });

  describe('quando ocorre erro na API', () => {
    it('deve exibir mensagem de erro', async () => {
      // Given
      setupMocks({
        findAll: jest.fn().mockRejectedValue(new Error('Erro de conexão. Verifique sua rede.')),
      });

      // When
      renderWithProviders(<Home />);

      // Then
      expect(await screen.findByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message-text')).toHaveTextContent('Erro de conexão. Verifique sua rede.');
    });

    it('não deve exibir o spinner', async () => {
      // Given
      setupMocks({
        findAll: jest.fn().mockRejectedValue(new Error('Erro')),
      });

      // When
      renderWithProviders(<Home />);

      // Then
      await screen.findByTestId('error-message');
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  describe('quando o usuário busca por "react"', () => {
    it('deve exibir apenas posts que contêm o termo', async () => {
      // Given
      const user = userEvent.setup();
      setupMocks();
      renderWithProviders(<Home />);

      // Wait for initial load
      await screen.findByTestId('post-card-1');

      // When
      await user.type(screen.getByTestId('search-input'), 'react');
      await user.click(screen.getByTestId('search-btn-submit'));

      // Then
      await waitFor(() => {
        expect(screen.getByTestId('post-card-title-1')).toHaveTextContent('Post sobre React');
      });
    });
  });

  describe('quando o usuário limpa a busca', () => {
    it('deve voltar à listagem completa', async () => {
      // Given
      const user = userEvent.setup();
      const mockFindAll = jest.fn().mockResolvedValue(mockPaginatedResponse);
      setupMocks({ findAll: mockFindAll });
      renderWithProviders(<Home />);

      await screen.findByTestId('post-card-1');

      // Do a search first
      await user.type(screen.getByTestId('search-input'), 'react');
      await user.click(screen.getByTestId('search-btn-submit'));
      await waitFor(() => expect(screen.getByTestId('post-card-1')).toBeInTheDocument());

      // When - clear
      await user.click(screen.getByTestId('search-btn-clear'));

      // Then
      await waitFor(() => {
        expect(mockFindAll).toHaveBeenLastCalledWith(1, 10, 'published');
      });
    });
  });

  describe('quando o usuário muda de página', () => {
    it('deve carregar os posts da nova página', async () => {
      // Given
      const user = userEvent.setup();
      const mockFindAll = jest.fn().mockResolvedValue(mockMultiPageResponse);
      setupMocks({ findAll: mockFindAll });
      renderWithProviders(<Home />);

      await screen.findByTestId('pagination-container');

      // When
      await user.click(screen.getByTestId('pagination-btn-page-2'));

      // Then
      await waitFor(() => {
        expect(mockFindAll).toHaveBeenCalledWith(2, 10, 'published');
      });
    });
  });
});
