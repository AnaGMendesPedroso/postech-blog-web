import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  text-align: center;
  margin-top: auto;
`;

const FooterText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

function Footer() {
  return (
    <FooterContainer data-testid="footer-container">
      <FooterText data-testid="footer-text">
        © {new Date().getFullYear()} PosTech Blog. Todos os direitos reservados.
      </FooterText>
    </FooterContainer>
  );
}

export default Footer;
