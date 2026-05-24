import { useState, useEffect } from 'react';

function usePost({ getPostUseCase, id }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || (typeof id === 'string' && id.trim().length === 0)) {
      setError('ID é obrigatório');
      setPost(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchPost() {
      setLoading(true);
      setError(null);

      try {
        const result = await getPostUseCase.execute({ id });
        if (!cancelled) {
          setPost(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setPost(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPost();

    return () => {
      cancelled = true;
    };
  }, [id, getPostUseCase]);

  return { post, loading, error };
}

export default usePost;
