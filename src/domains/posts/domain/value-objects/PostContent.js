class PostContent {
  #value;

  constructor(value) {
    if (!value || value.trim().length === 0) {
      throw new Error('O conteúdo é obrigatório');
    }
    if (value.trim().length < 10) {
      throw new Error('O conteúdo deve ter no mínimo 10 caracteres');
    }
    this.#value = value.trim();
    Object.freeze(this);
  }

  get value() {
    return this.#value;
  }

  equals(other) {
    if (!(other instanceof PostContent)) return false;
    return this.#value === other.value;
  }

  toString() {
    return this.#value;
  }
}

export default PostContent;
