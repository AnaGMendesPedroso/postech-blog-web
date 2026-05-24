import PostTitle from '../../domain/value-objects/PostTitle';
import PostContent from '../../domain/value-objects/PostContent';
import PostStatus from '../../domain/value-objects/PostStatus';

class CreatePost {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(dto) {
    if (!dto.autor || dto.autor.trim().length === 0) {
      throw new Error('Autor é obrigatório');
    }

    const titulo = new PostTitle(dto.titulo);
    const conteudo = new PostContent(dto.conteudo);
    const status = new PostStatus(dto.status);

    return this.repository.create({
      titulo: titulo.value,
      conteudo: conteudo.value,
      autor: dto.autor.trim(),
      status: status.value
    });
  }
}

export default CreatePost;
