import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../../shared/test-utils';
import PostCard from './PostCard';

const mockPost = {
  id: '1',
  titulo: 'Introdução ao React',
  conteudo: 'React é uma biblioteca JavaScript para construção de interfaces de usuário. Criada pelo Facebook, ela permite criar componentes reutilizáveis que gerenciam seu próprio estado.',
  autor: 'Professor Silva',
  createdAt: '2024-06-15T10:00:00.000Z',
};

describe('PostCard', () => {
  describe('dado dados válidos de um post', () => {
    it('deve renderizar título do post', () => {
      renderWithProviders(<PostCard {...mockPost} />);

      expect(screen.getByTestId('post-card-title-1')).toHaveTextContent('Introdução ao React');
    });

    it('deve renderizar nome do autor', () => {
      renderWithProviders(<PostCard {...mockPost} />);

      expect(screen.getByTestId('post-card-author-1')).toHaveTextContent('Professor Silva');
    });

    it('deve renderizar data formatada', () => {
      renderWithProviders(<PostCard {...mockPost} />);

      const dateElement = screen.getByTestId('post-card-date-1');
      expect(dateElement).toBeInTheDocument();
      expect(dateElement).toHaveAttribute('datetime', '2024-06-15T10:00:00.000Z');
    });

    it('deve renderizar conteúdo truncado em 150 caracteres', () => {
      renderWithProviders(<PostCard {...mockPost} />);

      const excerpt = screen.getByTestId('post-card-excerpt-1');
      expect(excerpt.textContent.length).toBeLessThanOrEqual(153); // 150 + "..."
    });

    it('deve ter link que navegaria para /posts/{id}', () => {
      renderWithProviders(<PostCard {...mockPost} />);

      const link = screen.getByTestId('post-card-1').closest('a');
      expect(link).toHaveAttribute('href', '/posts/1');
    });
  });

  describe('dado conteúdo longo', () => {
    it('deve truncar e exibir "..." ao final', () => {
      const longContent = 'A'.repeat(200);
      renderWithProviders(<PostCard {...mockPost} conteudo={longContent} />);

      const excerpt = screen.getByTestId('post-card-excerpt-1');
      expect(excerpt.textContent).toContain('...');
      expect(excerpt.textContent.length).toBe(153);
    });
  });

  describe('dado conteúdo curto', () => {
    it('deve exibir conteúdo sem truncamento', () => {
      const shortContent = 'Conteúdo curto';
      renderWithProviders(<PostCard {...mockPost} conteudo={shortContent} />);

      const excerpt = screen.getByTestId('post-card-excerpt-1');
      expect(excerpt.textContent).toBe('Conteúdo curto');
      expect(excerpt.textContent).not.toContain('...');
    });
  });
});
