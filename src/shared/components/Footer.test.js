import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import theme from '../styles/theme';
import Footer from './Footer';

function renderFooter() {
  return render(
    <ThemeProvider theme={theme}>
      <Footer />
    </ThemeProvider>
  );
}

describe('Footer', () => {
  it('deve renderizar o container com data-testid footer-container', () => {
    renderFooter();
    expect(screen.getByTestId('footer-container')).toBeInTheDocument();
  });

  it('deve usar tag semântica footer', () => {
    renderFooter();
    expect(screen.getByTestId('footer-container').tagName).toBe('FOOTER');
  });

  it('deve exibir texto com ano atual', () => {
    renderFooter();
    const year = new Date().getFullYear();
    expect(screen.getByTestId('footer-text')).toHaveTextContent(
      `© ${year} PosTech Blog. Todos os direitos reservados.`
    );
  });
});
