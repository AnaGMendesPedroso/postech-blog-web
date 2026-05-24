import User from '../../domain/entities/User';

class Login {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute({ email, password }) {
    if (!email) {
      throw new Error('Email é obrigatório');
    }

    if (!password) {
      throw new Error('Senha é obrigatória');
    }

    const result = await this.authRepository.login(email, password);

    const user = new User({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
    });

    return { user, token: result.token };
  }
}

export default Login;
