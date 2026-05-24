import User from './User';

describe('User', () => {
  const validUserData = {
    id: '1',
    name: 'Professor FIAP',
    email: 'professor@postech.com',
    role: 'teacher',
  };

  describe('dado dados válidos', () => {
    it('deve criar User com id, name, email e role', () => {
      const user = new User(validUserData);

      expect(user.id).toBe('1');
      expect(user.name).toBe('Professor FIAP');
      expect(user.email).toBe('professor@postech.com');
      expect(user.role).toBe('teacher');
    });

    it('deve expor id, name, email, role via getters', () => {
      const user = new User(validUserData);

      expect(user.id).toBeDefined();
      expect(user.name).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.role).toBeDefined();
    });

    it('deve fazer trim no name', () => {
      const user = new User({ ...validUserData, name: '  Professor FIAP  ' });

      expect(user.name).toBe('Professor FIAP');
    });

    it('toJSON() deve retornar objeto plain com todos os campos', () => {
      const user = new User(validUserData);
      const json = user.toJSON();

      expect(json).toEqual({
        id: '1',
        name: 'Professor FIAP',
        email: 'professor@postech.com',
        role: 'teacher',
      });
    });

    it('deve ser imutável (Object.freeze)', () => {
      const user = new User(validUserData);

      expect(() => { user.id = '999'; }).toThrow();
    });

    it('deve criar User com role "teacher"', () => {
      const user = new User({ ...validUserData, role: 'teacher' });
      expect(user.role).toBe('teacher');
    });

    it('deve criar User com role "student"', () => {
      const user = new User({ ...validUserData, role: 'student' });
      expect(user.role).toBe('student');
    });
  });

  describe('dado dados inválidos', () => {
    it('deve lançar erro para id vazio', () => {
      expect(() => new User({ ...validUserData, id: '' })).toThrow('O id é obrigatório');
    });

    it('deve lançar erro para id null', () => {
      expect(() => new User({ ...validUserData, id: null })).toThrow('O id é obrigatório');
    });

    it('deve lançar erro para id undefined', () => {
      expect(() => new User({ ...validUserData, id: undefined })).toThrow('O id é obrigatório');
    });

    it('deve lançar erro para name vazio', () => {
      expect(() => new User({ ...validUserData, name: '' })).toThrow('O nome é obrigatório');
    });

    it('deve lançar erro para name null', () => {
      expect(() => new User({ ...validUserData, name: null })).toThrow('O nome é obrigatório');
    });

    it('deve lançar erro para name undefined', () => {
      expect(() => new User({ ...validUserData, name: undefined })).toThrow('O nome é obrigatório');
    });

    it('deve lançar erro para name com apenas espaços', () => {
      expect(() => new User({ ...validUserData, name: '   ' })).toThrow('O nome é obrigatório');
    });

    it('deve lançar erro para email vazio', () => {
      expect(() => new User({ ...validUserData, email: '' })).toThrow('O email é obrigatório');
    });

    it('deve lançar erro para email null', () => {
      expect(() => new User({ ...validUserData, email: null })).toThrow('O email é obrigatório');
    });

    it('deve lançar erro para email undefined', () => {
      expect(() => new User({ ...validUserData, email: undefined })).toThrow('O email é obrigatório');
    });

    it('deve lançar erro para email em formato inválido', () => {
      expect(() => new User({ ...validUserData, email: 'invalido' })).toThrow('O email deve ter um formato válido');
    });

    it('deve lançar erro para email sem domínio', () => {
      expect(() => new User({ ...validUserData, email: 'user@' })).toThrow('O email deve ter um formato válido');
    });

    it('deve lançar erro para email sem @', () => {
      expect(() => new User({ ...validUserData, email: 'userdominio.com' })).toThrow('O email deve ter um formato válido');
    });

    it('deve lançar erro quando role é vazio', () => {
      expect(() => new User({ ...validUserData, role: '' })).toThrow('O role é obrigatório');
    });

    it('deve lançar erro quando role é null', () => {
      expect(() => new User({ ...validUserData, role: null })).toThrow('O role é obrigatório');
    });

    it('deve lançar erro quando role é undefined', () => {
      expect(() => new User({ ...validUserData, role: undefined })).toThrow('O role é obrigatório');
    });

    it('deve lançar erro quando role não é "teacher" nem "student"', () => {
      expect(() => new User({ ...validUserData, role: 'admin' })).toThrow('O role deve ser "teacher" ou "student"');
    });

    it('deve lançar erro quando role é "professor" (valor legado)', () => {
      expect(() => new User({ ...validUserData, role: 'professor' })).toThrow('O role deve ser "teacher" ou "student"');
    });
  });
});