import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockAuthRepository } from '../test-utils';
import Header from './Header';

describe('Header', () => {
  describe('dado usuário não autenticado', () => {
    it('deve renderizar link para home', () => {
      renderWithProviders(<Header />);
      expect(screen.getByTestId('header-link-home')).toBeInTheDocument();
    });

    it('deve renderizar link para login', () => {
      renderWithProviders(<Header />);
      expect(screen.getByTestId('header-link-login')).toBeInTheDocument();
    });

    it('não deve renderizar link para admin', () => {
      renderWithProviders(<Header />);
      expect(screen.queryByTestId('header-link-admin')).not.toBeInTheDocument();
    });

    it('não deve renderizar botão de logout', () => {
      renderWithProviders(<Header />);
      expect(screen.queryByTestId('header-btn-logout')).not.toBeInTheDocument();
    });
  });

  describe('dado usuário autenticado (teacher)', () => {
    const authRepo = () => mockAuthRepository({
      getCurrentUser: jest.fn(() => ({ id: '1', name: 'Professor', email: 'p@t.com', role: 'teacher' })),
    });

    it('deve renderizar link para admin', () => {
      renderWithProviders(<Header />, { authRepository: authRepo() });
      expect(screen.getByTestId('header-link-admin')).toBeInTheDocument();
    });

    it('deve renderizar botão de logout', () => {
      renderWithProviders(<Header />, { authRepository: authRepo() });
      expect(screen.getByTestId('header-btn-logout')).toBeInTheDocument();
    });

    it('não deve renderizar link para login', () => {
      renderWithProviders(<Header />, { authRepository: authRepo() });
      expect(screen.queryByTestId('header-link-login')).not.toBeInTheDocument();
    });
  });

  describe('dado usuário autenticado (student)', () => {
    const authRepo = () => mockAuthRepository({
      getCurrentUser: jest.fn(() => ({ id: '2', name: 'Ana', email: 'a@t.com', role: 'student' })),
    });

    it('não deve renderizar link para admin', () => {
      renderWithProviders(<Header />, { authRepository: authRepo() });
      expect(screen.queryByTestId('header-link-admin')).not.toBeInTheDocument();
    });

    it('deve renderizar botão de logout', () => {
      renderWithProviders(<Header />, { authRepository: authRepo() });
      expect(screen.getByTestId('header-btn-logout')).toBeInTheDocument();
    });

    it('não deve renderizar link para login', () => {
      renderWithProviders(<Header />, { authRepository: authRepo() });
      expect(screen.queryByTestId('header-link-login')).not.toBeInTheDocument();
    });
  });

  describe('quando o usuário clica em logout', () => {
    it('deve chamar a função logout do context', async () => {
      const repo = mockAuthRepository({
        getCurrentUser: jest.fn(() => ({ id: '1', name: 'Professor', email: 'p@t.com', role: 'teacher' })),
      });
      renderWithProviders(<Header />, { authRepository: repo });
      await userEvent.click(screen.getByTestId('header-btn-logout'));
      expect(repo.logout).toHaveBeenCalled();
    });
  });

  it('deve renderizar o logo com link para home', () => {
    renderWithProviders(<Header />);
    const logo = screen.getByTestId('header-logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('href', '/');
  });

  it('deve usar tag nav semântica', () => {
    renderWithProviders(<Header />);
    expect(screen.getByTestId('header-nav').tagName).toBe('NAV');
  });
});
