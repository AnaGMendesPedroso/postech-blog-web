import { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import PostApiRepository from '../../infrastructure/repositories/PostApiRepository';
import ListPosts from '../../application/usecases/ListPosts';
import SearchPosts from '../../application/usecases/SearchPosts';
import usePosts from '../hooks/usePosts';
import PostList from '../components/PostList';
import SearchBar from '../components/SearchBar';
import Loading from '../../../../shared/components/Loading';
import ErrorMessage from '../../../../shared/components/ErrorMessage';
import Pagination from '../../../../shared/components/Pagination';

const Container = styled.main`
  max-width: ${({ theme }) => theme.breakpoints.desktop};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SearchWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

function Home() {
  const repository = useMemo(() => new PostApiRepository(), []);
  const listPostsUseCase = useMemo(() => new ListPosts(repository), [repository]);
  const searchPostsUseCase = useMemo(() => new SearchPosts(repository), [repository]);

  const {
    posts,
    pagination,
    loading,
    error,
    currentQuery,
    loadPosts,
    searchPosts,
    clearSearch,
  } = usePosts({ listPostsUseCase, searchPostsUseCase });

  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  const handleSearch = (query) => {
    searchPosts(query, 1);
  };

  const handlePageChange = (newPage) => {
    if (currentQuery) {
      searchPosts(currentQuery, newPage);
    } else {
      loadPosts(newPage);
    }
  };

  return (
    <Container data-testid="home-page">
      <Title data-testid="home-title">Posts Recentes</Title>

      <SearchWrapper>
        <SearchBar
          onSearch={handleSearch}
          onClear={clearSearch}
        />
      </SearchWrapper>

      {loading && <Loading text="Carregando posts..." />}

      {error && !loading && <ErrorMessage message={error} />}

      {!loading && !error && <PostList posts={posts} />}

      {!loading && !error && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </Container>
  );
}

export default Home;
