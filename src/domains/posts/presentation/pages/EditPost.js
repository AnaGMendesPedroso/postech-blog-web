import { useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PostApiRepository from '../../infrastructure/repositories/PostApiRepository';
import GetPost from '../../application/usecases/GetPost';
import UpdatePost from '../../application/usecases/UpdatePost';
import UpdatePostDTO from '../../application/dto/UpdatePostDTO';
import usePost from '../hooks/usePost';
import PostForm from '../components/PostForm';
import Loading from '../../../../shared/components/Loading';
import ErrorMessage from '../../../../shared/components/ErrorMessage';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    text-decoration: underline;
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`;

function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const repository = useMemo(() => new PostApiRepository(), []);
  const getPostUseCase = useMemo(() => new GetPost(repository), [repository]);
  const updatePostUseCase = useMemo(() => new UpdatePost(repository), [repository]);

  const { post, loading, error } = usePost({ getPostUseCase, id });

  const handleUpdate = useCallback(async (formData) => {
    const dto = new UpdatePostDTO(formData);
    await updatePostUseCase.execute({ id, data: dto });
    navigate('/admin');
  }, [updatePostUseCase, id, navigate]);

  return (
    <Container data-testid="edit-post-page">
      <BackButton data-testid="edit-post-btn-back" onClick={() => navigate('/admin')}>
        ← Voltar
      </BackButton>
      <Title data-testid="edit-post-title">Editar Post</Title>

      {loading && (
        <div data-testid="edit-post-loading">
          <Loading text="Carregando post..." />
        </div>
      )}

      {error && !loading && (
        <div data-testid="edit-post-error">
          <ErrorMessage message={error} />
        </div>
      )}

      {post && !loading && (
        <PostForm
          initialData={post}
          onSubmit={handleUpdate}
          submitLabel="Salvar Alterações"
        />
      )}
    </Container>
  );
}

export default EditPostPage;
