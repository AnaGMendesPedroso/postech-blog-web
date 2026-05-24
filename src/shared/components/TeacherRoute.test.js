import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders, mockAuthRepository } from '../test-utils';
import TeacherRoute from './TeacherRoute';

function TestChild() {
  return <div data-testid="protected-content">Protected</div>;
}

function renderTeacherRoute(repo, initialEntries = ['/admin']) {
  return renderWithProviders(
    <Routes>
      <Route path="/admin" element={<TeacherRoute><TestChild /></TeacherRoute>} />
      <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      <Route path="/" element={<div data-testid="home-page">Home</div>} />
    </Routes>,
    { authRepository: repo, initialEntries }
  );
}

describe('TeacherRoute', () => {
  it('deve renderizar children quando user é teacher autenticado', () => {
    const repo = mockAuthRepository({
      getCurrentUser: jest.fn(() => ({ id: '1', name: 'Prof', email: 'p@t.com', role: 'teacher' })),
      isAuthenticated: jest.fn(() => true),
    });

    renderTeacherRoute(repo);

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('deve redirecionar para /login quando não autenticado', () => {
    const repo = mockAuthRepository({
      getCurrentUser: jest.fn(() => null),
      isAuthenticated: jest.fn(() => false),
    });

    renderTeacherRoute(repo);

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('deve redirecionar para / quando user é student', () => {
    const repo = mockAuthRepository({
      getCurrentUser: jest.fn(() => ({ id: '1', name: 'Ana', email: 'a@t.com', role: 'student' })),
      isAuthenticated: jest.fn(() => true),
    });

    renderTeacherRoute(repo);

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
