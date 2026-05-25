import { renderHook, act } from '@testing-library/react';
import usePostForm from './usePostForm';

describe('usePostForm', () => {
  const validFormData = {
    titulo: 'Título válido para teste',
    conteudo: 'Conteúdo válido com mais de 10 caracteres',
    autor: 'Professor Teste',
    status: 'draft',
  };

  function fillValidData(result) {
    act(() => {
      result.current.handleChange('titulo', validFormData.titulo);
      result.current.handleChange('conteudo', validFormData.conteudo);
      result.current.handleChange('autor', validFormData.autor);
    });
  }

  describe('estado inicial', () => {
    it('deve inicializar com valores padrão quando não recebe initialData', () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() => usePostForm({ onSubmit }));

      expect(result.current.formData).toEqual({
        titulo: '',
        conteudo: '',
        autor: '',
        status: 'draft',
      });
      expect(result.current.errors).toEqual({});
      expect(result.current.loading).toBe(false);
      expect(result.current.apiError).toBeNull();
    });

    it('deve mesclar initialData com valores padrão', () => {
      const onSubmit = jest.fn();
      const initialData = { titulo: 'Meu Título', autor: 'Autor X' };
      const { result } = renderHook(() => usePostForm({ initialData, onSubmit }));

      expect(result.current.formData).toEqual({
        titulo: 'Meu Título',
        conteudo: '',
        autor: 'Autor X',
        status: 'draft',
      });
    });

    it('deve ter isValid=false com campos vazios', () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() => usePostForm({ onSubmit }));

      expect(result.current.isValid).toBe(false);
    });

    it('deve ter isValid=true quando todos os campos obrigatórios estão preenchidos', () => {
      const onSubmit = jest.fn();
      const initialData = { titulo: 'Título OK', conteudo: 'Conteúdo com mais de 10', autor: 'Autor' };
      const { result } = renderHook(() => usePostForm({ initialData, onSubmit }));

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('handleChange', () => {
    it('deve atualizar o campo especificado', () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() => usePostForm({ onSubmit }));

      act(() => {
        result.current.handleChange('titulo', 'Novo título');
      });

      expect(result.current.formData.titulo).toBe('Novo título');
    });

    it('deve limpar o erro do campo ao alterar seu valor', async () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() => usePostForm({ onSubmit }));

      // Trigger validation error
      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.titulo).toBeDefined();

      // Clear error by changing field
      act(() => {
        result.current.handleChange('titulo', 'Novo valor');
      });

      expect(result.current.errors.titulo).toBeUndefined();
    });

    it('deve limpar apiError ao alterar qualquer campo', async () => {
      const onSubmit = jest.fn().mockRejectedValue(new Error('Erro de API'));
      const initialData = validFormData;
      const { result } = renderHook(() => usePostForm({ initialData, onSubmit }));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.apiError).toBe('Erro de API');

      act(() => {
        result.current.handleChange('titulo', 'Outro título');
      });

      expect(result.current.apiError).toBeNull();
    });
  });

  describe('validação no submit', () => {
    it('deve setar erro quando título está vazio', async () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() => usePostForm({ onSubmit }));

      act(() => {
        result.current.handleChange('conteudo', 'Conteúdo com mais de 10 caracteres');
        result.current.handleChange('autor', 'Autor');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.titulo).toBe('O título é obrigatório');
    });

    it('deve setar erro quando título tem menos de 3 caracteres', async () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() => usePostForm({ onSubmit }));

      act(() => {
        result.current.handleChange('titulo', 'ab');
        result.current.handleChange('conteudo', 'Conteúdo com mais de 10 caracteres');
        result.current.handleChange('autor', 'Autor');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.titulo).toBe('O título deve ter no mínimo 3 caracteres');
    });

    it('deve setar erro quando título tem mais de 200 caracteres', async () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() => usePostForm({ onSubmit }));

      act(() => {
        result.current.handleChange('titulo', 'a'.repeat(201));
        result.current.handleChange('conteudo', 'Conteúdo com mais de 10 caracteres');
        result.current.handleChange('autor', 'Autor');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.titulo).toBe('O título deve ter no máximo 200 caracteres');
    });

    it('deve setar erro quando conteúdo está vazio', async () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() => usePostForm({ onSubmit }));

      act(() => {
        result.current.handleChange('titulo', 'Título válido');
        result.current.handleChange('autor', 'Autor');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.conteudo).toBe('O conteúdo é obrigatório');
    });

    it('deve setar erro quando conteúdo tem menos de 10 caracteres', async () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() => usePostForm({ onSubmit }));

      act(() => {
        result.current.handleChange('titulo', 'Título válido');
        result.current.handleChange('conteudo', '123456789');
        result.current.handleChange('autor', 'Autor');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.conteudo).toBe('O conteúdo deve ter no mínimo 10 caracteres');
    });

    it('deve setar erro quando autor está vazio', async () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() => usePostForm({ onSubmit }));

      act(() => {
        result.current.handleChange('titulo', 'Título válido');
        result.current.handleChange('conteudo', 'Conteúdo com mais de 10 caracteres');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.autor).toBe('O autor é obrigatório');
    });

    it('deve setar erro quando autor contém apenas espaços', async () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() => usePostForm({ onSubmit }));

      act(() => {
        result.current.handleChange('titulo', 'Título válido');
        result.current.handleChange('conteudo', 'Conteúdo com mais de 10 caracteres');
        result.current.handleChange('autor', '   ');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.autor).toBe('O autor é obrigatório');
    });

    it('deve setar múltiplos erros simultaneamente quando vários campos são inválidos', async () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() => usePostForm({ onSubmit }));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.titulo).toBeDefined();
      expect(result.current.errors.conteudo).toBeDefined();
      expect(result.current.errors.autor).toBeDefined();
    });

    it('não deve chamar onSubmit quando validação falha', async () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() => usePostForm({ onSubmit }));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('deve aceitar título com exatamente 3 caracteres', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => usePostForm({ onSubmit }));

      act(() => {
        result.current.handleChange('titulo', 'abc');
        result.current.handleChange('conteudo', 'Conteúdo com mais de 10 caracteres');
        result.current.handleChange('autor', 'Autor');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.titulo).toBeUndefined();
      expect(onSubmit).toHaveBeenCalled();
    });

    it('deve aceitar título com exatamente 200 caracteres', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => usePostForm({ onSubmit }));

      act(() => {
        result.current.handleChange('titulo', 'a'.repeat(200));
        result.current.handleChange('conteudo', 'Conteúdo com mais de 10 caracteres');
        result.current.handleChange('autor', 'Autor');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.titulo).toBeUndefined();
      expect(onSubmit).toHaveBeenCalled();
    });

    it('deve aceitar conteúdo com exatamente 10 caracteres', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => usePostForm({ onSubmit }));

      act(() => {
        result.current.handleChange('titulo', 'Título válido');
        result.current.handleChange('conteudo', '1234567890');
        result.current.handleChange('autor', 'Autor');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.conteudo).toBeUndefined();
      expect(onSubmit).toHaveBeenCalled();
    });

    it('deve tratar título com apenas espaços como vazio', async () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() => usePostForm({ onSubmit }));

      act(() => {
        result.current.handleChange('titulo', '   ');
        result.current.handleChange('conteudo', 'Conteúdo com mais de 10 caracteres');
        result.current.handleChange('autor', 'Autor');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.titulo).toBe('O título é obrigatório');
    });
  });

  describe('submit com sucesso', () => {
    it('deve setar loading=true durante a execução', async () => {
      let resolveSubmit;
      const onSubmit = jest.fn().mockImplementation(() => new Promise((resolve) => { resolveSubmit = resolve; }));
      const initialData = validFormData;
      const { result } = renderHook(() => usePostForm({ initialData, onSubmit }));

      let submitPromise;
      act(() => {
        submitPromise = result.current.handleSubmit();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolveSubmit();
        await submitPromise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('deve chamar onSubmit com formData quando válido', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => usePostForm({ onSubmit }));

      fillValidData(result);

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).toHaveBeenCalledWith(validFormData);
    });

    it('deve setar loading=false após sucesso', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const initialData = validFormData;
      const { result } = renderHook(() => usePostForm({ initialData, onSubmit }));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('submit com erro da API', () => {
    it('deve capturar mensagem de erro em apiError', async () => {
      const onSubmit = jest.fn().mockRejectedValue(new Error('Erro ao comunicar com a API'));
      const initialData = validFormData;
      const { result } = renderHook(() => usePostForm({ initialData, onSubmit }));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.apiError).toBe('Erro ao comunicar com a API');
    });

    it('deve setar loading=false após erro', async () => {
      const onSubmit = jest.fn().mockRejectedValue(new Error('Network Error'));
      const initialData = validFormData;
      const { result } = renderHook(() => usePostForm({ initialData, onSubmit }));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.loading).toBe(false);
    });

    it('não deve limpar o formData após erro', async () => {
      const onSubmit = jest.fn().mockRejectedValue(new Error('Erro'));
      const initialData = validFormData;
      const { result } = renderHook(() => usePostForm({ initialData, onSubmit }));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.formData).toEqual(validFormData);
    });

    it('deve limpar apiError ao iniciar novo submit', async () => {
      const onSubmit = jest.fn()
        .mockRejectedValueOnce(new Error('Primeiro erro'))
        .mockResolvedValueOnce(undefined);
      const initialData = validFormData;
      const { result } = renderHook(() => usePostForm({ initialData, onSubmit }));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.apiError).toBe('Primeiro erro');

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.apiError).toBeNull();
    });
  });
});
