const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = ['teacher', 'student'];

class User {
  #id;
  #name;
  #email;
  #role;

  constructor({ id, name, email, role }) {
    if (!id) {
      throw new Error('O id é obrigatório');
    }

    if (!name || name.trim().length === 0) {
      throw new Error('O nome é obrigatório');
    }

    if (!email) {
      throw new Error('O email é obrigatório');
    }

    if (!EMAIL_REGEX.test(email)) {
      throw new Error('O email deve ter um formato válido');
    }

    if (!role) {
      throw new Error('O role é obrigatório');
    }

    if (!VALID_ROLES.includes(role)) {
      throw new Error('O role deve ser "teacher" ou "student"');
    }

    this.#id = id;
    this.#name = name.trim();
    this.#email = email;
    this.#role = role;

    Object.freeze(this);
  }

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get email() {
    return this.#email;
  }

  get role() {
    return this.#role;
  }

  toJSON() {
    return {
      id: this.#id,
      name: this.#name,
      email: this.#email,
      role: this.#role,
    };
  }
}

export default User;