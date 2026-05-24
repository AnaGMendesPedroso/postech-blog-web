import { useState } from 'react';
import styled from 'styled-components';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  max-width: 400px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme, $hasError }) => $hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 500;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorAlert = styled.div`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: #FEF2F2;
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ValidationError = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.xs};
`;

const Fieldset = styled.fieldset`
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Legend = styled.legend`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const RadioGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.md};
  cursor: pointer;
`;

function RegisterForm({ onSubmit, error, loading }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (name.trim().length < 2) {
      errors.name = 'Nome deve ter no mínimo 2 caracteres';
    }

    if (!email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = 'Email deve ter um formato válido';
    }

    if (!password) {
      errors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      errors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!passwordConfirm) {
      errors.passwordConfirm = 'Confirmação de senha é obrigatória';
    } else if (passwordConfirm !== password) {
      errors.passwordConfirm = 'As senhas não coincidem';
    }

    if (!role) {
      errors.role = 'Selecione um perfil';
    }

    if (role === 'teacher' && (!accessCode || !accessCode.trim())) {
      errors.accessCode = 'Código de acesso é obrigatório para professoras';
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const data = { name: name.trim(), email, password, role };
    if (role === 'teacher') {
      data.accessCode = accessCode.trim();
    }
    onSubmit(data);
  };

  const clearFieldError = (field) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    clearFieldError('name');
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    clearFieldError('email');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    clearFieldError('password');
  };

  const handlePasswordConfirmChange = (e) => {
    setPasswordConfirm(e.target.value);
    clearFieldError('passwordConfirm');
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    if (newRole !== 'teacher') {
      setAccessCode('');
    }
    clearFieldError('role');
    clearFieldError('accessCode');
  };

  const handleAccessCodeChange = (e) => {
    setAccessCode(e.target.value);
    clearFieldError('accessCode');
  };

  return (
    <Form data-testid="register-form" onSubmit={handleSubmit}>
      {error && (
        <ErrorAlert data-testid="register-error-message" role="alert">
          {error}
        </ErrorAlert>
      )}

      <InputGroup>
        <Label htmlFor="register-name">Nome</Label>
        <Input
          id="register-name"
          data-testid="register-input-name"
          type="text"
          value={name}
          onChange={handleNameChange}
          $hasError={!!validationErrors.name}
          aria-invalid={!!validationErrors.name}
          aria-describedby={validationErrors.name ? 'register-error-name-msg' : undefined}
          aria-label="Nome"
        />
        {validationErrors.name && (
          <ValidationError id="register-error-name-msg" data-testid="register-error-name">
            {validationErrors.name}
          </ValidationError>
        )}
      </InputGroup>

      <InputGroup>
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          data-testid="register-input-email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          $hasError={!!validationErrors.email}
          aria-invalid={!!validationErrors.email}
          aria-describedby={validationErrors.email ? 'register-error-email-msg' : undefined}
          aria-label="Email"
        />
        {validationErrors.email && (
          <ValidationError id="register-error-email-msg" data-testid="register-error-email">
            {validationErrors.email}
          </ValidationError>
        )}
      </InputGroup>

      <InputGroup>
        <Label htmlFor="register-password">Senha</Label>
        <Input
          id="register-password"
          data-testid="register-input-password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          $hasError={!!validationErrors.password}
          aria-invalid={!!validationErrors.password}
          aria-describedby={validationErrors.password ? 'register-error-password-msg' : undefined}
          aria-label="Senha"
        />
        {validationErrors.password && (
          <ValidationError id="register-error-password-msg" data-testid="register-error-password">
            {validationErrors.password}
          </ValidationError>
        )}
      </InputGroup>

      <InputGroup>
        <Label htmlFor="register-password-confirm">Confirmar Senha</Label>
        <Input
          id="register-password-confirm"
          data-testid="register-input-password-confirm"
          type="password"
          value={passwordConfirm}
          onChange={handlePasswordConfirmChange}
          $hasError={!!validationErrors.passwordConfirm}
          aria-invalid={!!validationErrors.passwordConfirm}
          aria-describedby={validationErrors.passwordConfirm ? 'register-error-pc-msg' : undefined}
          aria-label="Confirmar Senha"
        />
        {validationErrors.passwordConfirm && (
          <ValidationError id="register-error-pc-msg" data-testid="register-error-password-confirm">
            {validationErrors.passwordConfirm}
          </ValidationError>
        )}
      </InputGroup>

      <Fieldset>
        <Legend>Perfil</Legend>
        <RadioGroup>
          <RadioLabel>
            <input
              type="radio"
              name="role"
              value="student"
              checked={role === 'student'}
              onChange={handleRoleChange}
              data-testid="register-radio-student"
            />
            Aluna
          </RadioLabel>
          <RadioLabel>
            <input
              type="radio"
              name="role"
              value="teacher"
              checked={role === 'teacher'}
              onChange={handleRoleChange}
              data-testid="register-radio-teacher"
            />
            Professora
          </RadioLabel>
        </RadioGroup>
        {validationErrors.role && (
          <ValidationError data-testid="register-error-role">
            {validationErrors.role}
          </ValidationError>
        )}
      </Fieldset>

      {role === 'teacher' && (
        <InputGroup>
          <Label htmlFor="register-access-code">Código de Acesso</Label>
          <Input
            id="register-access-code"
            data-testid="register-input-access-code"
            type="text"
            value={accessCode}
            onChange={handleAccessCodeChange}
            $hasError={!!validationErrors.accessCode}
            aria-invalid={!!validationErrors.accessCode}
            aria-describedby={validationErrors.accessCode ? 'register-error-ac-msg' : undefined}
            aria-label="Código de Acesso"
          />
          {validationErrors.accessCode && (
            <ValidationError id="register-error-ac-msg" data-testid="register-error-access-code">
              {validationErrors.accessCode}
            </ValidationError>
          )}
        </InputGroup>
      )}

      <Button
        data-testid="register-btn-submit"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Criando...' : 'Criar Conta'}
      </Button>
    </Form>
  );
}

export default RegisterForm;
