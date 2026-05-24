const MOCK_CREDENTIALS = {
  email: 'professor@postech.com',
  password: 'postech123'
};

const MOCK_USER = {
  id: 'usr_mock_001',
  name: 'Professor FIAP',
  email: 'professor@postech.com',
  role: 'teacher'
};

const MOCK_TOKEN = 'mock_jwt_token_postech_2024';
const MOCK_ACCESS_CODE = 'POSTECH2024';

class AuthMockRepository {
  constructor() {
    this.registeredUsers = [];
  }

  async login(email, password) {
    // Check registered users first
    const registered = this.registeredUsers.find(u => u.email === email && u.password === password);
    if (registered) {
      const { password: _, ...user } = registered;
      localStorage.setItem('auth_token', MOCK_TOKEN);
      localStorage.setItem('auth_user', JSON.stringify(user));
      return { user, token: MOCK_TOKEN };
    }

    if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
      localStorage.setItem('auth_token', MOCK_TOKEN);
      localStorage.setItem('auth_user', JSON.stringify(MOCK_USER));
      return { user: MOCK_USER, token: MOCK_TOKEN };
    }
    throw new Error('Credenciais inválidas');
  }

  async register({ name, email, password, role, accessCode }) {
    // Check if email already in use
    const exists = this.registeredUsers.some(u => u.email === email) || email === MOCK_USER.email;
    if (exists) {
      throw new Error('Email já cadastrado');
    }

    // Validate access code for teachers
    if (role === 'teacher' && accessCode !== MOCK_ACCESS_CODE) {
      throw new Error('Código de acesso inválido');
    }

    const newUser = {
      id: `usr_mock_${Date.now()}`,
      name,
      email,
      role,
      password,
    };

    this.registeredUsers.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem('auth_token', MOCK_TOKEN);
    localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));

    return { user: userWithoutPassword, token: MOCK_TOKEN };
  }

  async logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  getCurrentUser() {
    try {
      const userJson = localStorage.getItem('auth_user');
      if (!userJson) return null;
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  isAuthenticated() {
    return localStorage.getItem('auth_token') !== null;
  }
}

export default AuthMockRepository;