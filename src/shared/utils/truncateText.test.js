import { truncateText } from './truncateText';

describe('truncateText', () => {
  it('deve retornar texto inalterado se menor que maxLength', () => {
    expect(truncateText('Short', 100)).toBe('Short');
  });

  it('deve retornar texto inalterado se tamanho é exatamente maxLength (boundary)', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });

  it('deve truncar e adicionar "..." se maior que maxLength', () => {
    expect(truncateText('Hello World', 5)).toBe('Hello...');
  });

  it('deve truncar quando text.length é maxLength + 1 (boundary)', () => {
    expect(truncateText('123456', 5)).toBe('12345...');
  });

  it('deve usar maxLength default de 150', () => {
    const longText = 'a'.repeat(200);
    const result = truncateText(longText);
    expect(result).toBe('a'.repeat(150) + '...');
  });

  it('deve retornar texto inalterado com maxLength default quando text.length = 150', () => {
    const exactText = 'a'.repeat(150);
    expect(truncateText(exactText)).toBe(exactText);
  });

  it('deve retornar string vazia para null', () => {
    expect(truncateText(null, 50)).toBe('');
  });

  it('deve retornar string vazia para undefined', () => {
    expect(truncateText(undefined, 50)).toBe('');
  });

  it('deve retornar string vazia para input vazio', () => {
    expect(truncateText('', 50)).toBe('');
  });
});
