class CreatePostDTO {
  constructor({ titulo, conteudo, autor, status = 'draft' }) {
    this.titulo = titulo;
    this.conteudo = conteudo;
    this.autor = autor;
    this.status = status;
  }
}

export default CreatePostDTO;
