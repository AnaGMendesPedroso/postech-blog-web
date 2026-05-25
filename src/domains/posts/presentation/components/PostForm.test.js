import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../../shared/test-utils';
import PostForm from './PostForm';

describe('PostForm', () => {
  const defaultProps = {
    onSubmit: jest.fn().mockResolvedValue(undefined),
  };

  function renderPostForm(props = {}) {
    return renderWithProviders(<PostForm {...defaultProps} {...props} />);
  }

  describe('renderização inicial', () => {
    it('deve renderizar todos os campos do formulário', () => {
      renderPostForm();

      expect(screen.getByTestId('form-post')).toBeInTheDocument();
      expect(screen.getByTestId('form-input-titulo')).toBeInTheDocument();
      expect(screen.getByTestId('form-input-conteudo')).toBeInTheDocument();
      expect(screen.getByTestId('form-input-autor')).toBeInTheDocument();
      expect(screen.getByTestId('form-select-status')).toBeInTheDocument();
      expect(screen.getByTestId('form-btn-submit')).toBeInTheDocument();
    });

    it('deve renderizar botão com label customizada', () => {
      renderPostForm({ submitLabel: 'Salvar Alterações' });

      expect(screen.getByTestId('form-btn-submit')).toHaveTextContent('Salvar Alterações');
    });

    it('deve renderizar botão com label padrão "Criar Post"', () => {
      renderPostForm();

      expect(screen.getByTestId('form-btn-submit')).toHaveTextContent('Criar Post');
    });

    it('deve preencher campos com initialData quando fornecido', () => {
      const initialData = {
        titulo: 'Título existente',
        conteudo: 'Conteúdo existente',
        autor: 'Autor existente',
        status: 'published',
      };
      renderPostForm({ initialData });

      expect(screen.getByTestId('form-input-titulo')).toHaveValue('Título existente');
      expect(screen.getByTestId('form-input-conteudo')).toHaveValue('Conteúdo existente');
      expect(screen.getByTestId('form-input-autor')).toHaveValue('Autor existente');
      expect(screen.getByTestId('form-select-status')).toHaveValue('published');
    });

    it('deve ter status "draft" selecionado por padrão', () => {
      renderPostForm();

      expect(screen.getByTestId('form-select-status')).toHaveValue('draft');
    });
  });

  describe('interação do usuário', () => {
    it('deve permitir digitar no campo título', async () => {
      const user = userEvent.setup();
      renderPostForm();

      const input = screen.getByTestId('form-input-titulo');
      await user.type(input, 'Meu novo post');

      expect(input).toHaveValue('Meu novo post');
    });

    it('deve permitir digitar no campo conteúdo', async () => {
      const user = userEvent.setup();
      renderPostForm();

      const textarea = screen.getByTestId('form-input-conteudo');
      await user.type(textarea, 'Conteúdo do meu post');

      expect(textarea).toHaveValue('Conteúdo do meu post');
    });

    it('deve permitir digitar no campo autor', async () => {
      const user = userEvent.setup();
      renderPostForm();

      const input = screen.getByTestId('form-input-autor');
      await user.type(input, 'Professor João');

      expect(input).toHaveValue('Professor João');
    });

    it('deve permitir alterar o status', async () => {
      const user = userEvent.setup();
      renderPostForm();

      const select = screen.getByTestId('form-select-status');
      await user.selectOptions(select, 'published');

      expect(select).toHaveValue('published');
    });
  });

  describe('validação client-side', () => {
    describe('dado que o título tem menos de 3 caracteres', () => {
      it('deve exibir erro de validação em form-error-titulo', async () => {
        const user = userEvent.setup();
        renderPostForm();

        const tituloInput = screen.getByTestId('form-input-titulo');
        await user.type(tituloInput, 'ab');
        await user.type(screen.getByTestId('form-input-conteudo'), 'Conteúdo válido com mais de 10');
        await user.type(screen.getByTestId('form-input-autor'), 'Autor');
        await user.click(screen.getByTestId('form-btn-submit'));

        await waitFor(() => {
          expect(screen.getByTestId('form-error-titulo')).toHaveTextContent('O título deve ter no mínimo 3 caracteres');
        });
      });
    });

    describe('dado que o conteúdo tem menos de 10 caracteres', () => {
      it('deve exibir erro de validação em form-error-conteudo', async () => {
        const user = userEvent.setup();
        renderPostForm();

        await user.type(screen.getByTestId('form-input-titulo'), 'Título válido');
        await user.type(screen.getByTestId('form-input-conteudo'), '123456789');
        await user.type(screen.getByTestId('form-input-autor'), 'Autor');
        await user.click(screen.getByTestId('form-btn-submit'));

        await waitFor(() => {
          expect(screen.getByTestId('form-error-conteudo')).toHaveTextContent('O conteúdo deve ter no mínimo 10 caracteres');
        });
      });
    });

    describe('dado que o autor está vazio', () => {
      it('deve exibir erro de validação em form-error-autor', async () => {
        const user = userEvent.setup();
        renderPostForm();

        await user.type(screen.getByTestId('form-input-titulo'), 'Título válido');
        await user.type(screen.getByTestId('form-input-conteudo'), 'Conteúdo válido com mais de 10');
        await user.click(screen.getByTestId('form-btn-submit'));

        await waitFor(() => {
          expect(screen.getByTestId('form-error-autor')).toHaveTextContent('O autor é obrigatório');
        });
      });
    });
  });

  describe('submissão', () => {
    describe('dado dados válidos', () => {
      it('deve chamar onSubmit com os dados do formulário', async () => {
        const user = userEvent.setup();
        const onSubmit = jest.fn().mockResolvedValue(undefined);
        renderPostForm({ onSubmit });

        await user.type(screen.getByTestId('form-input-titulo'), 'Título válido para teste');
        await user.type(screen.getByTestId('form-input-conteudo'), 'Conteúdo válido com mais de 10 caracteres');
        await user.type(screen.getByTestId('form-input-autor'), 'Professor Teste');
        await user.click(screen.getByTestId('form-btn-submit'));

        await waitFor(() => {
          expect(onSubmit).toHaveBeenCalledWith({
            titulo: 'Título válido para teste',
            conteudo: 'Conteúdo válido com mais de 10 caracteres',
            autor: 'Professor Teste',
            status: 'draft',
          });
        });
      });
    });

    describe('enquanto está enviando', () => {
      it('deve desabilitar o botão de submit', async () => {
        const user = userEvent.setup();
        let resolveSubmit;
        const onSubmit = jest.fn().mockImplementation(() => new Promise((resolve) => { resolveSubmit = resolve; }));
        renderPostForm({ onSubmit });

        await user.type(screen.getByTestId('form-input-titulo'), 'Título válido para teste');
        await user.type(screen.getByTestId('form-input-conteudo'), 'Conteúdo válido com mais de 10 caracteres');
        await user.type(screen.getByTestId('form-input-autor'), 'Professor Teste');
        await user.click(screen.getByTestId('form-btn-submit'));

        await waitFor(() => {
          expect(screen.getByTestId('form-btn-submit')).toBeDisabled();
        });

        // Cleanup
        await act(async () => { resolveSubmit(); });
      });

      it('deve exibir texto "Enviando..." no botão', async () => {
        const user = userEvent.setup();
        let resolveSubmit;
        const onSubmit = jest.fn().mockImplementation(() => new Promise((resolve) => { resolveSubmit = resolve; }));
        renderPostForm({ onSubmit });

        await user.type(screen.getByTestId('form-input-titulo'), 'Título válido para teste');
        await user.type(screen.getByTestId('form-input-conteudo'), 'Conteúdo válido com mais de 10 caracteres');
        await user.type(screen.getByTestId('form-input-autor'), 'Professor Teste');
        await user.click(screen.getByTestId('form-btn-submit'));

        await waitFor(() => {
          expect(screen.getByTestId('form-btn-submit')).toHaveTextContent('Enviando...');
        });

        // Cleanup
        await act(async () => { resolveSubmit(); });
      });
    });
  });

  describe('erro de API', () => {
    it('deve exibir form-error-message quando onSubmit rejeita', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockRejectedValue(new Error('Erro ao comunicar com a API'));
      renderPostForm({ onSubmit });

      await user.type(screen.getByTestId('form-input-titulo'), 'Título válido para teste');
      await user.type(screen.getByTestId('form-input-conteudo'), 'Conteúdo válido com mais de 10 caracteres');
      await user.type(screen.getByTestId('form-input-autor'), 'Professor Teste');
      await user.click(screen.getByTestId('form-btn-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('form-error-message')).toBeInTheDocument();
      });
    });

    it('deve limpar erro ao editar qualquer campo', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockRejectedValue(new Error('Erro de API'));
      renderPostForm({ onSubmit });

      await user.type(screen.getByTestId('form-input-titulo'), 'Título válido para teste');
      await user.type(screen.getByTestId('form-input-conteudo'), 'Conteúdo válido com mais de 10 caracteres');
      await user.type(screen.getByTestId('form-input-autor'), 'Professor Teste');
      await user.click(screen.getByTestId('form-btn-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('form-error-message')).toBeInTheDocument();
      });

      await user.type(screen.getByTestId('form-input-titulo'), 'x');

      await waitFor(() => {
        expect(screen.queryByTestId('form-error-message')).not.toBeInTheDocument();
      });
    });
  });

  describe('acessibilidade', () => {
    it('deve ter labels associados a todos os inputs', () => {
      renderPostForm();

      expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/conteúdo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/autor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    });

    it('deve marcar aria-invalid nos campos com erro', async () => {
      const user = userEvent.setup();
      renderPostForm();

      await user.click(screen.getByTestId('form-btn-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('form-input-titulo')).toHaveAttribute('aria-invalid', 'true');
      });
      await waitFor(() => {
        expect(screen.getByTestId('form-input-conteudo')).toHaveAttribute('aria-invalid', 'true');
      });
      await waitFor(() => {
        expect(screen.getByTestId('form-input-autor')).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
