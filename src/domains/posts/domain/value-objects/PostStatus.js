const VALID_STATUSES = ['draft', 'published'];

class PostStatus {
  #value;

  constructor(value = 'draft') {
    if (!VALID_STATUSES.includes(value)) {
      throw new Error(`Status inválido: "${value}". Valores permitidos: ${VALID_STATUSES.join(', ')}`);
    }
    this.#value = value;
    Object.freeze(this);
  }

  get value() {
    return this.#value;
  }

  isDraft() {
    return this.#value === 'draft';
  }

  isPublished() {
    return this.#value === 'published';
  }

  equals(other) {
    if (!(other instanceof PostStatus)) return false;
    return this.#value === other.value;
  }

  toString() {
    return this.#value;
  }
}

export default PostStatus;
