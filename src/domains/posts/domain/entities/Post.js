import PostTitle from '../value-objects/PostTitle';
import PostContent from '../value-objects/PostContent';
import PostStatus from '../value-objects/PostStatus';

class Post {
  #id;
  #titulo;
  #conteudo;
  #autor;
  #status;
  #createdAt;
  #updatedAt;

  constructor({ id, titulo, conteudo, autor, status, createdAt, updatedAt }) {
    if (!autor || autor.trim().length === 0) {
      throw new Error('O autor é obrigatório');
    }

    this.#id = id;
    this.#titulo = titulo instanceof PostTitle ? titulo : new PostTitle(titulo);
    this.#conteudo = conteudo instanceof PostContent ? conteudo : new PostContent(conteudo);
    this.#autor = autor.trim();
    this.#status = status instanceof PostStatus ? status : new PostStatus(status);
    this.#createdAt = createdAt || new Date();
    this.#updatedAt = updatedAt || new Date();

    Object.freeze(this);
  }

  get id() {
    return this.#id;
  }

  get titulo() {
    return this.#titulo;
  }

  get conteudo() {
    return this.#conteudo;
  }

  get autor() {
    return this.#autor;
  }

  get status() {
    return this.#status;
  }

  get createdAt() {
    return this.#createdAt;
  }

  get updatedAt() {
    return this.#updatedAt;
  }

  toJSON() {
    return {
      id: this.#id,
      titulo: this.#titulo.value,
      conteudo: this.#conteudo.value,
      autor: this.#autor,
      status: this.#status.value,
      createdAt: this.#createdAt,
      updatedAt: this.#updatedAt,
    };
  }
}

export default Post;
