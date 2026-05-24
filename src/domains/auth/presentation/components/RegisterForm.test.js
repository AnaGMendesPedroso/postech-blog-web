import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import theme from '../../../../shared/styles/theme';
import RegisterForm from './RegisterForm';

function renderRegisterForm(props = {}) {
  const defaultProps = {
    onSubmit: jest.fn(),
    error: null,
    loading: false,
    ...props,
  };

  return render(
    <ThemeProvider theme={theme}>
      <RegisterForm {...defaultProps} />
    </ThemeProvider>
  );
}

describe('RegisterForm', () => {
  describe('dado renderização inicial', () => {
    it('deve renderizar todos os campos (name, email, password, confirmação, role radios)', () => {
      renderRegisterForm();

      expect(screen.getByTestId('register-input-name')).toBeInTheDocument();
      expect(screen.getByTestId('register-input-email')).toBeInTheDocument();
      expect(screen.getByTestId('register-input-password')).toBeInTheDocument();
      expect(screen.getByTestId('register-input-password-confirm')).toBeInTheDocument();
      expect(screen.getByTestId('register-radio-student')).toBeInTheDocument();
      expect(screen.getByTestId('register-radio-teacher')).toBeInTheDocument();
    });

    it('não deve renderizar campo de código de acesso', () => {
      renderRegisterForm();

      expect(screen.queryByTestId('register-input-access-code')).not.toBeInTheDocument();
    });

    it('botão deve estar habilitado com texto "Criar Conta"', () => {
      renderRegisterForm();

      const button = screen.getByTestId('register-btn-submit');
      expect(button).toBeEnabled();
      expect(button).toHaveTextContent('Criar Conta');
    });

    it('não deve exibir mensagens de erro', () => {
      renderRegisterForm();

      expect(screen.queryByTestId('register-error-message')).not.toBeInTheDocument();
      expect(screen.queryByTestId('register-error-name')).not.toBeInTheDocument();
      expect(screen.queryByTestId('register-error-email')).not.toBeInTheDocument();
      expect(screen.queryByTestId('register-error-password')).not.toBeInTheDocument();
    });
  });

  describe('dado seleção de role', () => {
    it('deve exibir campo de código de acesso quando "Professora" selecionado', async () => {
      renderRegisterForm();
      const user = userEvent.setup();

      await user.click(screen.getByTestId('register-radio-teacher'));

      expect(screen.getByTestId('register-input-access-code')).toBeInTheDocument();
    });

    it('deve ocultar campo de código de acesso quando "Aluna" selecionado', async () => {
      renderRegisterForm();
      const user = userEvent.setup();

      await user.click(screen.getByTestId('register-radio-teacher'));
      expect(screen.getByTestId('register-input-access-code')).toBeInTheDocument();

      await user.click(screen.getByTestId('register-radio-student'));
      expect(screen.queryByTestId('register-input-access-code')).not.toBeInTheDocument();
    });

    it('deve limpar valor de accessCode ao trocar de teacher para student', async () => {
      renderRegisterForm();
      const user = userEvent.setup();

      await user.click(screen.getByTestId('register-radio-teacher'));
      await user.type(screen.getByTestId('register-input-access-code'), 'POSTECH2024');

      await user.click(screen.getByTestId('register-radio-student'));
      await user.click(screen.getByTestId('register-radio-teacher'));

      expect(screen.getByTestId('register-input-access-code')).toHaveValue('');
    });
  });

  describe('dado submit com campos vazios', () => {
    it('deve exibir erros de validação para todos os campos obrigatórios', async () => {
      const onSubmit = jest.fn();
      renderRegisterForm({ onSubmit });
      const user = userEvent.setup();

      await user.click(screen.getByTestId('register-btn-submit'));

      expect(screen.getByTestId('register-error-name')).toHaveTextContent('Nome é obrigatório');
      expect(screen.getByTestId('register-error-email')).toHaveTextContent('Email é obrigatório');
      expect(screen.getByTestId('register-error-password')).toHaveTextContent('Senha é obrigatória');
      expect(screen.getByTestId('register-error-password-confirm')).toHaveTextContent('Confirmação de senha é obrigatória');
      expect(screen.getByTestId('register-error-role')).toHaveTextContent('Selecione um perfil');
    });

    it('não deve chamar onSubmit', async () => {
      const onSubmit = jest.fn();
      renderRegisterForm({ onSubmit });
      const user = userEvent.setup();

      await user.click(screen.getByTestId('register-btn-submit'));

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('dado submit com dados válidos (student)', () => {
    it('deve chamar onSubmit com { name, email, password, role: "student" }', async () => {
      const onSubmit = jest.fn();
      renderRegisterForm({ onSubmit });
      const user = userEvent.setup();

      await user.type(screen.getByTestId('register-input-name'), 'Ana Silva');
      await user.type(screen.getByTestId('register-input-email'), 'ana@test.com');
      await user.type(screen.getByTestId('register-input-password'), '123456');
      await user.type(screen.getByTestId('register-input-password-confirm'), '123456');
      await user.click(screen.getByTestId('register-radio-student'));
      await user.click(screen.getByTestId('register-btn-submit'));

      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Ana Silva',
        email: 'ana@test.com',
        password: '123456',
        role: 'student',
      });
    });
  });

  describe('dado submit com dados válidos (teacher)', () => {
    it('deve chamar onSubmit com { name, email, password, role: "teacher", accessCode }', async () => {
      const onSubmit = jest.fn();
      renderRegisterForm({ onSubmit });
      const user = userEvent.setup();

      await user.type(screen.getByTestId('register-input-name'), 'Prof Carlos');
      await user.type(screen.getByTestId('register-input-email'), 'carlos@test.com');
      await user.type(screen.getByTestId('register-input-password'), '123456');
      await user.type(screen.getByTestId('register-input-password-confirm'), '123456');
      await user.click(screen.getByTestId('register-radio-teacher'));
      await user.type(screen.getByTestId('register-input-access-code'), 'POSTECH2024');
      await user.click(screen.getByTestId('register-btn-submit'));

      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Prof Carlos',
        email: 'carlos@test.com',
        password: '123456',
        role: 'teacher',
        accessCode: 'POSTECH2024',
      });
    });
  });

  describe('dado validações de boundary', () => {
    it('nome com 1 char deve exibir erro', async () => {
      renderRegisterForm();
      const user = userEvent.setup();

      await user.type(screen.getByTestId('register-input-name'), 'A');
      await user.type(screen.getByTestId('register-input-email'), 'a@b.com');
      await user.type(screen.getByTestId('register-input-password'), '123456');
      await user.type(screen.getByTestId('register-input-password-confirm'), '123456');
      await user.click(screen.getByTestId('register-radio-student'));
      await user.click(screen.getByTestId('register-btn-submit'));

      expect(screen.getByTestId('register-error-name')).toHaveTextContent('Nome deve ter no mínimo 2 caracteres');
    });

    it('nome com 2 chars deve ser aceito', async () => {
      const onSubmit = jest.fn();
      renderRegisterForm({ onSubmit });
      const user = userEvent.setup();

      await user.type(screen.getByTestId('register-input-name'), 'An');
      await user.type(screen.getByTestId('register-input-email'), 'a@b.com');
      await user.type(screen.getByTestId('register-input-password'), '123456');
      await user.type(screen.getByTestId('register-input-password-confirm'), '123456');
      await user.click(screen.getByTestId('register-radio-student'));
      await user.click(screen.getByTestId('register-btn-submit'));

      expect(onSubmit).toHaveBeenCalled();
    });

    it('senha com 5 chars deve exibir erro', async () => {
      renderRegisterForm();
      const user = userEvent.setup();

      await user.type(screen.getByTestId('register-input-name'), 'Ana');
      await user.type(screen.getByTestId('register-input-email'), 'a@b.com');
      await user.type(screen.getByTestId('register-input-password'), '12345');
      await user.type(screen.getByTestId('register-input-password-confirm'), '12345');
      await user.click(screen.getByTestId('register-radio-student'));
      await user.click(screen.getByTestId('register-btn-submit'));

      expect(screen.getByTestId('register-error-password')).toHaveTextContent('Senha deve ter no mínimo 6 caracteres');
    });

    it('senha com 6 chars deve ser aceita', async () => {
      const onSubmit = jest.fn();
      renderRegisterForm({ onSubmit });
      const user = userEvent.setup();

      await user.type(screen.getByTestId('register-input-name'), 'Ana');
      await user.type(screen.getByTestId('register-input-email'), 'a@b.com');
      await user.type(screen.getByTestId('register-input-password'), '123456');
      await user.type(screen.getByTestId('register-input-password-confirm'), '123456');
      await user.click(screen.getByTestId('register-radio-student'));
      await user.click(screen.getByTestId('register-btn-submit'));

      expect(onSubmit).toHaveBeenCalled();
    });

    it('senhas que não coincidem deve exibir erro', async () => {
      renderRegisterForm();
      const user = userEvent.setup();

      await user.type(screen.getByTestId('register-input-name'), 'Ana');
      await user.type(screen.getByTestId('register-input-email'), 'a@b.com');
      await user.type(screen.getByTestId('register-input-password'), '123456');
      await user.type(screen.getByTestId('register-input-password-confirm'), '654321');
      await user.click(screen.getByTestId('register-radio-student'));
      await user.click(screen.getByTestId('register-btn-submit'));

      expect(screen.getByTestId('register-error-password-confirm')).toHaveTextContent('As senhas não coincidem');
    });

    it('email sem @ deve exibir erro', async () => {
      renderRegisterForm();
      const user = userEvent.setup();

      await user.type(screen.getByTestId('register-input-name'), 'Ana');
      await user.type(screen.getByTestId('register-input-email'), 'invalido');
      await user.type(screen.getByTestId('register-input-password'), '123456');
      await user.type(screen.getByTestId('register-input-password-confirm'), '123456');
      await user.click(screen.getByTestId('register-radio-student'));
      await user.click(screen.getByTestId('register-btn-submit'));

      expect(screen.getByTestId('register-error-email')).toHaveTextContent('Email deve ter um formato válido');
    });
  });

  describe('dado teacher sem código de acesso', () => {
    it('deve exibir erro "Código de acesso é obrigatório para professoras"', async () => {
      renderRegisterForm();
      const user = userEvent.setup();

      await user.type(screen.getByTestId('register-input-name'), 'Prof');
      await user.type(screen.getByTestId('register-input-email'), 'prof@test.com');
      await user.type(screen.getByTestId('register-input-password'), '123456');
      await user.type(screen.getByTestId('register-input-password-confirm'), '123456');
      await user.click(screen.getByTestId('register-radio-teacher'));
      await user.click(screen.getByTestId('register-btn-submit'));

      expect(screen.getByTestId('register-error-access-code')).toHaveTextContent('Código de acesso é obrigatório para professoras');
    });

    it('não deve chamar onSubmit', async () => {
      const onSubmit = jest.fn();
      renderRegisterForm({ onSubmit });
      const user = userEvent.setup();

      await user.type(screen.getByTestId('register-input-name'), 'Prof');
      await user.type(screen.getByTestId('register-input-email'), 'prof@test.com');
      await user.type(screen.getByTestId('register-input-password'), '123456');
      await user.type(screen.getByTestId('register-input-password-confirm'), '123456');
      await user.click(screen.getByTestId('register-radio-teacher'));
      await user.click(screen.getByTestId('register-btn-submit'));

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('dado loading=true', () => {
    it('deve desabilitar botão', () => {
      renderRegisterForm({ loading: true });

      expect(screen.getByTestId('register-btn-submit')).toBeDisabled();
    });

    it('deve exibir "Criando..." no botão', () => {
      renderRegisterForm({ loading: true });

      expect(screen.getByTestId('register-btn-submit')).toHaveTextContent('Criando...');
    });
  });

  describe('dado prop error', () => {
    it('deve exibir mensagem de erro da API com role="alert"', () => {
      renderRegisterForm({ error: 'Email já cadastrado' });

      const errorEl = screen.getByTestId('register-error-message');
      expect(errorEl).toHaveTextContent('Email já cadastrado');
      expect(errorEl).toHaveAttribute('role', 'alert');
    });
  });

  describe('dado erro de validação exibido', () => {
    it('deve limpar erro do campo quando usuário digita', async () => {
      renderRegisterForm();
      const user = userEvent.setup();

      await user.click(screen.getByTestId('register-btn-submit'));
      expect(screen.getByTestId('register-error-name')).toBeInTheDocument();

      await user.type(screen.getByTestId('register-input-name'), 'A');
      expect(screen.queryByTestId('register-error-name')).not.toBeInTheDocument();
    });
  });
});
