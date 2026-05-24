import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import RegisterForm from '../components/RegisterForm';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const LoginLink = styled(Link)`
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    text-decoration: underline;
  }
`;

function RegisterPage() {
  const { isAuthenticated, user, register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    if (user?.role === 'teacher') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async ({ name, email, password, role, accessCode }) => {
    setError(null);
    setLoading(true);

    try {
      const result = await register(name, email, password, role, accessCode);
      if (result.user.role === 'teacher') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container data-testid="register-page">
      <Title data-testid="register-page-title">Criar Conta</Title>
      <RegisterForm
        onSubmit={handleSubmit}
        error={error}
        loading={loading}
      />
      <LoginLink to="/login" data-testid="register-link-login">
        Já tem uma conta? Entrar
      </LoginLink>
    </Container>
  );
}

export default RegisterPage;
