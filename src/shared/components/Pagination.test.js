import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import theme from '../styles/theme';
import Pagination from './Pagination';

function renderPagination(props) {
  return render(
    <ThemeProvider theme={theme}>
      <Pagination {...props} />
    </ThemeProvider>
  );
}

describe('Pagination', () => {
  describe('dado totalPages <= 1', () => {
    it('não deve renderizar nada para totalPages = 1', () => {
      const { container } = renderPagination({ currentPage: 1, totalPages: 1, onPageChange: jest.fn() });
      expect(container).toBeEmptyDOMElement();
    });

    it('não deve renderizar nada para totalPages = 0', () => {
      const { container } = renderPagination({ currentPage: 1, totalPages: 0, onPageChange: jest.fn() });
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('dado que está na primeira página de 5', () => {
    it('deve desabilitar o botão anterior', () => {
      renderPagination({ currentPage: 1, totalPages: 5, onPageChange: jest.fn() });
      expect(screen.getByTestId('pagination-btn-prev')).toBeDisabled();
    });

    it('deve habilitar o botão próximo', () => {
      renderPagination({ currentPage: 1, totalPages: 5, onPageChange: jest.fn() });
      expect(screen.getByTestId('pagination-btn-next')).not.toBeDisabled();
    });

    it('deve destacar visualmente a página atual', () => {
      renderPagination({ currentPage: 1, totalPages: 5, onPageChange: jest.fn() });
      expect(screen.getByTestId('pagination-btn-page-1')).toBeInTheDocument();
    });
  });

  describe('dado que está na última página', () => {
    it('deve habilitar o botão anterior', () => {
      renderPagination({ currentPage: 5, totalPages: 5, onPageChange: jest.fn() });
      expect(screen.getByTestId('pagination-btn-prev')).not.toBeDisabled();
    });

    it('deve desabilitar o botão próximo', () => {
      renderPagination({ currentPage: 5, totalPages: 5, onPageChange: jest.fn() });
      expect(screen.getByTestId('pagination-btn-next')).toBeDisabled();
    });
  });

  describe('quando o usuário clica no botão próximo', () => {
    it('deve chamar onPageChange com página atual + 1', async () => {
      const onPageChange = jest.fn();
      renderPagination({ currentPage: 2, totalPages: 5, onPageChange });
      await userEvent.click(screen.getByTestId('pagination-btn-next'));
      expect(onPageChange).toHaveBeenCalledWith(3);
    });
  });

  describe('quando o usuário clica no botão anterior', () => {
    it('deve chamar onPageChange com página atual - 1', async () => {
      const onPageChange = jest.fn();
      renderPagination({ currentPage: 3, totalPages: 5, onPageChange });
      await userEvent.click(screen.getByTestId('pagination-btn-prev'));
      expect(onPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe('quando o usuário clica em uma página específica', () => {
    it('deve chamar onPageChange com o número da página', async () => {
      const onPageChange = jest.fn();
      renderPagination({ currentPage: 1, totalPages: 5, onPageChange });
      await userEvent.click(screen.getByTestId('pagination-btn-page-4'));
      expect(onPageChange).toHaveBeenCalledWith(4);
    });
  });

  describe('dado mais de 5 páginas', () => {
    it('deve exibir no máximo 5 botões de página', () => {
      renderPagination({ currentPage: 5, totalPages: 10, onPageChange: jest.fn() });
      const pageButtons = screen.getAllByTestId(/^pagination-btn-page-/);
      expect(pageButtons).toHaveLength(5);
    });

    it('deve exibir páginas corretas quando currentPage <= 3', () => {
      renderPagination({ currentPage: 2, totalPages: 10, onPageChange: jest.fn() });
      expect(screen.getByTestId('pagination-btn-page-1')).toBeInTheDocument();
      expect(screen.getByTestId('pagination-btn-page-5')).toBeInTheDocument();
    });

    it('deve exibir páginas corretas quando currentPage >= totalPages - 2', () => {
      renderPagination({ currentPage: 9, totalPages: 10, onPageChange: jest.fn() });
      expect(screen.getByTestId('pagination-btn-page-6')).toBeInTheDocument();
      expect(screen.getByTestId('pagination-btn-page-10')).toBeInTheDocument();
    });
  });

  it('deve exibir informação de página atual', () => {
    renderPagination({ currentPage: 3, totalPages: 5, onPageChange: jest.fn() });
    expect(screen.getByTestId('pagination-info')).toHaveTextContent('Página 3 de 5');
  });

  it('deve ter aria-label para acessibilidade', () => {
    renderPagination({ currentPage: 1, totalPages: 3, onPageChange: jest.fn() });
    expect(screen.getByTestId('pagination-container')).toHaveAttribute('aria-label', 'Paginação');
  });
});
