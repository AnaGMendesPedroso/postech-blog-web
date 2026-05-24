import AuthApiRepository from './AuthApiRepository';
import httpClient from '../../../../shared/infrastructure/http/httpClient';

jest.mock('../../../../shared/infrastructure/http/httpClient');

describe('AuthApiRepository', () => {
  let repository;
  let localStorageMock;

  beforeEach(() => {
    localStorageMock = (() => {
      let store = {};
      return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => { store[key] = String(value); }),
        removeItem: jest.fn((key) => { delete store[key]; }),
        clear: jest.fn(() => { store = {}; })
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
    repository = new AuthApiRepository();
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerData = { name: 'Ana Silva', email: 'ana@test.com', password: '123456', role: 'student' };

    describe('dado registro bem-sucedido', () => {
      beforeEach(() => {
        httpClient.post
          .mockResolvedValueOnce({ data: { success: true, data: { id: '1', nome: 'Ana Silva', email: 'ana@test.com', role: 'student' } } })
          .mockResolvedValueOnce({ data: { success: true, data: { user: { id: '1', nome: 'Ana Silva', email: 'ana@test.com', role: 'student' }, token: 'jwt_token' } } });
      });

      it('deve chamar POST /auth/register com payload mapeado', async () => {
        await repository.register(registerData);

        expect(httpClient.post).toHaveBeenCalledWith('/auth/register', {
          nome: 'Ana Silva',
          email: 'ana@test.com',
          senha: '123456',
          role: 'student',
        });
      });

      it('deve chamar POST /auth/login automaticamente após register 201', async () => {
        await repository.register(registerData);

        expect(httpClient.post).toHaveBeenCalledTimes(2);
        expect(httpClient.post).toHaveBeenNthCalledWith(2, '/auth/login', { email: 'ana@test.com', senha: '123456' });
      });

      it('deve armazenar token e user no localStorage', async () => {
        await repository.register(registerData);

        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'jwt_token');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', expect.any(String));
      });

      it('deve retornar { user, token } com campos mapeados (name, não nome)', async () => {
        const result = await repository.register(registerData);

        expect(result.user.name).toBe('Ana Silva');
        expect(result.user.nome).toBeUndefined();
        expect(result.token).toBe('jwt_token');
      });
    });

    describe('dado registro como teacher com accessCode', () => {
      it('deve incluir codigoAcesso no payload', async () => {
        httpClient.post
          .mockResolvedValueOnce({ data: { success: true, data: {} } })
          .mockResolvedValueOnce({ data: { success: true, data: { user: { id: '1', nome: 'Prof', email: 'prof@test.com', role: 'teacher' }, token: 'tok' } } });

        await repository.register({ name: 'Prof', email: 'prof@test.com', password: '123456', role: 'teacher', accessCode: 'POSTECH2024' });

        expect(httpClient.post).toHaveBeenNthCalledWith(1, '/auth/register', {
          nome: 'Prof',
          email: 'prof@test.com',
          senha: '123456',
          role: 'teacher',
          codigoAcesso: 'POSTECH2024',
        });
      });
    });

    describe('dado erro no register', () => {
      it('deve propagar mensagem de erro quando retorna 409', async () => {
        httpClient.post.mockRejectedValue({
          response: { status: 409, data: { success: false, error: { message: 'Email já cadastrado' } } }
        });

        await expect(repository.register(registerData)).rejects.toThrow('Email já cadastrado');
      });

      it('deve propagar mensagem de erro quando retorna 403', async () => {
        httpClient.post.mockRejectedValue({
          response: { status: 403, data: { success: false, error: { message: 'Código de acesso inválido' } } }
        });

        await expect(repository.register(registerData)).rejects.toThrow('Código de acesso inválido');
      });

      it('deve propagar mensagem de erro quando retorna 400', async () => {
        httpClient.post.mockRejectedValue({
          response: { status: 400, data: { success: false, error: { message: 'Dados inválidos' } } }
        });

        await expect(repository.register(registerData)).rejects.toThrow('Dados inválidos');
      });

      it('deve tratar erro de conexão', async () => {
        httpClient.post.mockRejectedValue({ request: {} });

        await expect(repository.register(registerData)).rejects.toThrow('Erro de conexão. Verifique sua rede.');
      });
    });
  });

  describe('login', () => {
    describe('dado credenciais válidas', () => {
      beforeEach(() => {
        httpClient.post.mockResolvedValue({
          data: { success: true, data: { user: { id: '1', nome: 'Professor', email: 'prof@test.com', role: 'teacher' }, token: 'jwt_token' } }
        });
      });

      it('deve chamar POST /auth/login com { email, senha }', async () => {
        await repository.login('prof@test.com', 'senha123');

        expect(httpClient.post).toHaveBeenCalledWith('/auth/login', { email: 'prof@test.com', senha: 'senha123' });
      });

      it('deve armazenar token e user no localStorage', async () => {
        await repository.login('prof@test.com', 'senha123');

        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'jwt_token');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify({ id: '1', name: 'Professor', email: 'prof@test.com', role: 'teacher' }));
      });

      it('deve retornar { user, token } com campos mapeados', async () => {
        const result = await repository.login('prof@test.com', 'senha123');

        expect(result.user).toEqual({ id: '1', name: 'Professor', email: 'prof@test.com', role: 'teacher' });
        expect(result.token).toBe('jwt_token');
      });
    });

    describe('dado credenciais inválidas', () => {
      it('deve propagar mensagem de erro quando retorna 401', async () => {
        httpClient.post.mockRejectedValue({
          response: { status: 401, data: { success: false, error: { message: 'Credenciais inválidas' } } }
        });

        await expect(repository.login('wrong@test.com', 'wrong')).rejects.toThrow('Credenciais inválidas');
      });
    });
  });

  describe('logout', () => {
    it('deve remover token e user do localStorage', async () => {
      await repository.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
    });
  });

  describe('getCurrentUser', () => {
    it('deve retornar user parseado do localStorage', () => {
      const user = { id: '1', name: 'Test', email: 'test@test.com', role: 'teacher' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(user));

      expect(repository.getCurrentUser()).toEqual(user);
    });

    it('deve retornar null quando não há user', () => {
      localStorageMock.getItem.mockReturnValue(null);

      expect(repository.getCurrentUser()).toBeNull();
    });

    it('deve retornar null para JSON corrompido', () => {
      localStorageMock.getItem.mockReturnValue('{invalid');

      expect(repository.getCurrentUser()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('deve retornar true quando token existe', () => {
      localStorageMock.getItem.mockReturnValue('token');
      expect(repository.isAuthenticated()).toBe(true);
    });

    it('deve retornar false quando token não existe', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(repository.isAuthenticated()).toBe(false);
    });
  });
});
