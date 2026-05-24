import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: #FEF2F2;
  border-left: 4px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const IconWrapper = styled.span`
  margin-right: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  line-height: 1;
`;

const MessageText = styled.p`
  flex: 1;
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: 0;
`;

const DismissButton = styled.button`
  background: none;
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  padding: 0;
  margin-left: ${({ theme }) => theme.spacing.sm};
  line-height: 1;

  &:hover {
    opacity: 0.7;
  }
`;

function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;

  return (
    <Container data-testid="error-message" role="alert">
      <IconWrapper>⚠️</IconWrapper>
      <MessageText data-testid="error-message-text">{message}</MessageText>
      {onDismiss && (
        <DismissButton data-testid="error-message-dismiss" onClick={onDismiss} aria-label="Fechar">
          ✕
        </DismissButton>
      )}
    </Container>
  );
}

export default ErrorMessage;
