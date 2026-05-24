import UpdatePostDTO from './UpdatePostDTO';

describe('UpdatePostDTO', () => {
  describe('dado todos os campos fornecidos', () => {
    it('deve criar o DTO com todos os atributos presentes', () => {
      // Given
      const data = { titulo: 'Novo Título', conteudo: 'Novo conteúdo', autor: 'Novo Autor', status: 'published' };

      // When
      const dto = new UpdatePostDTO(data);

      // Then
      expect(dto.titulo).toBe('Novo Título');
      expect(dto.conteudo).toBe('Novo conteúdo');
      expect(dto.autor).toBe('Novo Autor');
      expect(dto.status).toBe('published');
    });
  });

  describe('dado apenas o título fornecido', () => {
    it('deve conter somente o atributo titulo', () => {
      // Given
      const data = { titulo: 'Novo Título' };

      // When
      const dto = new UpdatePostDTO(data);

      // Then
      expect(dto.titulo).toBe('Novo Título');
      expect(dto).not.toHaveProperty('conteudo');
      expect(dto).not.toHaveProperty('autor');
      expect(dto).not.toHaveProperty('status');
    });
  });

  describe('dado nenhum campo fornecido', () => {
    it('deve retornar hasChanges() como false', () => {
      // Given & When
      const dto = new UpdatePostDTO({});

      // Then
      expect(dto.hasChanges()).toBe(false);
    });
  });

  describe('dado campos com valor undefined', () => {
    it('não deve adicionar propriedades undefined ao DTO', () => {
      // Given
      const data = { titulo: undefined, conteudo: 'Conteúdo válido' };

      // When
      const dto = new UpdatePostDTO(data);

      // Then
      expect(dto).not.toHaveProperty('titulo');
      expect(dto.conteudo).toBe('Conteúdo válido');
    });
  });

  describe('dado pelo menos um campo fornecido', () => {
    it('deve retornar hasChanges() como true', () => {
      // Given
      const data = { status: 'published' };

      // When
      const dto = new UpdatePostDTO(data);

      // Then
      expect(dto.hasChanges()).toBe(true);
    });
  });

  describe('dado construtor sem argumentos', () => {
    it('deve criar DTO vazio sem erro', () => {
      // Given & When
      const dto = new UpdatePostDTO();

      // Then
      expect(dto.hasChanges()).toBe(false);
    });
  });
});
