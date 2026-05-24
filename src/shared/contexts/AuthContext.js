import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children, authRepository }) {
  const [user, setUser] = useState(() => authRepository.getCurrentUser());

  const login = useCallback(async (email, password) => {
    const result = await authRepository.login(email, password);
    setUser(result.user);
    return result;
  }, [authRepository]);

  const register = useCallback(async (name, email, password, role, accessCode) => {
    const result = await authRepository.register({ name, email, password, role, accessCode });
    setUser(result.user);
    return result;
  }, [authRepository]);

  const logout = useCallback(async () => {
    await authRepository.logout();
    setUser(null);
  }, [authRepository]);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export default AuthContext;