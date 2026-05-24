import { useState, useCallback } from 'react';

function usePosts({ listPostsUseCase, searchPostsUseCase, limit = 10 }) {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuery, setCurrentQuery] = useState(null);

  const loadPosts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const result = await listPostsUseCase.execute({ page, limit, status: 'published' });
      setPosts(result.data);
      setPagination({
        page: result.pagination.page,
        totalPages: result.pagination.totalPages,
        total: result.pagination.total,
      });
      setCurrentQuery(null);
    } catch (err) {
      setError(err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [listPostsUseCase, limit]);

  const searchPosts = useCallback(async (query, page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const result = await searchPostsUseCase.execute({ query, page, limit });
      setPosts(result.data);
      setPagination({
        page: result.pagination.page,
        totalPages: result.pagination.totalPages,
        total: result.pagination.total,
      });
      setCurrentQuery(query);
    } catch (err) {
      setError(err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [searchPostsUseCase, limit]);

  const clearSearch = useCallback(() => {
    setCurrentQuery(null);
    loadPosts(1);
  }, [loadPosts]);

  return {
    posts,
    pagination,
    loading,
    error,
    currentQuery,
    loadPosts,
    searchPosts,
    clearSearch,
  };
}

export default usePosts;
