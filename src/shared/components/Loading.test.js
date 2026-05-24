import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import theme from '../styles/theme';
import Loading from './Loading';

function renderLoading(props = {}) {
  return render(
    <ThemeProvider theme={theme}>
      <Loading {...props} />
    </ThemeProvider>
  );
}

describe('Loading', () => {
  it('deve renderizar com data-testid loading-spinner', () => {
    renderLoading();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('deve exibir texto "Carregando..." por default', () => {
    renderLoading();
    expect(screen.getByTestId('loading-text')).toHaveTextContent('Carregando...');
  });

  it('deve exibir texto customizado quando fornecido', () => {
    renderLoading({ text: 'Aguarde...' });
    expect(screen.getByTestId('loading-text')).toHaveTextContent('Aguarde...');
  });

  it('deve ter role="status" para acessibilidade', () => {
    renderLoading();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('deve ter aria-busy="true"', () => {
    renderLoading();
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });
});
