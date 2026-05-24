import User from '../../domain/entities/User';

const VALID_ROLES = ['teacher', 'student'];

class Register {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute({ name, email, password, role, accessCode }) {
    if (!name || name.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }

    if (!email) {
      throw new Error('Email é obrigatório');
    }

    if (!password) {
      throw new Error('Senha é obrigatória');
    }

    if (!role) {
      throw new Error('Role é obrigatório');
    }

    if (!VALID_ROLES.includes(role)) {
      throw new Error('Role deve ser "teacher" ou "student"');
    }

    if (role === 'teacher' && (!accessCode || accessCode.trim().length === 0)) {
      throw new Error('Código de acesso é obrigatório para professoras');
    }

    const result = await this.authRepository.register({ name, email, password, role, accessCode });

    const user = new User({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
    });

    return { user, token: result.token };
  }
}

export default Register;
