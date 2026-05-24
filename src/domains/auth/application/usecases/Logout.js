class Logout {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute() {
    await this.authRepository.logout();
  }
}

export default Logout;
