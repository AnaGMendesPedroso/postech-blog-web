import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import theme from '../styles/theme';
import ErrorMessage from './ErrorMessage';

function renderErrorMessage(props = {}) {
  return render(
    <ThemeProvider theme={theme}>
      <ErrorMessage {...props} />
    </ThemeProvider>
  );
}

describe('ErrorMessage', () => {
  describe('dado message vazia', () => {
    it('não deve renderizar nada para string vazia', () => {
      const { container } = renderErrorMessage({ message: '' });
      expect(container).toBeEmptyDOMElement();
    });

    it('não deve renderizar nada para null', () => {
      const { container } = renderErrorMessage({ message: null });
      expect(container).toBeEmptyDOMElement();
    });

    it('não deve renderizar nada para undefined', () => {
      const { container } = renderErrorMessage({ message: undefined });
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('dado message preenchida', () => {
    it('deve exibir a mensagem com role="alert"', () => {
      renderErrorMessage({ message: 'Ocorreu um erro' });
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByTestId('error-message-text')).toHaveTextContent('Ocorreu um erro');
    });
  });

  describe('dado onDismiss fornecido', () => {
    it('deve exibir botão de fechar', () => {
      renderErrorMessage({ message: 'Erro', onDismiss: jest.fn() });
      expect(screen.getByTestId('error-message-dismiss')).toBeInTheDocument();
    });

    it('deve chamar onDismiss ao clicar no botão', async () => {
      const onDismiss = jest.fn();
      renderErrorMessage({ message: 'Erro', onDismiss });
      await userEvent.click(screen.getByTestId('error-message-dismiss'));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('dado onDismiss não fornecido', () => {
    it('não deve exibir botão de fechar', () => {
      renderErrorMessage({ message: 'Erro' });
      expect(screen.queryByTestId('error-message-dismiss')).not.toBeInTheDocument();
    });
  });
});
