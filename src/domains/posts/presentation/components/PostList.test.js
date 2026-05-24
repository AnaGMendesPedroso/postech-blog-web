import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../../shared/test-utils';
import PostList from './PostList';

const mockPosts = [
  {
    id: '1',
    titulo: 'Primeiro Post',
    conteudo: 'Conteúdo do primeiro post para teste',
    autor: 'Professor A',
    createdAt: '2024-06-15T10:00:00.000Z',
  },
  {
    id: '2',
    titulo: 'Segundo Post',
    conteudo: 'Conteúdo do segundo post para teste',
    autor: 'Professor B',
    createdAt: '2024-06-16T10:00:00.000Z',
  },
];

describe('PostList', () => {
  describe('dado lista com posts', () => {
    it('deve renderizar um PostCard para cada post', () => {
      renderWithProviders(<PostList posts={mockPosts} />);

      expect(screen.getByTestId('post-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('post-card-2')).toBeInTheDocument();
    });

    it('deve exibir títulos de todos os posts', () => {
      renderWithProviders(<PostList posts={mockPosts} />);

      expect(screen.getByTestId('post-card-title-1')).toHaveTextContent('Primeiro Post');
      expect(screen.getByTestId('post-card-title-2')).toHaveTextContent('Segundo Post');
    });

    it('não deve exibir mensagem de lista vazia', () => {
      renderWithProviders(<PostList posts={mockPosts} />);

      expect(screen.queryByTestId('post-list-empty')).not.toBeInTheDocument();
    });
  });

  describe('dado lista vazia', () => {
    it('deve exibir mensagem "Nenhum post encontrado"', () => {
      renderWithProviders(<PostList posts={[]} />);

      const emptyMessage = screen.getByTestId('post-list-empty');
      expect(emptyMessage).toBeInTheDocument();
      expect(emptyMessage).toHaveTextContent('Nenhum post encontrado');
    });

    it('não deve renderizar nenhum PostCard', () => {
      renderWithProviders(<PostList posts={[]} />);

      expect(screen.queryByTestId(/^post-card-/)).not.toBeInTheDocument();
    });
  });
});
