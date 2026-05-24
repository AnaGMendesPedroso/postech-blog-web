import CreatePostDTO from './CreatePostDTO';

describe('CreatePostDTO', () => {
  describe('dado todos os campos fornecidos', () => {
    it('deve criar o DTO com todos os atributos preenchidos', () => {
      // Given
      const data = { titulo: 'Meu Post', conteudo: 'Conteúdo do post', autor: 'Professor', status: 'published' };

      // When
      const dto = new CreatePostDTO(data);

      // Then
      expect(dto.titulo).toBe('Meu Post');
      expect(dto.conteudo).toBe('Conteúdo do post');
      expect(dto.autor).toBe('Professor');
      expect(dto.status).toBe('published');
    });
  });

  describe('dado que status não é fornecido', () => {
    it('deve usar "draft" como status default', () => {
      // Given
      const data = { titulo: 'Meu Post', conteudo: 'Conteúdo do post', autor: 'Professor' };

      // When
      const dto = new CreatePostDTO(data);

      // Then
      expect(dto.status).toBe('draft');
    });
  });

  describe('dado valores recebidos', () => {
    it('deve preservar os valores sem alteração ou validação', () => {
      // Given
      const data = { titulo: 'ab', conteudo: 'x', autor: '', status: 'invalid' };

      // When
      const dto = new CreatePostDTO(data);

      // Then
      expect(dto.titulo).toBe('ab');
      expect(dto.conteudo).toBe('x');
      expect(dto.autor).toBe('');
      expect(dto.status).toBe('invalid');
    });
  });
});
