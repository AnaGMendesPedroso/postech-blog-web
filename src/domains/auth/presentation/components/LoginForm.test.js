import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import theme from '../../../../shared/styles/theme';
import LoginForm from './LoginForm';

function renderLoginForm(props = {}) {
  const defaultProps = {
    onSubmit: jest.fn(),
    error: null,
    loading: false,
    ...props,
  };

  return render(
    <ThemeProvider theme={theme}>
      <LoginForm {...defaultProps} />
    </ThemeProvider>
  );
}

describe('LoginForm', () => {
  describe('dado renderização inicial', () => {
    it('deve renderizar form com campos email, password e botão "Entrar"', () => {
      renderLoginForm();

      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByTestId('login-input-email')).toBeInTheDocument();
      expect(screen.getByTestId('login-input-password')).toBeInTheDocument();
      expect(screen.getByTestId('login-btn-submit')).toHaveTextContent('Entrar');
    });

    it('botão deve estar habilitado', () => {
      renderLoginForm();

      expect(screen.getByTestId('login-btn-submit')).not.toBeDisabled();
    });

    it('não deve exibir mensagem de erro', () => {
      renderLoginForm();

      expect(screen.queryByTestId('login-error-message')).not.toBeInTheDocument();
    });

    it('campo password deve ter type="password"', () => {
      renderLoginForm();

      expect(screen.getByTestId('login-input-password')).toHaveAttribute('type', 'password');
    });

    it('campo email deve ter type="email"', () => {
      renderLoginForm();

      expect(screen.getByTestId('login-input-email')).toHaveAttribute('type', 'email');
    });
  });

  describe('dado submit com dados válidos', () => {
    it('deve chamar onSubmit com email e password digitados', async () => {
      // Given
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      renderLoginForm({ onSubmit });

      // When
      await user.type(screen.getByTestId('login-input-email'), 'professor@postech.com');
      await user.type(screen.getByTestId('login-input-password'), 'postech123');
      await user.click(screen.getByTestId('login-btn-submit'));

      // Then
      expect(onSubmit).toHaveBeenCalledWith('professor@postech.com', 'postech123');
    });
  });

  describe('dado submit com campos vazios', () => {
    it('deve exibir "Email é obrigatório" quando email vazio', async () => {
      // Given
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      renderLoginForm({ onSubmit });

      // When
      await user.type(screen.getByTestId('login-input-password'), 'postech123');
      await user.click(screen.getByTestId('login-btn-submit'));

      // Then
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
    });

    it('deve exibir "Senha é obrigatória" quando senha vazia', async () => {
      // Given
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      renderLoginForm({ onSubmit });

      // When
      await user.type(screen.getByTestId('login-input-email'), 'professor@postech.com');
      await user.click(screen.getByTestId('login-btn-submit'));

      // Then
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
    });

    it('não deve chamar onSubmit quando validação falhar', async () => {
      // Given
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      renderLoginForm({ onSubmit });

      // When
      await user.click(screen.getByTestId('login-btn-submit'));

      // Then
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('dado loading=true', () => {
    it('deve desabilitar botão', () => {
      renderLoginForm({ loading: true });

      expect(screen.getByTestId('login-btn-submit')).toBeDisabled();
    });

    it('deve exibir "Entrando..." no botão', () => {
      renderLoginForm({ loading: true });

      expect(screen.getByTestId('login-btn-submit')).toHaveTextContent('Entrando...');
    });
  });

  describe('dado prop error', () => {
    it('deve exibir mensagem de erro com role="alert"', () => {
      renderLoginForm({ error: 'Credenciais inválidas' });

      const errorElement = screen.getByTestId('login-error-message');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveAttribute('role', 'alert');
      expect(errorElement).toHaveTextContent('Credenciais inválidas');
    });
  });

  describe('dado erro de validação exibido', () => {
    it('deve limpar erro de email quando usuário digita no campo email', async () => {
      // Given
      const user = userEvent.setup();
      renderLoginForm();

      // Submit vazio para gerar erro
      await user.click(screen.getByTestId('login-btn-submit'));
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();

      // When
      await user.type(screen.getByTestId('login-input-email'), 'a');

      // Then
      expect(screen.queryByText('Email é obrigatório')).not.toBeInTheDocument();
    });

    it('deve limpar erro de senha quando usuário digita no campo password', async () => {
      // Given
      const user = userEvent.setup();
      renderLoginForm();

      // Submit com email preenchido mas sem senha
      await user.type(screen.getByTestId('login-input-email'), 'test@test.com');
      await user.click(screen.getByTestId('login-btn-submit'));
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();

      // When
      await user.type(screen.getByTestId('login-input-password'), 'a');

      // Then
      expect(screen.queryByText('Senha é obrigatória')).not.toBeInTheDocument();
    });
  });
});
