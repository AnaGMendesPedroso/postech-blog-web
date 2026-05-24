import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavContainer = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  }
`;

const Logo = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const NavLink = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const LogoutButton = styled.button`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  background: none;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.error};
  }
`;

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <NavContainer data-testid="header-nav">
      <Logo to="/" data-testid="header-logo">
        PosTech Blog
      </Logo>
      <NavLinks>
        <NavLink to="/" data-testid="header-link-home">
          Início
        </NavLink>
        {isAuthenticated ? (
          <>
            {user?.role === 'teacher' && (
              <NavLink to="/admin" data-testid="header-link-admin">
                Painel
              </NavLink>
            )}
            <LogoutButton data-testid="header-btn-logout" onClick={handleLogout}>
              Sair
            </LogoutButton>
          </>
        ) : (
          <NavLink to="/login" data-testid="header-link-login">
            Entrar
          </NavLink>
        )}
      </NavLinks>
    </NavContainer>
  );
}

export default Header;
