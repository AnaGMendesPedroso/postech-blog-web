import AuthMockRepository from './AuthMockRepository';

describe('AuthMockRepository', () => {
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
    repository = new AuthMockRepository();
  });

  describe('login', () => {
    describe('dado credenciais válidas', () => {
      it('deve retornar user e token', async () => {
        const result = await repository.login('professor@postech.com', 'postech123');

        expect(result.user).toEqual({
          id: 'usr_mock_001',
          name: 'Professor FIAP',
          email: 'professor@postech.com',
          role: 'teacher'
        });
        expect(result.token).toBe('mock_jwt_token_postech_2024');
      });

      it('deve persistir token no localStorage', async () => {
        await repository.login('professor@postech.com', 'postech123');

        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'mock_jwt_token_postech_2024');
      });

      it('deve persistir user no localStorage como JSON', async () => {
        await repository.login('professor@postech.com', 'postech123');

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'auth_user',
          JSON.stringify({
            id: 'usr_mock_001',
            name: 'Professor FIAP',
            email: 'professor@postech.com',
            role: 'teacher'
          })
        );
      });
    });

    describe('dado email incorreto', () => {
      it('deve lançar erro de credenciais inválidas', async () => {
        await expect(repository.login('outro@email.com', 'postech123'))
          .rejects.toThrow('Credenciais inválidas');
      });
    });

    describe('dado senha incorreta', () => {
      it('deve lançar erro de credenciais inválidas', async () => {
        await expect(repository.login('professor@postech.com', 'senhaerrada'))
          .rejects.toThrow('Credenciais inválidas');
      });

      it('não deve revelar se o email existe (mesma mensagem)', async () => {
        let erroEmailErrado, erroSenhaErrada;

        try { await repository.login('naoexiste@email.com', 'postech123'); }
        catch (e) { erroEmailErrado = e.message; }

        try { await repository.login('professor@postech.com', 'senhaerrada'); }
        catch (e) { erroSenhaErrada = e.message; }

        expect(erroEmailErrado).toBe(erroSenhaErrada);
      });
    });

    describe('dado campos vazios', () => {
      it('deve lançar erro de credenciais inválidas para email vazio', async () => {
        await expect(repository.login('', 'postech123'))
          .rejects.toThrow('Credenciais inválidas');
      });

      it('deve lançar erro de credenciais inválidas para senha vazia', async () => {
        await expect(repository.login('professor@postech.com', ''))
          .rejects.toThrow('Credenciais inválidas');
      });
    });

    describe('dado usuário registrado', () => {
      it('deve autenticar com credenciais de usuário registrado', async () => {
        await repository.register({ name: 'Ana', email: 'ana@test.com', password: '123456', role: 'student' });

        const result = await repository.login('ana@test.com', '123456');

        expect(result.user.email).toBe('ana@test.com');
        expect(result.user.role).toBe('student');
      });
    });
  });

  describe('register', () => {
    describe('dado dados válidos (student)', () => {
      it('deve retornar user e token', async () => {
        const result = await repository.register({
          name: 'Ana Silva',
          email: 'ana@test.com',
          password: '123456',
          role: 'student',
        });

        expect(result.user.name).toBe('Ana Silva');
        expect(result.user.email).toBe('ana@test.com');
        expect(result.user.role).toBe('student');
        expect(result.user.id).toBeDefined();
        expect(result.token).toBe('mock_jwt_token_postech_2024');
      });

      it('deve persistir token e user no localStorage', async () => {
        await repository.register({
          name: 'Ana Silva',
          email: 'ana@test.com',
          password: '123456',
          role: 'student',
        });

        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'mock_jwt_token_postech_2024');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', expect.any(String));
      });

      it('não deve incluir password no user retornado', async () => {
        const result = await repository.register({
          name: 'Ana Silva',
          email: 'ana@test.com',
          password: '123456',
          role: 'student',
        });

        expect(result.user.password).toBeUndefined();
      });
    });

    describe('dado dados válidos (teacher com accessCode)', () => {
      it('deve retornar user com role teacher', async () => {
        const result = await repository.register({
          name: 'Prof Carlos',
          email: 'carlos@test.com',
          password: '123456',
          role: 'teacher',
          accessCode: 'POSTECH2024',
        });

        expect(result.user.role).toBe('teacher');
        expect(result.user.name).toBe('Prof Carlos');
      });
    });

    describe('dado email já cadastrado', () => {
      it('deve lançar erro quando email é do mock user padrão', async () => {
        await expect(repository.register({
          name: 'Outro',
          email: 'professor@postech.com',
          password: '123456',
          role: 'student',
        })).rejects.toThrow('Email já cadastrado');
      });

      it('deve lançar erro quando email já foi registrado', async () => {
        await repository.register({
          name: 'Ana',
          email: 'ana@test.com',
          password: '123456',
          role: 'student',
        });

        await expect(repository.register({
          name: 'Ana 2',
          email: 'ana@test.com',
          password: '654321',
          role: 'student',
        })).rejects.toThrow('Email já cadastrado');
      });
    });

    describe('dado teacher com código de acesso inválido', () => {
      it('deve lançar erro', async () => {
        await expect(repository.register({
          name: 'Prof',
          email: 'prof@test.com',
          password: '123456',
          role: 'teacher',
          accessCode: 'CODIGO_ERRADO',
        })).rejects.toThrow('Código de acesso inválido');
      });
    });

    describe('dado teacher sem código de acesso', () => {
      it('deve lançar erro', async () => {
        await expect(repository.register({
          name: 'Prof',
          email: 'prof@test.com',
          password: '123456',
          role: 'teacher',
        })).rejects.toThrow('Código de acesso inválido');
      });
    });
  });

  describe('logout', () => {
    it('deve remover token do localStorage', async () => {
      await repository.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    });

    it('deve remover user do localStorage', async () => {
      await repository.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
    });

    it('deve ser idempotente (não lançar erro se já deslogado)', async () => {
      await expect(repository.logout()).resolves.toBeUndefined();
      await expect(repository.logout()).resolves.toBeUndefined();
    });
  });

  describe('getCurrentUser', () => {
    describe('dado usuario logado', () => {
      it('deve retornar o objeto user parseado', () => {
        const user = { id: 'usr_mock_001', name: 'Professor FIAP', email: 'professor@postech.com', role: 'teacher' };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));

        const result = repository.getCurrentUser();

        expect(result).toEqual(user);
        expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_user');
      });
    });

    describe('dado usuario não logado', () => {
      it('deve retornar null', () => {
        localStorageMock.getItem.mockReturnValue(null);

        const result = repository.getCurrentUser();

        expect(result).toBeNull();
      });
    });

    describe('dado JSON corrompido no localStorage', () => {
      it('deve retornar null sem lançar erro', () => {
        localStorageMock.getItem.mockReturnValue('{invalid json...');

        const result = repository.getCurrentUser();

        expect(result).toBeNull();
      });
    });
  });

  describe('isAuthenticated', () => {
    it('deve retornar true quando token existe', () => {
      localStorageMock.getItem.mockReturnValue('mock_jwt_token_postech_2024');

      expect(repository.isAuthenticated()).toBe(true);
    });

    it('deve retornar false quando token não existe', () => {
      localStorageMock.getItem.mockReturnValue(null);

      expect(repository.isAuthenticated()).toBe(false);
    });
  });
});