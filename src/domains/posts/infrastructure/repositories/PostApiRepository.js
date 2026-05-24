import PostRepository from '../../domain/repositories/PostRepository';
import httpClient from '../../../../shared/infrastructure/http/httpClient';

class PostApiRepository extends PostRepository {
  async findAll(page = 1, limit = 10, status) {
    try {
      const params = { page, limit };
      if (status) params.status = status;

      const response = await httpClient.get('/posts', { params });
      return {
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      throw new Error(this._extractErrorMessage(error));
    }
  }

  async search(query, page = 1, limit = 10) {
    try {
      const params = { q: query, page, limit };
      const response = await httpClient.get('/posts/search', { params });
      return {
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      throw new Error(this._extractErrorMessage(error));
    }
  }

  async findById(id) {
    try {
      const response = await httpClient.get(`/posts/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(this._extractErrorMessage(error));
    }
  }

  async create(postData) {
    try {
      const response = await httpClient.post('/posts', postData);
      return response.data.data;
    } catch (error) {
      throw new Error(this._extractErrorMessage(error));
    }
  }

  async update(id, postData) {
    try {
      const response = await httpClient.put(`/posts/${id}`, postData);
      return response.data.data;
    } catch (error) {
      throw new Error(this._extractErrorMessage(error));
    }
  }

  async delete(id) {
    try {
      await httpClient.delete(`/posts/${id}`);
    } catch (error) {
      throw new Error(this._extractErrorMessage(error));
    }
  }

  _extractErrorMessage(error) {
    if (error.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
    if (error.response) {
      return 'Erro ao comunicar com a API';
    }
    if (error.request) {
      return 'Erro de conexão. Verifique sua rede.';
    }
    return 'Erro inesperado';
  }
}

export default PostApiRepository;
