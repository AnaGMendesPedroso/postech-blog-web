import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from '../../../../shared/contexts/AuthContext';
import { mockAuthRepository } from '../../../../shared/test-utils';
import theme from '../../../../shared/styles/theme';
import CreatePostPage from './CreatePost';

const mockCreate = jest.fn().mockResolvedValue({ id: '1', titulo: 'Post Criado' });

jest.mock('../../infrastructure/repositories/PostApiRepository', () => ({
  __esModule: true,
  default: function MockPostApiRepository() {
    this.create = mockCreate;
  },
}));

function LocationDisplay() {
  const location = require('react-router-dom').useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
}

describe('CreatePost Page', () => {
  beforeEach(() => {
    mockCreate.mockReset();
    mockCreate.mockResolvedValue({ id: '1', titulo: 'Post Criado' });
  });

  function renderPage() {
    const authRepo = mockAuthRepository({ isAuthenticated: () => true, getCurrentUser: () => ({ id: '1', name: 'User' }) });
    return render(
      <ThemeProvider theme={theme}>
        <AuthProvider authRepository={authRepo}>
          <MemoryRouter initialEntries={['/admin/posts/new']}>
            <Routes>
              <Route path="/admin/posts/new" element={<CreatePostPage />} />
              <Route path="/admin" element={<LocationDisplay />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );
  }

  async function fillAndSubmit(user) {
    await user.type(screen.getByTestId('form-input-titulo'), 'Título válido para teste');
    await user.type(screen.getByTestId('form-input-conteudo'), 'Conteúdo válido com mais de 10 caracteres');
    await user.type(screen.getByTestId('form-input-autor'), 'Professor Teste');
    await user.click(screen.getByTestId('form-btn-submit'));
  }

  describe('dado que o docente está autenticado', () => {
    describe('e preenche todos os campos corretamente', () => {
      it('deve criar o post via use case e redirecionar para /admin', async () => {
        const user = userEvent.setup();
        renderPage();

        await fillAndSubmit(user);

        await waitFor(() => {
          expect(screen.getByTestId('location-display')).toHaveTextContent('/admin');
        });

        expect(mockCreate).toHaveBeenCalledTimes(1);
      });
    });

    describe('e a API retorna erro', () => {
      it('deve exibir a mensagem de erro da API em form-error-message', async () => {
        mockCreate.mockRejectedValue(new Error('Erro ao comunicar com a API'));
        const user = userEvent.setup();
        renderPage();

        await fillAndSubmit(user);

        await waitFor(() => {
          expect(screen.getByTestId('form-error-message')).toBeInTheDocument();
        });
      });

      it('não deve redirecionar', async () => {
        mockCreate.mockRejectedValue(new Error('Erro ao comunicar com a API'));
        const user = userEvent.setup();
        renderPage();

        await fillAndSubmit(user);

        await waitFor(() => {
          expect(screen.getByTestId('form-error-message')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('location-display')).not.toBeInTheDocument();
      });
    });
  });

  describe('integração com PostForm', () => {
    it('deve renderizar PostForm com submitLabel="Criar Post"', () => {
      renderPage();

      expect(screen.getByTestId('form-btn-submit')).toHaveTextContent('Criar Post');
    });

    it('deve renderizar o título da página', () => {
      renderPage();

      expect(screen.getByTestId('create-post-title')).toHaveTextContent('Criar Post');
    });
  });
});