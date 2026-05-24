import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams, useNavigate } from 'react-router-dom';
import { renderWithProviders } from '../../../../shared/test-utils';
import PostDetail from './PostDetail';
import PostApiRepository from '../../infrastructure/repositories/PostApiRepository';

jest.mock('../../infrastructure/repositories/PostApiRepository');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

const mockPost = {
  id: '1',
  titulo: 'Post sobre React Hooks',
  conteudo: 'Conteúdo completo e detalhado sobre React Hooks, incluindo useState, useEffect, useContext e hooks customizados.',
  autor: 'Professor A',
  status: 'published',
  createdAt: '2024-06-15T10:00:00.000Z',
  updatedAt: '2024-06-15T10:00:00.000Z',
};

function setupMocks(overrides = {}) {
  const mockFindById = overrides.findById || jest.fn().mockResolvedValue(mockPost);

  PostApiRepository.mockImplementation(() => ({
    findAll: jest.fn(),
    search: jest.fn(),
    findById: mockFindById,
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }));

  return { mockFindById };
}

describe('PostDetail Page', () => {
  let mockNavigate;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    useParams.mockReturnValue({ id: '1' });
  });

  describe('dado um post existente', () => {
    it('deve exibir o título do post', async () => {
      // Given
      setupMocks();

      // When
      renderWithProviders(<PostDetail />);

      // Then
      expect(await screen.findByTestId('post-title')).toHaveTextContent('Post sobre React Hooks');
    });

    it('deve exibir o conteúdo completo sem truncamento', async () => {
      // Given
      setupMocks();

      // When
      renderWithProviders(<PostDetail />);

      // Then
      const content = await screen.findByTestId('post-content');
      expect(content).toHaveTextContent('Conteúdo completo e detalhado sobre React Hooks, incluindo useState, useEffect, useContext e hooks customizados.');
    });

    it('deve exibir o nome do autor', async () => {
      // Given
      setupMocks();

      // When
      renderWithProviders(<PostDetail />);

      // Then
      expect(await screen.findByTestId('post-author')).toHaveTextContent('Professor A');
    });

    it('deve exibir a data formatada no padrão pt-BR', async () => {
      // Given
      setupMocks();

      // When
      renderWithProviders(<PostDetail />);

      // Then
      const dateEl = await screen.findByTestId('post-date');
      expect(dateEl).toHaveTextContent('15 de jun. de 2024');
    });

    it('deve renderizar o container com data-testid="post-detail-page"', async () => {
      // Given
      setupMocks();

      // When
      renderWithProviders(<PostDetail />);

      // Then
      expect(await screen.findByTestId('post-detail-page')).toBeInTheDocument();
    });
  });

  describe('dado um post inexistente (use case lança "Post não encontrado")', () => {
    it('deve exibir o componente ErrorMessage com "Post não encontrado"', async () => {
      // Given
      setupMocks({
        findById: jest.fn().mockResolvedValue(null),
      });

      // When
      renderWithProviders(<PostDetail />);

      // Then
      expect(await screen.findByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message-text')).toHaveTextContent('Post não encontrado');
    });

    it('não deve exibir o título do post', async () => {
      // Given
      setupMocks({
        findById: jest.fn().mockResolvedValue(null),
      });

      // When
      renderWithProviders(<PostDetail />);

      // Then
      await screen.findByTestId('error-message');
      expect(screen.queryByTestId('post-title')).not.toBeInTheDocument();
    });

    it('deve manter o botão "Voltar" visível', async () => {
      // Given
      setupMocks({
        findById: jest.fn().mockResolvedValue(null),
      });

      // When
      renderWithProviders(<PostDetail />);

      // Then
      await screen.findByTestId('error-message');
      expect(screen.getByTestId('post-btn-back')).toBeInTheDocument();
    });
  });

  describe('quando ocorre erro genérico na API (rede, 500, etc)', () => {
    it('deve exibir o componente ErrorMessage com a mensagem do erro', async () => {
      // Given
      setupMocks({
        findById: jest.fn().mockRejectedValue(new Error('Erro de conexão. Verifique sua rede.')),
      });

      // When
      renderWithProviders(<PostDetail />);

      // Then
      expect(await screen.findByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message-text')).toHaveTextContent('Erro de conexão. Verifique sua rede.');
    });

    it('não deve exibir conteúdo de post', async () => {
      // Given
      setupMocks({
        findById: jest.fn().mockRejectedValue(new Error('Erro de rede')),
      });

      // When
      renderWithProviders(<PostDetail />);

      // Then
      await screen.findByTestId('error-message');
      expect(screen.queryByTestId('post-title')).not.toBeInTheDocument();
      expect(screen.queryByTestId('post-content')).not.toBeInTheDocument();
    });
  });

  describe('quando está carregando', () => {
    it('deve exibir o componente Loading (loading-spinner)', () => {
      // Given
      setupMocks({
        findById: jest.fn().mockReturnValue(new Promise(() => {})),
      });

      // When
      renderWithProviders(<PostDetail />);

      // Then
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('não deve exibir conteúdo de post enquanto carrega', () => {
      // Given
      setupMocks({
        findById: jest.fn().mockReturnValue(new Promise(() => {})),
      });

      // When
      renderWithProviders(<PostDetail />);

      // Then
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('post-title')).not.toBeInTheDocument();
      expect(screen.queryByTestId('post-content')).not.toBeInTheDocument();
    });

    it('deve remover o spinner após a carga completar', async () => {
      // Given
      setupMocks();

      // When
      renderWithProviders(<PostDetail />);

      // Then
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
      expect(screen.getByTestId('post-title')).toBeInTheDocument();
    });
  });

  describe('quando o usuário clica em "Voltar"', () => {
    it('deve chamar navigate("/") para retornar à home', async () => {
      // Given
      const user = userEvent.setup();
      setupMocks();
      renderWithProviders(<PostDetail />);

      await screen.findByTestId('post-title');

      // When
      await user.click(screen.getByTestId('post-btn-back'));

      // Then
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
