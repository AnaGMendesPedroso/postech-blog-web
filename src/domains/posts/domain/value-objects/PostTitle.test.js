import PostTitle from './PostTitle';

describe('PostTitle', () => {
  describe('dado um título válido', () => {
    it('deve criar o value object com sucesso', () => {
      const title = new PostTitle('Meu Post');
      expect(title.value).toBe('Meu Post');
    });

    it('deve remover espaços extras', () => {
      const title = new PostTitle('  Meu Post  ');
      expect(title.value).toBe('Meu Post');
    });

    it('deve ser imutável', () => {
      const title = new PostTitle('Meu Post');
      expect(() => { title.value = 'Outro'; }).toThrow();
    });
  });

  describe('dado um título vazio', () => {
    it('deve lançar erro de validação', () => {
      expect(() => new PostTitle('')).toThrow('O título é obrigatório');
    });

    it('deve lançar erro para null', () => {
      expect(() => new PostTitle(null)).toThrow('O título é obrigatório');
    });

    it('deve lançar erro para undefined', () => {
      expect(() => new PostTitle(undefined)).toThrow('O título é obrigatório');
    });

    it('deve lançar erro para espaços em branco', () => {
      expect(() => new PostTitle('   ')).toThrow('O título é obrigatório');
    });
  });

  describe('dado um título com menos de 3 caracteres', () => {
    it('deve lançar erro de validação', () => {
      expect(() => new PostTitle('AB')).toThrow('O título deve ter no mínimo 3 caracteres');
    });

    it('deve lançar erro para título que tem 3+ chars com espaços mas < 3 após trim', () => {
      expect(() => new PostTitle('  A  ')).toThrow('O título deve ter no mínimo 3 caracteres');
    });
  });

  describe('dado um título com exatamente 3 caracteres (boundary)', () => {
    it('deve criar o value object com sucesso', () => {
      const title = new PostTitle('ABC');
      expect(title.value).toBe('ABC');
    });
  });

  describe('dado um título com exatamente 200 caracteres (boundary)', () => {
    it('deve criar o value object com sucesso', () => {
      const longTitle = 'A'.repeat(200);
      const title = new PostTitle(longTitle);
      expect(title.value).toBe(longTitle);
    });

    it('deve criar com sucesso quando title + espaços > 200 mas trimmed = 200', () => {
      const longTitle = ' ' + 'A'.repeat(200) + ' ';
      const title = new PostTitle(longTitle);
      expect(title.value).toBe('A'.repeat(200));
    });
  });

  describe('dado um título com mais de 200 caracteres', () => {
    it('deve lançar erro de validação', () => {
      const longTitle = 'A'.repeat(201);
      expect(() => new PostTitle(longTitle)).toThrow('O título deve ter no máximo 200 caracteres');
    });
  });

  describe('equals', () => {
    it('deve retornar true para títulos iguais', () => {
      const title1 = new PostTitle('Meu Post');
      const title2 = new PostTitle('Meu Post');
      expect(title1.equals(title2)).toBe(true);
    });

    it('deve retornar false para títulos diferentes', () => {
      const title1 = new PostTitle('Meu Post');
      const title2 = new PostTitle('Outro Post');
      expect(title1.equals(title2)).toBe(false);
    });

    it('deve retornar false para objeto de outro tipo', () => {
      const title = new PostTitle('Meu Post');
      expect(title.equals('Meu Post')).toBe(false);
    });

    it('deve retornar false para objeto com mesmo value mas não instância de PostTitle', () => {
      const title = new PostTitle('Meu Post');
      const fakeTitle = { value: 'Meu Post' };
      expect(title.equals(fakeTitle)).toBe(false);
    });
  });

  describe('toString', () => {
    it('deve retornar o valor como string', () => {
      const title = new PostTitle('Meu Post');
      expect(title.toString()).toBe('Meu Post');
    });
  });
});
