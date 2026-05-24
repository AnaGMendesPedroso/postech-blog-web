import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from '../../../../shared/contexts/AuthContext';
import { mockAuthRepository } from '../../../../shared/test-utils';
import theme from '../../../../shared/styles/theme';
import EditPostPage from './EditPost';

const mockFindById = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../../infrastructure/repositories/PostApiRepository', () => ({
  __esModule: true,
  default: function MockPostApiRepository() {
    this.findById = mockFindById;
    this.update = mockUpdate;
  },
}));

function LocationDisplay() {
  const location = require('react-router-dom').useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
}

const MOCK_POST = {
  id: '123',
  titulo: 'Post Original',
  conteudo: 'Conteúdo original com mais de dez caracteres',
  autor: 'Professor Teste',
  status: 'published',
  createdAt: '2025-01-15T10:00:00Z',
};

describe('EditPost Page', () => {
  beforeEach(() => {
    mockFindById.mockReset();
    mockUpdate.mockReset();
  });

  function renderPage(id = '123') {
    const authRepo = mockAuthRepository({
      isAuthenticated: () => true,
      getCurrentUser: () => ({ id: '1', name: 'User' }),
    });
    return render(
      <ThemeProvider theme={theme}>
        <AuthProvider authRepository={authRepo}>
          <MemoryRouter initialEntries={[`/admin/posts/${id}/edit`]}>
            <Routes>
              <Route path="/admin/posts/:id/edit" element={<EditPostPage />} />
              <Route path="/admin" element={<LocationDisplay />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );
  }

  describe('enquanto os dados do post estão carregando', () => {
    it('deve exibir o loading spinner (data-testid="edit-post-loading")', () => {
      mockFindById.mockReturnValue(new Promise(() => {}));
      renderPage();
      expect(screen.getByTestId('edit-post-loading')).toBeInTheDocument();
    });

    it('não deve renderizar o PostForm enquanto carrega', () => {
      mockFindById.mockReturnValue(new Promise(() => {}));
      renderPage();
      expect(screen.queryByTestId('form-post')).not.toBeInTheDocument();
    });
  });

  describe('dado que o post existe', () => {
    beforeEach(() => {
      mockFindById.mockResolvedValue(MOCK_POST);
    });

    it('deve carregar e exibir os dados atuais no formulário', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByTestId('form-input-titulo')).toHaveValue('Post Original');
      });
      expect(screen.getByTestId('form-input-conteudo')).toHaveValue(MOCK_POST.conteudo);
      expect(screen.getByTestId('form-input-autor')).toHaveValue(MOCK_POST.autor);
      expect(screen.getByTestId('form-select-status')).toHaveValue('published');
    });

    it('deve renderizar o título "Editar Post"', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByTestId('edit-post-title')).toHaveTextContent('Editar Post');
      });
    });

    it('deve renderizar PostForm com submitLabel="Salvar Alterações"', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByTestId('form-btn-submit')).toHaveTextContent('Salvar Alterações');
      });
    });

    it('não deve exibir loading nem erro após carregar', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByTestId('form-post')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('edit-post-loading')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edit-post-error')).not.toBeInTheDocument();
    });
  });

  describe('dado que o post não existe (404)', () => {
    beforeEach(() => {
      mockFindById.mockRejectedValue(new Error('Post não encontrado'));
    });

    it('deve exibir mensagem de erro "Post não encontrado"', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByTestId('edit-post-error')).toBeInTheDocument();
      });
    });

    it('não deve renderizar o PostForm', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByTestId('edit-post-error')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('form-post')).not.toBeInTheDocument();
    });

    it('deve exibir botão "Voltar" para navegação', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByTestId('edit-post-btn-back')).toBeInTheDocument();
      });
    });
  });

  describe('dado que o docente altera o título e salva', () => {
    beforeEach(() => {
      mockFindById.mockResolvedValue(MOCK_POST);
      mockUpdate.mockResolvedValue({ ...MOCK_POST, titulo: 'Título Alterado' });
    });

    it('deve chamar updatePost com id e os dados atualizados', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('form-input-titulo')).toBeInTheDocument();
      });

      const tituloInput = screen.getByTestId('form-input-titulo');
      await user.clear(tituloInput);
      await user.type(tituloInput, 'Título Alterado');
      await user.click(screen.getByTestId('form-btn-submit'));

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledTimes(1);
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({ titulo: 'Título Alterado' })
      );
    });

    it('deve redirecionar para /admin após sucesso', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('form-input-titulo')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('form-btn-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent('/admin');
      });
    });
  });

  describe('dado que o docente envia dados inválidos', () => {
    beforeEach(() => {
      mockFindById.mockResolvedValue(MOCK_POST);
    });

    it('deve exibir erros de validação sem chamar a API de update', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('form-input-titulo')).toBeInTheDocument();
      });

      const tituloInput = screen.getByTestId('form-input-titulo');
      await user.clear(tituloInput);
      await user.click(screen.getByTestId('form-btn-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('form-error-titulo')).toBeInTheDocument();
      });

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('dado que a API retorna erro ao atualizar', () => {
    beforeEach(() => {
      mockFindById.mockResolvedValue(MOCK_POST);
      mockUpdate.mockRejectedValue(new Error('Erro ao comunicar com a API'));
    });

    it('deve exibir a mensagem de erro no formulário', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('form-input-titulo')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('form-btn-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('form-error-message')).toBeInTheDocument();
      });
    });

    it('não deve redirecionar', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('form-input-titulo')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('form-btn-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('form-error-message')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('location-display')).not.toBeInTheDocument();
    });
  });

  describe('dado que o post carregado não possui status (campo opcional)', () => {
    it('deve preencher o formulário com status padrão "draft"', async () => {
      const postSemStatus = {
        id: '123',
        titulo: 'Post Sem Status',
        conteudo: 'Conteúdo do post sem campo status definido',
        autor: 'Professor X',
        createdAt: '2025-01-15T10:00:00Z',
      };
      mockFindById.mockResolvedValue(postSemStatus);
      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('form-input-titulo')).toHaveValue('Post Sem Status');
      });
      expect(screen.getByTestId('form-select-status')).toHaveValue('draft');
    });
  });

  describe('botão Voltar', () => {
    it('deve navegar para /admin ao clicar', async () => {
      mockFindById.mockResolvedValue(MOCK_POST);
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('edit-post-btn-back')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('edit-post-btn-back'));

      await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent('/admin');
      });
    });
  });
});
