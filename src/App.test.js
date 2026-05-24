import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './shared/contexts/AuthContext';
import { mockAuthRepository } from './shared/test-utils';
import theme from './shared/styles/theme';
import App from './App';

// Mock PostApiRepository to prevent HTTP calls from pages
jest.mock('./domains/posts/infrastructure/repositories/PostApiRepository', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      findAll: jest.fn().mockResolvedValue({ data: [], pagination: { page: 1, totalPages: 0, total: 0 } }),
      search: jest.fn().mockResolvedValue({ data: [], pagination: { page: 1, totalPages: 0, total: 0 } }),
      findById: jest.fn().mockResolvedValue({ id: '1', titulo: 'Test', conteudo: 'Content', autor: 'Author', createdAt: '2026-01-01' }),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

function renderApp(route = '/', { authenticated = false } = {}) {
  const authRepo = mockAuthRepository(
    authenticated
      ? { getCurrentUser: jest.fn(() => ({ id: '1', name: 'User', email: 'u@test.com', role: 'teacher' })) }
      : {}
  );

  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider authRepository={authRepo}>
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

describe('App Routing', () => {
  describe('Layout global', () => {
    it('deve renderizar o Header em qualquer rota', () => {
      renderApp('/');
      expect(screen.getByTestId('header-nav')).toBeInTheDocument();
    });

    it('deve renderizar o Footer em qualquer rota', () => {
      renderApp('/');
      expect(screen.getByTestId('footer-container')).toBeInTheDocument();
    });

    it('deve renderizar o Header na rota 404', () => {
      renderApp('/rota-inexistente');
      expect(screen.getByTestId('header-nav')).toBeInTheDocument();
    });

    it('deve renderizar o Footer na rota 404', () => {
      renderApp('/rota-inexistente');
      expect(screen.getByTestId('footer-container')).toBeInTheDocument();
    });
  });

  describe('Rotas públicas', () => {
    describe('dado que o usuário acessa /', () => {
      it('deve renderizar a Home page', () => {
        renderApp('/');
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    describe('dado que o usuário acessa /posts/:id', () => {
      it('deve renderizar a PostDetail page', () => {
        renderApp('/posts/abc-123');
        expect(screen.getByTestId('post-detail-page')).toBeInTheDocument();
      });
    });

    describe('dado que o usuário acessa /login', () => {
      it('deve renderizar a LoginPage', () => {
        renderApp('/login');
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });
  });

  describe('Rotas protegidas — usuário NÃO autenticado', () => {
    describe('dado que o usuário NÃO autenticado acessa /admin', () => {
      it('deve redirecionar para /login', () => {
        renderApp('/admin', { authenticated: false });
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
        expect(screen.queryByTestId('admin-page')).not.toBeInTheDocument();
      });
    });

    describe('dado que o usuário NÃO autenticado acessa /admin/posts/new', () => {
      it('deve redirecionar para /login', () => {
        renderApp('/admin/posts/new', { authenticated: false });
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    describe('dado que o usuário NÃO autenticado acessa /admin/posts/:id/edit', () => {
      it('deve redirecionar para /login', () => {
        renderApp('/admin/posts/xyz/edit', { authenticated: false });
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });
  });

  describe('Rotas protegidas — usuário autenticado', () => {
    describe('dado que o usuário autenticado acessa /admin', () => {
      it('deve renderizar a Admin page', () => {
        renderApp('/admin', { authenticated: true });
        expect(screen.getByTestId('admin-page')).toBeInTheDocument();
      });
    });

    describe('dado que o usuário autenticado acessa /admin/posts/new', () => {
      it('deve renderizar a CreatePost page', () => {
        renderApp('/admin/posts/new', { authenticated: true });
        expect(screen.getByTestId('create-post-page')).toBeInTheDocument();
      });
    });

    describe('dado que o usuário autenticado acessa /admin/posts/:id/edit', () => {
      it('deve renderizar a EditPost page', () => {
        renderApp('/admin/posts/xyz/edit', { authenticated: true });
        expect(screen.getByTestId('edit-post-page')).toBeInTheDocument();
      });
    });
  });

  describe('Rota inexistente (404)', () => {
    describe('dado que o usuário acessa uma rota que não existe', () => {
      it('deve renderizar a página NotFound', () => {
        renderApp('/rota-inexistente');
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });

      it('deve exibir link para voltar ao início', () => {
        renderApp('/pagina-qualquer');
        expect(screen.getByTestId('not-found-link-home')).toHaveAttribute('href', '/');
      });
    });
  });
});