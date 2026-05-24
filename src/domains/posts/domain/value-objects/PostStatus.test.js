import PostStatus from './PostStatus';

describe('PostStatus', () => {
  describe('dado um status válido', () => {
    it('deve criar com status "draft"', () => {
      const status = new PostStatus('draft');
      expect(status.value).toBe('draft');
    });

    it('deve criar com status "published"', () => {
      const status = new PostStatus('published');
      expect(status.value).toBe('published');
    });

    it('deve ter "draft" como valor padrão', () => {
      const status = new PostStatus();
      expect(status.value).toBe('draft');
    });

    it('deve ser imutável', () => {
      const status = new PostStatus('draft');
      expect(() => { status.value = 'published'; }).toThrow();
    });
  });

  describe('dado um status inválido', () => {
    it('deve lançar erro de validação', () => {
      expect(() => new PostStatus('invalid')).toThrow('Status inválido');
    });

    it('deve lançar erro para string vazia', () => {
      expect(() => new PostStatus('')).toThrow('Status inválido');
    });

    it('deve incluir valores permitidos na mensagem de erro', () => {
      expect(() => new PostStatus('invalid')).toThrow('draft, published');
    });
  });

  describe('isDraft', () => {
    it('deve retornar true para draft', () => {
      const status = new PostStatus('draft');
      expect(status.isDraft()).toBe(true);
    });

    it('deve retornar false para published', () => {
      const status = new PostStatus('published');
      expect(status.isDraft()).toBe(false);
    });
  });

  describe('isPublished', () => {
    it('deve retornar true para published', () => {
      const status = new PostStatus('published');
      expect(status.isPublished()).toBe(true);
    });

    it('deve retornar false para draft', () => {
      const status = new PostStatus('draft');
      expect(status.isPublished()).toBe(false);
    });
  });

  describe('equals', () => {
    it('deve retornar true para status iguais', () => {
      const status1 = new PostStatus('draft');
      const status2 = new PostStatus('draft');
      expect(status1.equals(status2)).toBe(true);
    });

    it('deve retornar false para status diferentes', () => {
      const status1 = new PostStatus('draft');
      const status2 = new PostStatus('published');
      expect(status1.equals(status2)).toBe(false);
    });

    it('deve retornar false para objeto de outro tipo', () => {
      const status = new PostStatus('draft');
      expect(status.equals('draft')).toBe(false);
    });

    it('deve retornar false para objeto com mesmo value mas não instância de PostStatus', () => {
      const status = new PostStatus('draft');
      const fakeStatus = { value: 'draft' };
      expect(status.equals(fakeStatus)).toBe(false);
    });
  });

  describe('toString', () => {
    it('deve retornar "published" como string para status published', () => {
      const status = new PostStatus('published');
      expect(status.toString()).toBe('published');
    });

    it('deve retornar "draft" como string para status draft', () => {
      const status = new PostStatus('draft');
      expect(status.toString()).toBe('draft');
    });
  });

  describe('dado null como valor', () => {
    it('deve lançar erro de validação', () => {
      expect(() => new PostStatus(null)).toThrow('Status inválido');
    });
  });
});
