import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import theme from './styles/theme';

export function mockAuthRepository(overrides = {}) {
  return {
    login: jest.fn().mockResolvedValue({ user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'teacher' }, token: 'tok' }),
    logout: jest.fn().mockResolvedValue(undefined),
    register: jest.fn().mockResolvedValue({ user: { id: '2', name: 'New User', email: 'new@test.com', role: 'student' }, token: 'tok2' }),
    getCurrentUser: jest.fn(() => null),
    isAuthenticated: jest.fn(() => false),
    ...overrides,
  };
}

export function renderWithProviders(ui, {
  authRepository = mockAuthRepository(),
  initialEntries = ['/'],
  ...options
} = {}) {
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider authRepository={authRepository}>
        <MemoryRouter initialEntries={initialEntries}>
          {ui}
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>,
    options
  );
}
