import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import LoginForm from '../components/LoginForm';

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

const RegisterLink = styled(Link)`
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    text-decoration: underline;
  }
`;

function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (email, password) => {
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container data-testid="login-page">
      <Title data-testid="login-page-title">Login</Title>
      <LoginForm
        onSubmit={handleSubmit}
        error={error}
        loading={loading}
      />
      <RegisterLink to="/register" data-testid="login-link-register">
        Não tem uma conta? Criar conta
      </RegisterLink>
    </Container>
  );
}

export default LoginPage;
