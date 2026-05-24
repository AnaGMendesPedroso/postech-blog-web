import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PostApiRepository from '../../infrastructure/repositories/PostApiRepository';
import CreatePost from '../../application/usecases/CreatePost';
import CreatePostDTO from '../../application/dto/CreatePostDTO';
import PostForm from '../components/PostForm';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.sm};
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

function CreatePostPage() {
  const navigate = useNavigate();

  const repository = useMemo(() => new PostApiRepository(), []);
  const createPostUseCase = useMemo(() => new CreatePost(repository), [repository]);

  const handleCreate = useCallback(async (formData) => {
    const dto = new CreatePostDTO(formData);
    await createPostUseCase.execute(dto);
    navigate('/admin');
  }, [createPostUseCase, navigate]);

  return (
    <Container data-testid="create-post-page">
      <Title data-testid="create-post-title">Criar Post</Title>
      <PostForm
        onSubmit={handleCreate}
        submitLabel="Criar Post"
      />
    </Container>
  );
}

export default CreatePostPage;
