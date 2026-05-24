import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from '../../../../shared/contexts/AuthContext';
import { mockAuthRepository } from '../../../../shared/test-utils';
import theme from '../../../../shared/styles/theme';
import Admin from './Admin';

const mockFindAll = jest.fn();
const mockDelete = jest.fn();

jest.mock('../../infrastructure/repositories/PostApiRepository', () => ({
  __esModule: true,
  default: function MockPostApiRepository() {
    this.findAll = mockFindAll;
    this.search = jest.fn();
    this.findById = jest.fn();
    this.create = jest.fn();
    this.update = jest.fn();
    this.delete = mockDelete;
  },
}));

const mockPosts = [
  { id: '1', titulo: 'Post sobre React', conteudo: 'Conteúdo sobre React hooks', autor: 'Professor A', status: 'published', createdAt: '2024-06-15T10:00:00.000Z' },
  { id: '2', titulo: 'Rascunho Node', conteudo: 'Conteúdo sobre Node.js', autor: 'Professor B', status: 'draft', createdAt: '2024-06-16T10:00:00.000Z' },
];

const mockPaginatedResponse = {
  data: mockPosts,
  pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
};

const mockMultiPageResponse = {
  data: mockPosts,
  pagination: { page: 1, limit: 10, total: 25, totalPages: 3 },
};

function LocationDisplay() {
  const { useLocation } = require('react-router-dom');
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
}

