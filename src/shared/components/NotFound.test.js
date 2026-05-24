import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import NotFound from './NotFound';

describe('NotFound', () => {
  describe('dado que o componente é renderizado', () => {
    beforeEach(() => {
      renderWithProviders(<NotFound />);
    });

    it('deve exibir o código 404', () => {
      expect(screen.getByTestId('not-found-title')).toHaveTextContent('404');
    });

    it('deve exibir mensagem "Página não encontrada"', () => {
      expect(screen.getByTestId('not-found-message')).toHaveTextContent('Página não encontrada');
    });

    it('deve exibir link para a home', () => {
      expect(screen.getByTestId('not-found-link-home')).toBeInTheDocument();
    });

    it('o link deve apontar para /', () => {
      expect(screen.getByTestId('not-found-link-home')).toHaveAttribute('href', '/');
    });
  });
});
