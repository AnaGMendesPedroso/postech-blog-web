import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PostApiRepository from '../../infrastructure/repositories/PostApiRepository';
import GetPost from '../../application/usecases/GetPost';
import usePost from '../hooks/usePost';
import Loading from '../../../../shared/components/Loading';
import ErrorMessage from '../../../../shared/components/ErrorMessage';
import { formatDate } from '../../../../shared/utils/formatDate';

const Container = styled.article`
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
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: 1.3;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Author = styled.span``;

const Separator = styled.span`
  &::before {
    content: '·';
  }
`;

const DateDisplay = styled.time``;

const Content = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.8;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const repository = useMemo(() => new PostApiRepository(), []);
  const getPostUseCase = useMemo(() => new GetPost(repository), [repository]);

  const { post, loading, error } = usePost({ getPostUseCase, id });

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Container data-testid="post-detail-page">
      <BackButton data-testid="post-btn-back" onClick={handleBack}>
        ← Voltar
      </BackButton>

      {loading && <Loading text="Carregando post..." />}

      {error && !loading && <ErrorMessage message={error} />}

      {!loading && !error && post && (
        <>
          <Title data-testid="post-title">{post.titulo}</Title>
          <Meta>
            <Author data-testid="post-author">{post.autor}</Author>
            <Separator />
            <DateDisplay
              data-testid="post-date"
              dateTime={post.createdAt}
            >
              {formatDate(post.createdAt)}
            </DateDisplay>
          </Meta>
          <Content data-testid="post-content">{post.conteudo}</Content>
        </>
      )}
    </Container>
  );
}

export default PostDetail;