function renderAdminPage() {
  const authRepo = mockAuthRepository({
    isAuthenticated: () => true,
    getCurrentUser: () => ({ id: '1', name: 'Docente' }),
  });
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider authRepository={authRepo}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/posts/new" element={<LocationDisplay />} />
            <Route path="/admin/posts/:id/edit" element={<LocationDisplay />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

describe('Admin Page', () => {
  beforeEach(() => {
    mockFindAll.mockReset();
    mockDelete.mockReset();
  });

  describe('quando a página carrega com sucesso', () => {
    it('deve exibir tabela com todos os posts', async () => {
      // Given
      mockFindAll.mockResolvedValue(mockPaginatedResponse);

      // When
      renderAdminPage();

      // Then
      expect(await screen.findByTestId('admin-table')).toBeInTheDocument();
      expect(screen.getByTestId('admin-row-1')).toBeInTheDocument();
      expect(screen.getByTestId('admin-row-2')).toBeInTheDocument();
    });

    it('deve chamar ListPosts com status "all"', async () => {
      // Given
      mockFindAll.mockResolvedValue(mockPaginatedResponse);

      // When
      renderAdminPage();

      // Then
      await waitFor(() => {
        expect(mockFindAll).toHaveBeenCalledWith(1, 10, 'all');
      });
    });

    it('deve exibir botão "Novo Post"', async () => {
      // Given
      mockFindAll.mockResolvedValue(mockPaginatedResponse);

      // When
      renderAdminPage();

      // Then
      expect(await screen.findByTestId('admin-btn-new-post')).toBeInTheDocument();
    });

    it('deve exibir botões de editar e excluir para cada post', async () => {
      // Given
      mockFindAll.mockResolvedValue(mockPaginatedResponse);

      // When
      renderAdminPage();

      // Then
      expect(await screen.findByTestId('admin-btn-edit-1')).toBeInTheDocument();
      expect(screen.getByTestId('admin-btn-delete-1')).toBeInTheDocument();
      expect(screen.getByTestId('admin-btn-edit-2')).toBeInTheDocument();
      expect(screen.getByTestId('admin-btn-delete-2')).toBeInTheDocument();
    });

    it('deve exibir badges de status (draft/published)', async () => {
      // Given
      mockFindAll.mockResolvedValue(mockPaginatedResponse);

      // When
      renderAdminPage();

      // Then
      await screen.findByTestId('admin-table');
      expect(screen.getAllByText('published').length).toBeGreaterThan(0);
      expect(screen.getAllByText('draft').length).toBeGreaterThan(0);
    });

    it('deve exibir datas formatadas em pt-BR', async () => {
      // Given
      mockFindAll.mockResolvedValue(mockPaginatedResponse);

      // When
      renderAdminPage();

      // Then
      await screen.findByTestId('admin-table');
      const dateFormatted = new Date('2024-06-15T10:00:00.000Z').toLocaleDateString('pt-BR');
      expect(screen.getAllByText(dateFormatted).length).toBeGreaterThan(0);
    });
  });

  describe('quando está carregando', () => {
    it('deve exibir o spinner de loading', () => {
      // Given
      mockFindAll.mockReturnValue(new Promise(() => {}));

      // When
      renderAdminPage();

      // Then
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('não deve exibir a tabela durante o carregamento', () => {
      // Given
      mockFindAll.mockReturnValue(new Promise(() => {}));

      // When
      renderAdminPage();

      // Then
      expect(screen.queryByTestId('admin-table')).not.toBeInTheDocument();
    });
  });

  describe('quando não há posts', () => {
    it('deve exibir mensagem "Nenhum post encontrado"', async () => {
      // Given
      mockFindAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      // When
      renderAdminPage();

      // Then
      expect(await screen.findByTestId('admin-empty-message')).toHaveTextContent('Nenhum post encontrado');
    });

    it('não deve renderizar a tabela', async () => {
      // Given
      mockFindAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      // When
      renderAdminPage();

      // Then
      await screen.findByTestId('admin-empty-message');
      expect(screen.queryByTestId('admin-table')).not.toBeInTheDocument();
    });

    it('deve manter o botão "Novo Post" visível', async () => {
      // Given
      mockFindAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      // When
      renderAdminPage();

      // Then
      await screen.findByTestId('admin-empty-message');
      expect(screen.getByTestId('admin-btn-new-post')).toBeInTheDocument();
    });
  });

  describe('quando ocorre erro na API', () => {
    it('deve exibir mensagem de erro', async () => {
      // Given
      mockFindAll.mockRejectedValue(new Error('Erro de conexão. Verifique sua rede.'));

      // When
      renderAdminPage();

      // Then
      expect(await screen.findByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message-text')).toHaveTextContent('Erro de conexão. Verifique sua rede.');
    });

    it('não deve exibir tabela nem loading', async () => {
      // Given
      mockFindAll.mockRejectedValue(new Error('Erro'));

      // When
      renderAdminPage();

      // Then
      await screen.findByTestId('error-message');
      expect(screen.queryByTestId('admin-table')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  describe('quando o docente clica em "Novo Post"', () => {
    it('deve navegar para /admin/posts/new', async () => {
      // Given
      const user = userEvent.setup();
      mockFindAll.mockResolvedValue(mockPaginatedResponse);
      renderAdminPage();
      await screen.findByTestId('admin-table');

      // When
      await user.click(screen.getByTestId('admin-btn-new-post'));

      // Then
      await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent('/admin/posts/new');
      });
    });
  });

  describe('quando o docente clica em "Editar"', () => {
    it('deve navegar para /admin/posts/:id/edit', async () => {
      // Given
      const user = userEvent.setup();
      mockFindAll.mockResolvedValue(mockPaginatedResponse);
      renderAdminPage();
      await screen.findByTestId('admin-table');

      // When
      await user.click(screen.getByTestId('admin-btn-edit-1'));

      // Then
      await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent('/admin/posts/1/edit');
      });
    });
  });

  describe('quando o docente clica em "Excluir"', () => {
    it('deve abrir o dialog de confirmação', async () => {
      // Given
      const user = userEvent.setup();
      mockFindAll.mockResolvedValue(mockPaginatedResponse);
      renderAdminPage();
      await screen.findByTestId('admin-table');

      // When
      await user.click(screen.getByTestId('admin-btn-delete-1'));

      // Then
      expect(screen.getByTestId('admin-confirm-dialog')).toBeInTheDocument();
    });

    it('não deve chamar delete imediatamente', async () => {
      // Given
      const user = userEvent.setup();
      mockFindAll.mockResolvedValue(mockPaginatedResponse);
      renderAdminPage();
      await screen.findByTestId('admin-table');

      // When
      await user.click(screen.getByTestId('admin-btn-delete-1'));

      // Then
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('quando o docente confirma a exclusão', () => {
    it('deve chamar DeletePost.execute com o id correto', async () => {
      // Given
      const user = userEvent.setup();
      mockFindAll.mockResolvedValue(mockPaginatedResponse);
      mockDelete.mockResolvedValue(undefined);
      renderAdminPage();
      await screen.findByTestId('admin-table');

      // When
      await user.click(screen.getByTestId('admin-btn-delete-1'));
      await user.click(screen.getByTestId('admin-btn-confirm-yes'));

      // Then
      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith('1');
      });
    });

    it('deve remover o post da lista após sucesso', async () => {
      // Given
      const user = userEvent.setup();
      mockFindAll
        .mockResolvedValueOnce(mockPaginatedResponse)
        .mockResolvedValueOnce({
          data: [mockPosts[1]],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        });
      mockDelete.mockResolvedValue(undefined);
      renderAdminPage();
      await screen.findByTestId('admin-table');

      // When
      await user.click(screen.getByTestId('admin-btn-delete-1'));
      await user.click(screen.getByTestId('admin-btn-confirm-yes'));

      // Then
      await waitFor(() => {
        expect(screen.queryByTestId('admin-row-1')).not.toBeInTheDocument();
      });
    });

    it('deve fechar o dialog após sucesso', async () => {
      // Given
      const user = userEvent.setup();
      mockFindAll
        .mockResolvedValueOnce(mockPaginatedResponse)
        .mockResolvedValueOnce(mockPaginatedResponse);
      mockDelete.mockResolvedValue(undefined);
      renderAdminPage();
      await screen.findByTestId('admin-table');

      // When
      await user.click(screen.getByTestId('admin-btn-delete-1'));
      await user.click(screen.getByTestId('admin-btn-confirm-yes'));

      // Then
      await waitFor(() => {
        expect(screen.queryByTestId('admin-confirm-dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('quando o docente cancela a exclusão', () => {
    it('deve fechar o dialog sem chamar delete', async () => {
      // Given
      const user = userEvent.setup();
      mockFindAll.mockResolvedValue(mockPaginatedResponse);
      renderAdminPage();
      await screen.findByTestId('admin-table');

      // When
      await user.click(screen.getByTestId('admin-btn-delete-1'));
      await user.click(screen.getByTestId('admin-btn-confirm-no'));

      // Then
      expect(screen.queryByTestId('admin-confirm-dialog')).not.toBeInTheDocument();
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('quando a exclusão falha', () => {
    it('deve exibir mensagem de erro (admin-delete-error)', async () => {
      // Given
      const user = userEvent.setup();
      mockFindAll.mockResolvedValue(mockPaginatedResponse);
      mockDelete.mockRejectedValue(new Error('Erro ao excluir post'));
      renderAdminPage();
      await screen.findByTestId('admin-table');

      // When
      await user.click(screen.getByTestId('admin-btn-delete-1'));
      await user.click(screen.getByTestId('admin-btn-confirm-yes'));

      // Then
      expect(await screen.findByTestId('admin-delete-error')).toHaveTextContent('Erro ao excluir post');
    });

    it('deve manter o post na lista', async () => {
      // Given
      const user = userEvent.setup();
      mockFindAll.mockResolvedValue(mockPaginatedResponse);
      mockDelete.mockRejectedValue(new Error('Erro ao excluir post'));
      renderAdminPage();
      await screen.findByTestId('admin-table');

      // When
      await user.click(screen.getByTestId('admin-btn-delete-1'));
      await user.click(screen.getByTestId('admin-btn-confirm-yes'));

      // Then
      await screen.findByTestId('admin-delete-error');
      expect(screen.getByTestId('admin-row-1')).toBeInTheDocument();
    });

    it('deve manter o dialog aberto para retry', async () => {
      // Given
      const user = userEvent.setup();
      mockFindAll.mockResolvedValue(mockPaginatedResponse);
      mockDelete.mockRejectedValue(new Error('Erro ao excluir post'));
      renderAdminPage();
      await screen.findByTestId('admin-table');

      // When
      await user.click(screen.getByTestId('admin-btn-delete-1'));
      await user.click(screen.getByTestId('admin-btn-confirm-yes'));

      // Then
      await screen.findByTestId('admin-delete-error');
      expect(screen.getByTestId('admin-confirm-dialog')).toBeInTheDocument();
    });
  });

  describe('paginação', () => {
    it('deve exibir paginação quando totalPages > 1', async () => {
      // Given
      mockFindAll.mockResolvedValue(mockMultiPageResponse);

      // When
      renderAdminPage();

      // Then
      expect(await screen.findByTestId('pagination-container')).toBeInTheDocument();
    });

    it('não deve exibir paginação quando totalPages <= 1', async () => {
      // Given
      mockFindAll.mockResolvedValue(mockPaginatedResponse);

      // When
      renderAdminPage();

      // Then
      await screen.findByTestId('admin-table');
      expect(screen.queryByTestId('pagination-container')).not.toBeInTheDocument();
    });

    it('deve carregar nova página ao clicar', async () => {
      // Given
      const user = userEvent.setup();
      mockFindAll.mockResolvedValue(mockMultiPageResponse);
      renderAdminPage();
      await screen.findByTestId('pagination-container');

      // When
      await user.click(screen.getByTestId('pagination-btn-page-2'));

      // Then
      await waitFor(() => {
        expect(mockFindAll).toHaveBeenCalledWith(2, 10, 'all');
      });
    });
  });
});
