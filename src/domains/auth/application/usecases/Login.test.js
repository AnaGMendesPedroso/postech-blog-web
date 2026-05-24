import Login from './Login';
import User from '../../domain/entities/User';

describe('Login UseCase', () => {
  let login;
  let mockAuthRepository;

  beforeEach(() => {
    mockAuthRepository = {
      login: jest.fn(),
      logout: jest.fn(),
      getCurrentUser: jest.fn(),
      isAuthenticated: jest.fn(),
    };
    login = new Login(mockAuthRepository);
  });

  describe('dado inputs válidos', () => {
    const validCredentials = { email: 'professor@postech.com', password: 'postech123' };

    it('deve chamar authRepository.login com email e password', async () => {
      // Given
      mockAuthRepository.login.mockResolvedValue({
        user: { id: '1', name: 'Professor', email: 'professor@postech.com', role: 'teacher' },
        token: 'mock_token',
      });

      // When
      await login.execute(validCredentials);

      // Then
      expect(mockAuthRepository.login).toHaveBeenCalledWith('professor@postech.com', 'postech123');
      expect(mockAuthRepository.login).toHaveBeenCalledTimes(1);
    });

    it('deve retornar { user, token } quando credenciais válidas', async () => {
      // Given
      mockAuthRepository.login.mockResolvedValue({
        user: { id: '1', name: 'Professor', email: 'professor@postech.com', role: 'teacher' },
        token: 'mock_token',
      });

      // When
      const result = await login.execute(validCredentials);

      // Then
      expect(result.token).toBe('mock_token');
      expect(result.user).toBeDefined();
      expect(result.user.name).toBe('Professor');
    });

    it('user retornado deve ser instância de User entity', async () => {
      // Given
      mockAuthRepository.login.mockResolvedValue({
        user: { id: '1', name: 'Professor', email: 'professor@postech.com', role: 'teacher' },
        token: 'mock_token',
      });

      // When
      const result = await login.execute(validCredentials);

      // Then
      expect(result.user).toBeInstanceOf(User);
    });
  });

  describe('dado inputs inválidos', () => {
    it('deve lançar erro quando email é vazio', async () => {
      await expect(login.execute({ email: '', password: 'postech123' }))
        .rejects.toThrow('Email é obrigatório');
    });

    it('deve lançar erro quando email é null', async () => {
      await expect(login.execute({ email: null, password: 'postech123' }))
        .rejects.toThrow('Email é obrigatório');
    });

    it('deve lançar erro quando email é undefined', async () => {
      await expect(login.execute({ password: 'postech123' }))
        .rejects.toThrow('Email é obrigatório');
    });

    it('deve lançar erro quando password é vazio', async () => {
      await expect(login.execute({ email: 'professor@postech.com', password: '' }))
        .rejects.toThrow('Senha é obrigatória');
    });

    it('deve lançar erro quando password é null', async () => {
      await expect(login.execute({ email: 'professor@postech.com', password: null }))
        .rejects.toThrow('Senha é obrigatória');
    });

    it('deve lançar erro quando password é undefined', async () => {
      await expect(login.execute({ email: 'professor@postech.com' }))
        .rejects.toThrow('Senha é obrigatória');
    });

    it('não deve chamar repositório se validação de email falhar', async () => {
      try { await login.execute({ email: '', password: '123' }); } catch {}

      expect(mockAuthRepository.login).not.toHaveBeenCalled();
    });

    it('não deve chamar repositório se validação de password falhar', async () => {
      try { await login.execute({ email: 'test@test.com', password: '' }); } catch {}

      expect(mockAuthRepository.login).not.toHaveBeenCalled();
    });
  });

  describe('dado erro do repositório', () => {
    it('deve propagar erro quando credenciais inválidas', async () => {
      // Given
      mockAuthRepository.login.mockRejectedValue(new Error('Credenciais inválidas'));

      // When & Then
      await expect(login.execute({ email: 'wrong@email.com', password: 'wrong' }))
        .rejects.toThrow('Credenciais inválidas');
    });
  });
});
