import PostTitle from '../../domain/value-objects/PostTitle';
import PostContent from '../../domain/value-objects/PostContent';
import PostStatus from '../../domain/value-objects/PostStatus';

class UpdatePost {
  constructor(repository) {
    this.repository = repository;
  }

  async execute({ id, data } = {}) {
    if (!id || id.trim().length === 0) {
      throw new Error('ID é obrigatório');
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error('Pelo menos um campo deve ser fornecido');
    }

    const validatedData = {};

    if (data.titulo !== undefined) {
      const titulo = new PostTitle(data.titulo);
      validatedData.titulo = titulo.value;
    }

    if (data.conteudo !== undefined) {
      const conteudo = new PostContent(data.conteudo);
      validatedData.conteudo = conteudo.value;
    }

    if (data.autor !== undefined) {
      validatedData.autor = data.autor;
    }

    if (data.status !== undefined) {
      const status = new PostStatus(data.status);
      validatedData.status = status.value;
    }

    return this.repository.update(id, validatedData);
  }
}

export default UpdatePost;
