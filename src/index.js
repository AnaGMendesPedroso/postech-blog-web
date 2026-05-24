import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './shared/contexts/AuthContext';
import AuthApiRepository from './domains/auth/infrastructure/repositories/AuthApiRepository';
import GlobalStyles from './shared/styles/GlobalStyles';
import theme from './shared/styles/theme';
import App from './App';

const authRepository = new AuthApiRepository();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AuthProvider authRepository={authRepository}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);