import styled from 'styled-components';
import PostCard from './PostCard';

const Grid = styled.section`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

function PostList({ posts }) {
  if (posts.length === 0) {
    return (
      <EmptyMessage data-testid="post-list-empty">
        Nenhum post encontrado
      </EmptyMessage>
    );
  }

  return (
    <Grid data-testid="post-list">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          id={post.id}
          titulo={post.titulo}
          conteudo={post.conteudo}
          autor={post.autor}
          createdAt={post.createdAt}
        />
      ))}
    </Grid>
  );
}

export default PostList;
