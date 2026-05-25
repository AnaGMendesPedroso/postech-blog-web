import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockAuthRepository } from '../../../../shared/test-utils';
import LoginPage from './LoginPage';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Navigate: ({ to }) => <div data-testid="navigate-mock">Redirected to {to}</div>,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('dado usuário não autenticado', () => {
    it('deve renderizar título "Login" e LoginForm', () => {
      renderWithProviders(<LoginPage />);

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.getByTestId('login-page-title')).toHaveTextContent('Login');
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });
  });

  describe('dado credenciais válidas no submit', () => {
    it('deve chamar login do context e navegar para /admin', async () => {
      // Given
      const user = userEvent.setup();
      const authRepo = mockAuthRepository();
      renderWithProviders(<LoginPage />, { authRepository: authRepo });

      // When
      await user.type(screen.getByTestId('login-input-email'), 'professor@postech.com');
      await user.type(screen.getByTestId('login-input-password'), 'postech123');
      await user.click(screen.getByTestId('login-btn-submit'));

      // Then
      await waitFor(() => {
        expect(authRepo.login).toHaveBeenCalledWith('professor@postech.com', 'postech123');
      });
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin');
      });
      // wait for setUser to fire and page to show the authenticated redirect
      await screen.findByTestId('navigate-mock');
    });

    it('deve exibir loading state durante a requisição', async () => {
      // Given
      const user = userEvent.setup();
      let resolveLogin;
      const loginPromise = new Promise((resolve) => { resolveLogin = resolve; });
      const authRepo = mockAuthRepository({
        login: jest.fn().mockReturnValue(loginPromise),
      });
      renderWithProviders(<LoginPage />, { authRepository: authRepo });

      // When
      await user.type(screen.getByTestId('login-input-email'), 'professor@postech.com');
      await user.type(screen.getByTestId('login-input-password'), 'postech123');
      await user.click(screen.getByTestId('login-btn-submit'));

      // Then - loading state
      expect(screen.getByTestId('login-btn-submit')).toHaveTextContent('Entrando...');
      expect(screen.getByTestId('login-btn-submit')).toBeDisabled();

      // Cleanup — resolve the pending promise and wait for state to settle
      resolveLogin({ user: { id: '1', name: 'Test', email: 'test@test.com' }, token: 'tok' });
      await screen.findByTestId('navigate-mock');
    });
  });

  describe('dado credenciais inválidas no submit', () => {
    it('deve exibir mensagem de erro no form', async () => {
      // Given
      const user = userEvent.setup();
      const authRepo = mockAuthRepository({
        login: jest.fn().mockRejectedValue(new Error('Credenciais inválidas')),
      });
      renderWithProviders(<LoginPage />, { authRepository: authRepo });

      // When
      await user.type(screen.getByTestId('login-input-email'), 'wrong@email.com');
      await user.type(screen.getByTestId('login-input-password'), 'wrongpass');
      await user.click(screen.getByTestId('login-btn-submit'));

      // Then
      await waitFor(() => {
        expect(screen.getByTestId('login-error-message')).toHaveTextContent('Credenciais inválidas');
      });
    });
  });

  describe('dado usuário já autenticado', () => {
    it('deve redirecionar para /admin sem renderizar form', () => {
      // Given
      const authRepo = mockAuthRepository({
        getCurrentUser: jest.fn(() => ({ id: '1', name: 'Professor', email: 'professor@postech.com' })),
      });

      // When
      renderWithProviders(<LoginPage />, { authRepository: authRepo });

      // Then
      expect(screen.getByTestId('navigate-mock')).toHaveTextContent('Redirected to /admin');
      expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
    });
  });
});
