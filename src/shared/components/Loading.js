import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const sizes = {
  sm: '24px',
  md: '40px',
  lg: '64px',
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Spinner = styled.div`
  width: ${({ $size }) => sizes[$size] || sizes.md};
  height: ${({ $size }) => sizes[$size] || sizes.md};
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const Text = styled.p`
  margin-top: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

function Loading({ size = 'md', text = 'Carregando...' }) {
  return (
    <Container aria-busy="true" role="status">
      <Spinner data-testid="loading-spinner" $size={size} />
      <Text data-testid="loading-text">{text}</Text>
    </Container>
  );
}

export default Loading;
