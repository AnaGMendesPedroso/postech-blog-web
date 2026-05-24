import Register from './Register';
import User from '../../domain/entities/User';

describe('Register UseCase', () => {
  let register;
  let mockAuthRepository;

  beforeEach(() => {
    mockAuthRepository = {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      getCurrentUser: jest.fn(),
      isAuthenticated: jest.fn(),
    };
    register = new Register(mockAuthRepository);
  });

  const validStudentData = { name: 'Ana Silva', email: 'ana@test.com', password: '123456', role: 'student' };
  const validTeacherData = { name: 'Prof Carlos', email: 'carlos@test.com', password: '123456', role: 'teacher', accessCode: 'POSTECH2024' };

  describe('dado inputs válidos (student)', () => {
    beforeEach(() => {
      mockAuthRepository.register.mockResolvedValue({
        user: { id: '2', name: 'Ana Silva', email: 'ana@test.com', role: 'student' },
        token: 'tok_student',
      });
    });

    it('deve chamar authRepository.register com dados corretos', async () => {
      await register.execute(validStudentData);

      expect(mockAuthRepository.register).toHaveBeenCalledWith(validStudentData);
      expect(mockAuthRepository.register).toHaveBeenCalledTimes(1);
    });

    it('deve retornar { user, token }', async () => {
      const result = await register.execute(validStudentData);

      expect(result.token).toBe('tok_student');
      expect(result.user).toBeDefined();
      expect(result.user.name).toBe('Ana Silva');
    });

    it('user retornado deve ser instância de User entity com role "student"', async () => {
      const result = await register.execute(validStudentData);

      expect(result.user).toBeInstanceOf(User);
      expect(result.user.role).toBe('student');
    });
  });

  describe('dado inputs válidos (teacher com accessCode)', () => {
    beforeEach(() => {
      mockAuthRepository.register.mockResolvedValue({
        user: { id: '3', name: 'Prof Carlos', email: 'carlos@test.com', role: 'teacher' },
        token: 'tok_teacher',
      });
    });

    it('deve chamar authRepository.register incluindo accessCode', async () => {
      await register.execute(validTeacherData);

      expect(mockAuthRepository.register).toHaveBeenCalledWith(validTeacherData);
    });

    it('deve retornar user com role "teacher"', async () => {
      const result = await register.execute(validTeacherData);

      expect(result.user).toBeInstanceOf(User);
      expect(result.user.role).toBe('teacher');
    });
  });

  describe('dado inputs inválidos', () => {
    it('deve lançar erro quando name é vazio', async () => {
      await expect(register.execute({ ...validStudentData, name: '' }))
        .rejects.toThrow('Nome é obrigatório');
    });

    it('deve lançar erro quando name é apenas espaços', async () => {
      await expect(register.execute({ ...validStudentData, name: '   ' }))
        .rejects.toThrow('Nome é obrigatório');
    });

    it('deve lançar erro quando email é vazio', async () => {
      await expect(register.execute({ ...validStudentData, email: '' }))
        .rejects.toThrow('Email é obrigatório');
    });

    it('deve lançar erro quando password é vazio', async () => {
      await expect(register.execute({ ...validStudentData, password: '' }))
        .rejects.toThrow('Senha é obrigatória');
    });

    it('deve lançar erro quando role é vazio', async () => {
      await expect(register.execute({ ...validStudentData, role: '' }))
        .rejects.toThrow('Role é obrigatório');
    });

    it('deve lançar erro quando role é valor inválido', async () => {
      await expect(register.execute({ ...validStudentData, role: 'admin' }))
        .rejects.toThrow('Role deve ser "teacher" ou "student"');
    });

    it('deve lançar erro quando role é teacher sem accessCode', async () => {
      await expect(register.execute({ name: 'Prof', email: 'prof@test.com', password: '123456', role: 'teacher' }))
        .rejects.toThrow('Código de acesso é obrigatório para professoras');
    });

    it('deve lançar erro quando role é teacher com accessCode vazio', async () => {
      await expect(register.execute({ ...validTeacherData, accessCode: '   ' }))
        .rejects.toThrow('Código de acesso é obrigatório para professoras');
    });

    it('não deve chamar repositório se validação falhar', async () => {
      try { await register.execute({ ...validStudentData, name: '' }); } catch {}
      try { await register.execute({ ...validStudentData, email: '' }); } catch {}
      try { await register.execute({ ...validStudentData, role: 'invalid' }); } catch {}

      expect(mockAuthRepository.register).not.toHaveBeenCalled();
    });
  });

  describe('dado erro do repositório', () => {
    it('deve propagar erro "Email já cadastrado"', async () => {
      mockAuthRepository.register.mockRejectedValue(new Error('Email já cadastrado'));

      await expect(register.execute(validStudentData))
        .rejects.toThrow('Email já cadastrado');
    });

    it('deve propagar erro "Código de acesso inválido"', async () => {
      mockAuthRepository.register.mockRejectedValue(new Error('Código de acesso inválido'));

      await expect(register.execute(validTeacherData))
        .rejects.toThrow('Código de acesso inválido');
    });
  });
});
