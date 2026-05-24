import { screen } from '@testing-library/react';
import { renderWithProviders, mockAuthRepository } from '../test-utils';
import PrivateRoute from './PrivateRoute';

describe('PrivateRoute', () => {
  describe('dado usuário autenticado', () => {
    it('deve renderizar children', () => {
      const repo = mockAuthRepository({
        getCurrentUser: jest.fn(() => ({ id: '1', name: 'Professor' })),
      });
      renderWithProviders(
        <PrivateRoute>
          <div data-testid="protected-content">Conteúdo protegido</div>
        </PrivateRoute>,
        { authRepository: repo }
      );
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('dado usuário não autenticado', () => {
    it('deve redirecionar para /login', () => {
      renderWithProviders(
        <PrivateRoute>
          <div data-testid="protected-content">Conteúdo protegido</div>
        </PrivateRoute>,
        { initialEntries: ['/admin'] }
      );
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('não deve renderizar children', () => {
      renderWithProviders(
        <PrivateRoute>
          <div data-testid="protected-content">Conteúdo protegido</div>
        </PrivateRoute>
      );
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });
});
