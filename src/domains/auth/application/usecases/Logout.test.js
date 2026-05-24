import Logout from './Logout';

describe('Logout UseCase', () => {
  let logout;
  let mockAuthRepository;

  beforeEach(() => {
    mockAuthRepository = {
      login: jest.fn(),
      logout: jest.fn(),
      getCurrentUser: jest.fn(),
      isAuthenticated: jest.fn(),
    };
    logout = new Logout(mockAuthRepository);
  });

  describe('dado execução do logout', () => {
    it('deve chamar authRepository.logout', async () => {
      // Given
      mockAuthRepository.logout.mockResolvedValue(undefined);

      // When
      await logout.execute();

      // Then
      expect(mockAuthRepository.logout).toHaveBeenCalledTimes(1);
    });

    it('deve resolver sem valor de retorno', async () => {
      // Given
      mockAuthRepository.logout.mockResolvedValue(undefined);

      // When
      const result = await logout.execute();

      // Then
      expect(result).toBeUndefined();
    });
  });

  describe('dado erro do repositório', () => {
    it('deve propagar erro se repositório lançar exceção', async () => {
      // Given
      mockAuthRepository.logout.mockRejectedValue(new Error('Erro ao fazer logout'));

      // When & Then
      await expect(logout.execute()).rejects.toThrow('Erro ao fazer logout');
    });
  });
});
