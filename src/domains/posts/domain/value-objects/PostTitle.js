class PostTitle {
  #value;

  constructor(value) {
    if (!value || value.trim().length === 0) {
      throw new Error('O título é obrigatório');
    }
    if (value.trim().length < 3) {
      throw new Error('O título deve ter no mínimo 3 caracteres');
    }
    if (value.trim().length > 200) {
      throw new Error('O título deve ter no máximo 200 caracteres');
    }
    this.#value = value.trim();
    Object.freeze(this);
  }

  get value() {
    return this.#value;
  }

  equals(other) {
    if (!(other instanceof PostTitle)) return false;
    return this.#value === other.value;
  }

  toString() {
    return this.#value;
  }
}

export default PostTitle;
