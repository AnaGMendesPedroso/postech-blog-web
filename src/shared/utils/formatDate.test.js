import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('deve formatar data ISO válida para formato pt-BR', () => {
    const result = formatDate('2026-05-22T10:30:00.000Z');
    expect(result).toMatch(/22.*mai.*2026/);
  });

  it('deve formatar outra data ISO válida corretamente', () => {
    const result = formatDate('2024-01-15T08:00:00.000Z');
    expect(result).toMatch(/15.*jan.*2024/);
  });

  it('deve retornar string não-vazia para data válida', () => {
    const result = formatDate('2024-06-01T00:00:00.000Z');
    expect(result.length).toBeGreaterThan(0);
  });

  it('deve retornar string vazia para null', () => {
    expect(formatDate(null)).toBe('');
  });

  it('deve retornar string vazia para undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('deve retornar string vazia para string inválida (NaN date)', () => {
    expect(formatDate('invalid')).toBe('');
  });

  it('deve retornar string vazia para string vazia', () => {
    expect(formatDate('')).toBe('');
  });

  it('deve retornar string vazia para valor 0 (falsy)', () => {
    expect(formatDate(0)).toBe('');
  });

  it('deve retornar string vazia para false (falsy)', () => {
    expect(formatDate(false)).toBe('');
  });

  it('deve retornar string vazia quando formatação lança erro (catch branch)', () => {
    const spy = jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => {
      throw new Error('format error');
    });

    expect(formatDate('2024-01-01T00:00:00.000Z')).toBe('');

    spy.mockRestore();
  });
});
