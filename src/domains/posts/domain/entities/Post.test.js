import Post from './Post';
import PostTitle from '../value-objects/PostTitle';
import PostContent from '../value-objects/PostContent';
import PostStatus from '../value-objects/PostStatus';

describe('Post', () => {
  const validPostData = {
    id: '1',
    titulo: 'Título válido',
    conteudo: 'Conteúdo válido com mais de 10 caracteres',
    autor: 'Autor Teste',
  };

  describe('dado dados válidos', () => {
    it('deve criar a entidade com sucesso', () => {
      const post = new Post(validPostData);

      expect(post.id).toBe('1');
      expect(post.titulo).toBeInstanceOf(PostTitle);
      expect(post.titulo.value).toBe('Título válido');
      expect(post.conteudo).toBeInstanceOf(PostContent);
      expect(post.conteudo.value).toBe('Conteúdo válido com mais de 10 caracteres');
      expect(post.autor).toBe('Autor Teste');
      expect(post.status).toBeInstanceOf(PostStatus);
      expect(post.status.value).toBe('draft');
      expect(post.createdAt).toBeInstanceOf(Date);
      expect(post.updatedAt).toBeInstanceOf(Date);
    });

    it('deve aceitar Value Objects como parâmetros', () => {
      const post = new Post({
        id: '2',
        titulo: new PostTitle('Título VO'),
        conteudo: new PostContent('Conteúdo passado como Value Object'),
        autor: 'Autor',
        status: new PostStatus('published'),
      });

      expect(post.titulo.value).toBe('Título VO');
      expect(post.conteudo.value).toBe('Conteúdo passado como Value Object');
      expect(post.status.value).toBe('published');
    });

    it('deve ter status "draft" como padrão', () => {
      const post = new Post(validPostData);
      expect(post.status.value).toBe('draft');
    });

    it('deve gerar createdAt automaticamente', () => {
      const before = new Date();
      const post = new Post(validPostData);
      const after = new Date();

      expect(post.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(post.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('deve gerar updatedAt automaticamente', () => {
      const before = new Date();
      const post = new Post(validPostData);
      const after = new Date();

      expect(post.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(post.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('deve fazer trim no autor', () => {
      const post = new Post({ ...validPostData, autor: '  Autor Teste  ' });
      expect(post.autor).toBe('Autor Teste');
    });

    it('deve aceitar createdAt e updatedAt customizados', () => {
      const date = new Date('2024-01-01');
      const post = new Post({ ...validPostData, createdAt: date, updatedAt: date });

      expect(post.createdAt).toBe(date);
      expect(post.updatedAt).toBe(date);
    });

    it('deve ser imutável', () => {
      const post = new Post(validPostData);
      expect(() => { post.id = '999'; }).toThrow();
    });
  });

  describe('dado um autor vazio', () => {
    it('deve lançar erro de validação', () => {
      expect(() => new Post({ ...validPostData, autor: '' })).toThrow('O autor é obrigatório');
    });

    it('deve lançar erro para null', () => {
      expect(() => new Post({ ...validPostData, autor: null })).toThrow('O autor é obrigatório');
    });

    it('deve lançar erro para espaços em branco', () => {
      expect(() => new Post({ ...validPostData, autor: '   ' })).toThrow('O autor é obrigatório');
    });
  });

  describe('dado um título inválido', () => {
    it('deve lançar erro de validação', () => {
      expect(() => new Post({ ...validPostData, titulo: '' })).toThrow();
    });
  });

  describe('dado um conteúdo inválido', () => {
    it('deve lançar erro de validação', () => {
      expect(() => new Post({ ...validPostData, conteudo: '' })).toThrow();
    });
  });

  describe('toJSON', () => {
    it('deve retornar representação JSON da entidade', () => {
      const date = new Date('2024-01-01');
      const post = new Post({
        ...validPostData,
        status: 'published',
        createdAt: date,
        updatedAt: date,
      });

      const json = post.toJSON();

      expect(json).toEqual({
        id: '1',
        titulo: 'Título válido',
        conteudo: 'Conteúdo válido com mais de 10 caracteres',
        autor: 'Autor Teste',
        status: 'published',
        createdAt: date,
        updatedAt: date,
      });
    });
  });
});
