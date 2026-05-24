import styled from 'styled-components';
import usePostForm from '../hooks/usePostForm';
import ErrorMessage from '../../../../shared/components/ErrorMessage';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  max-width: 720px;
  width: 100%;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme, $hasError }) => $hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) => $hasError ? theme.colors.error : theme.colors.primary};
  }
`;

const Textarea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme, $hasError }) => $hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  resize: vertical;
  min-height: 200px;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) => $hasError ? theme.colors.error : theme.colors.primary};
  }
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.surface};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const FieldError = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.error};
`;

const SubmitButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  align-self: flex-start;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

function PostForm({ initialData, onSubmit, submitLabel = 'Criar Post', loading: externalLoading }) {
  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    apiError,
  } = usePostForm({ initialData, onSubmit });

  const isLoading = loading || externalLoading;

  const onFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <Form data-testid="form-post" onSubmit={onFormSubmit}>
      {apiError && (
        <div data-testid="form-error-message">
          <ErrorMessage message={apiError} />
        </div>
      )}

      <FieldGroup>
        <Label htmlFor="form-titulo">Título</Label>
        <Input
          id="form-titulo"
          data-testid="form-input-titulo"
          type="text"
          placeholder="Título do post"
          value={formData.titulo}
          onChange={(e) => handleChange('titulo', e.target.value)}
          aria-invalid={!!errors.titulo}
          aria-describedby={errors.titulo ? 'error-titulo' : undefined}
          $hasError={!!errors.titulo}
        />
        {errors.titulo && (
          <FieldError id="error-titulo" data-testid="form-error-titulo">
            {errors.titulo}
          </FieldError>
        )}
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="form-conteudo">Conteúdo</Label>
        <Textarea
          id="form-conteudo"
          data-testid="form-input-conteudo"
          placeholder="Conteúdo do post"
          rows={10}
          value={formData.conteudo}
          onChange={(e) => handleChange('conteudo', e.target.value)}
          aria-invalid={!!errors.conteudo}
          aria-describedby={errors.conteudo ? 'error-conteudo' : undefined}
          $hasError={!!errors.conteudo}
        />
        {errors.conteudo && (
          <FieldError id="error-conteudo" data-testid="form-error-conteudo">
            {errors.conteudo}
          </FieldError>
        )}
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="form-autor">Autor</Label>
        <Input
          id="form-autor"
          data-testid="form-input-autor"
          type="text"
          placeholder="Nome do autor"
          value={formData.autor}
          onChange={(e) => handleChange('autor', e.target.value)}
          aria-invalid={!!errors.autor}
          aria-describedby={errors.autor ? 'error-autor' : undefined}
          $hasError={!!errors.autor}
        />
        {errors.autor && (
          <FieldError id="error-autor" data-testid="form-error-autor">
            {errors.autor}
          </FieldError>
        )}
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="form-status">Status</Label>
        <Select
          id="form-status"
          data-testid="form-select-status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <option value="draft">Rascunho</option>
          <option value="published">Publicado</option>
        </Select>
      </FieldGroup>

      <SubmitButton
        type="submit"
        data-testid="form-btn-submit"
        disabled={isLoading}
      >
        {isLoading ? 'Enviando...' : submitLabel}
      </SubmitButton>
    </Form>
  );
}

export default PostForm;
