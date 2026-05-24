import { screen } from '@testing-library/react';
import { renderWithProviders, mockAuthRepository } from '../../../../shared/test-utils';
import RegisterPage from './RegisterPage';

describe('RegisterPage', () => {
  describe('dado usuária não autenticada', () => {
    it('deve renderizar título "Criar Conta" e RegisterForm', () => {
      renderWithProviders(<RegisterPage />);

      expect(screen.getByTestId('register-page-title')).toHaveTextContent('Criar Conta');
      expect(screen.getByTestId('register-form')).toBeInTheDocument();
    });

    it('deve renderizar link para login', () => {
      renderWithProviders(<RegisterPage />);

      const link = screen.getByTestId('register-link-login');
      expect(link).toHaveTextContent('Já tem uma conta? Entrar');
      expect(link).toHaveAttribute('href', '/login');
    });
  });

  describe('dado usuária já autenticada (teacher)', () => {
    it('deve redirecionar para /admin', () => {
      const repo = mockAuthRepository({
        getCurrentUser: jest.fn(() => ({ id: '1', name: 'Prof', email: 'p@t.com', role: 'teacher' })),
        isAuthenticated: jest.fn(() => true),
      });

      renderWithProviders(<RegisterPage />, { authRepository: repo, initialEntries: ['/register'] });

      expect(screen.queryByTestId('register-form')).not.toBeInTheDocument();
    });
  });

  describe('dado usuária já autenticada (student)', () => {
    it('deve redirecionar para /', () => {
      const repo = mockAuthRepository({
        getCurrentUser: jest.fn(() => ({ id: '1', name: 'Ana', email: 'a@t.com', role: 'student' })),
        isAuthenticated: jest.fn(() => true),
      });

      renderWithProviders(<RegisterPage />, { authRepository: repo, initialEntries: ['/register'] });

      expect(screen.queryByTestId('register-form')).not.toBeInTheDocument();
    });
  });
});
