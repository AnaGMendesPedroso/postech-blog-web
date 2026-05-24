import styled from 'styled-components';

const Container = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md} 0;
  flex-wrap: wrap;
`;

const PageButton = styled.button`
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.surface)};
  color: ${({ $active, theme }) => ($active ? theme.colors.surface : theme.colors.text)};
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: ${({ $active, theme }) => ($active ? theme.colors.primaryHover : theme.colors.background)};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Info = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0 ${({ theme }) => theme.spacing.sm};
`;

function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }
  if (currentPage >= totalPages - 2) {
    return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <Container data-testid="pagination-container" aria-label="Paginação">
      <PageButton
        data-testid="pagination-btn-prev"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ‹
      </PageButton>

      {visiblePages.map((page) => (
        <PageButton
          key={page}
          data-testid={`pagination-btn-page-${page}`}
          $active={page === currentPage}
          onClick={() => onPageChange(page)}
        >
          {page}
        </PageButton>
      ))}

      <Info data-testid="pagination-info">
        Página {currentPage} de {totalPages}
      </Info>

      <PageButton
        data-testid="pagination-btn-next"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        ›
      </PageButton>
    </Container>
  );
}

export default Pagination;
