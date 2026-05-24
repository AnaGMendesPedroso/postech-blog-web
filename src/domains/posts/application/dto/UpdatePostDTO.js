class UpdatePostDTO {
  constructor({ titulo, conteudo, autor, status } = {}) {
    if (titulo !== undefined) this.titulo = titulo;
    if (conteudo !== undefined) this.conteudo = conteudo;
    if (autor !== undefined) this.autor = autor;
    if (status !== undefined) this.status = status;
  }

  hasChanges() {
    return Object.keys(this).length > 0;
  }
}

export default UpdatePostDTO;
