import httpClient from '../../../../shared/infrastructure/http/httpClient';

class AuthApiRepository {
  async register({ name, email, password, role, accessCode }) {
    try {
      // Step 1: Register the user
      await httpClient.post('/auth/register', {
        nome: name,
        email,
        senha: password,
        role,
        ...(accessCode && { codigoAcesso: accessCode }),
      });

      // Step 2: Login to get the token (register doesn't return token)
      return await this.login(email, password);
    } catch (error) {
      throw new Error(this._extractErrorMessage(error));
    }
  }

  async login(email, password) {
    try {
      const response = await httpClient.post('/auth/login', {
        email,
        senha: password,
      });

      const { user: apiUser, token } = response.data.data;

      const user = {
        id: apiUser.id,
        name: apiUser.nome,
        email: apiUser.email,
        role: apiUser.role,
      };

      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      return { user, token };
    } catch (error) {
      throw new Error(this._extractErrorMessage(error));
    }
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

  _extractErrorMessage(error) {
    if (error.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
    if (error.response) {
      return 'Erro ao comunicar com a API';
    }
    if (error.request) {
      return 'Erro de conexão. Verifique sua rede.';
    }
    return error.message || 'Erro inesperado';
  }
}

export default AuthApiRepository;
