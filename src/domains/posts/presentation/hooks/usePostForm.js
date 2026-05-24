import { useState, useCallback, useMemo } from 'react';

const DEFAULT_FORM_DATA = {
  titulo: '',
  conteudo: '',
  autor: '',
  status: 'draft',
};

function validate(formData) {
  const errors = {};
  const titulo = formData.titulo.trim();
  const conteudo = formData.conteudo.trim();
  const autor = formData.autor.trim();

  if (!titulo) {
    errors.titulo = 'O título é obrigatório';
  } else if (titulo.length < 3) {
    errors.titulo = 'O título deve ter no mínimo 3 caracteres';
  } else if (titulo.length > 200) {
    errors.titulo = 'O título deve ter no máximo 200 caracteres';
  }

  if (!conteudo) {
    errors.conteudo = 'O conteúdo é obrigatório';
  } else if (conteudo.length < 10) {
    errors.conteudo = 'O conteúdo deve ter no mínimo 10 caracteres';
  }

  if (!autor) {
    errors.autor = 'O autor é obrigatório';
  }

  return errors;
}

function usePostForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState(() => ({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  }));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setApiError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    const validationErrors = validate(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, [formData, onSubmit]);

  const isValid = useMemo(() => {
    const titulo = formData.titulo.trim();
    const conteudo = formData.conteudo.trim();
    const autor = formData.autor.trim();

    return titulo.length >= 3 && titulo.length <= 200 &&
      conteudo.length >= 10 &&
      autor.length > 0 &&
      Object.keys(errors).length === 0;
  }, [formData, errors]);

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    isValid,
    apiError,
  };
}

export default usePostForm;
