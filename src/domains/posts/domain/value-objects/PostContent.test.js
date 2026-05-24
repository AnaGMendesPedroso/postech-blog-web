import PostContent from './PostContent';

describe('PostContent', () => {
  describe('dado um conteúdo válido', () => {
    it('deve criar o value object com sucesso', () => {
      const content = new PostContent('Este é um conteúdo válido para o post');
      expect(content.value).toBe('Este é um conteúdo válido para o post');
    });

    it('deve remover espaços extras', () => {
      const content = new PostContent('  Conteúdo válido do post  ');
      expect(content.value).toBe('Conteúdo válido do post');
    });

    it('deve ser imutável', () => {
      const content = new PostContent('Conteúdo válido do post');
      expect(() => { content.value = 'Outro conteúdo'; }).toThrow();
    });
  });

  describe('dado um conteúdo vazio', () => {
    it('deve lançar erro de validação', () => {
      expect(() => new PostContent('')).toThrow('O conteúdo é obrigatório');
    });

    it('deve lançar erro para null', () => {
      expect(() => new PostContent(null)).toThrow('O conteúdo é obrigatório');
    });

    it('deve lançar erro para undefined', () => {
      expect(() => new PostContent(undefined)).toThrow('O conteúdo é obrigatório');
    });

    it('deve lançar erro para espaços em branco', () => {
      expect(() => new PostContent('   ')).toThrow('O conteúdo é obrigatório');
    });
  });

  describe('dado um conteúdo com menos de 10 caracteres', () => {
    it('deve lançar erro de validação', () => {
      expect(() => new PostContent('Curto')).toThrow('O conteúdo deve ter no mínimo 10 caracteres');
    });

    it('deve lançar erro para exatamente 9 caracteres (boundary - 1)', () => {
      expect(() => new PostContent('123456789')).toThrow('O conteúdo deve ter no mínimo 10 caracteres');
    });

    it('deve lançar erro para conteúdo que tem 10+ chars com espaços mas < 10 após trim', () => {
      expect(() => new PostContent('   12345   ')).toThrow('O conteúdo deve ter no mínimo 10 caracteres');
    });
  });

  describe('dado um conteúdo com exatamente 10 caracteres (boundary)', () => {
    it('deve criar o value object com sucesso', () => {
      const content = new PostContent('1234567890');
      expect(content.value).toBe('1234567890');
    });
  });

  describe('equals', () => {
    it('deve retornar true para conteúdos iguais', () => {
      const content1 = new PostContent('Conteúdo válido do post');
      const content2 = new PostContent('Conteúdo válido do post');
      expect(content1.equals(content2)).toBe(true);
    });

    it('deve retornar false para conteúdos diferentes', () => {
      const content1 = new PostContent('Conteúdo válido do post');
      const content2 = new PostContent('Outro conteúdo válido');
      expect(content1.equals(content2)).toBe(false);
    });

    it('deve retornar false para objeto de outro tipo', () => {
      const content = new PostContent('Conteúdo válido do post');
      expect(content.equals('Conteúdo válido do post')).toBe(false);
    });

    it('deve retornar false para objeto com mesmo value mas não instância de PostContent', () => {
      const content = new PostContent('Conteúdo válido do post');
      const fakeContent = { value: 'Conteúdo válido do post' };
      expect(content.equals(fakeContent)).toBe(false);
    });
  });

  describe('toString', () => {
    it('deve retornar o valor como string', () => {
      const content = new PostContent('Conteúdo válido do post');
      expect(content.toString()).toBe('Conteúdo válido do post');
    });
  });
});
