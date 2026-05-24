import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

function TestConsumer() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="is-auth">{String(isAuthenticated)}</span>
      <span data-testid="user">{user ? user.name : 'null'}</span>
      <button onClick={() => login('test@test.com', '123')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

function mockAuthRepository(overrides = {}) {
  return {
    login: jest.fn().mockResolvedValue({ user: { id: '1', name: 'Test User', email: 'test@test.com' }, token: 'tok' }),
    logout: jest.fn().mockResolvedValue(undefined),
    getCurrentUser: jest.fn(() => null),
    isAuthenticated: jest.fn(() => false),
    ...overrides,
  };
}

describe('AuthContext', () => {
  describe('dado usuário não autenticado inicialmente', () => {
    it('deve retornar isAuthenticated false', () => {
      const repo = mockAuthRepository();
      render(
        <AuthProvider authRepository={repo}>
          <TestConsumer />
        </AuthProvider>
      );
      expect(screen.getByTestId('is-auth')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  describe('dado usuário autenticado inicialmente', () => {
    it('deve retornar isAuthenticated true e user', () => {
      const repo = mockAuthRepository({
        getCurrentUser: jest.fn(() => ({ id: '1', name: 'Professor' })),
      });
      render(
        <AuthProvider authRepository={repo}>
          <TestConsumer />
        </AuthProvider>
      );
      expect(screen.getByTestId('is-auth')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('Professor');
    });
  });

  describe('quando login é chamado', () => {
    it('deve atualizar user e isAuthenticated', async () => {
      const repo = mockAuthRepository();
      render(
        <AuthProvider authRepository={repo}>
          <TestConsumer />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByText('Login').click();
      });

      expect(repo.login).toHaveBeenCalledWith('test@test.com', '123');
      expect(screen.getByTestId('is-auth')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });
  });

  describe('quando logout é chamado', () => {
    it('deve limpar user e isAuthenticated', async () => {
      const repo = mockAuthRepository({
        getCurrentUser: jest.fn(() => ({ id: '1', name: 'Professor' })),
      });
      render(
        <AuthProvider authRepository={repo}>
          <TestConsumer />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByText('Logout').click();
      });

      expect(repo.logout).toHaveBeenCalled();
      expect(screen.getByTestId('is-auth')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  describe('useAuth fora do Provider', () => {
    it('deve lançar erro', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<TestConsumer />)).toThrow('useAuth deve ser usado dentro de um AuthProvider');
      consoleSpy.mockRestore();
    });
  });
});
