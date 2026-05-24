import { useState } from 'react';
import styled from 'styled-components';

const Container = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  max-width: 600px;
`;

const Input = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const ClearButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textLight};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

function SearchBar({ onSearch, onClear, placeholder = 'Buscar posts...' }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!query.trim()) {
      if (onClear) onClear();
      return;
    }

    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery('');
    if (onClear) onClear();
  };

  return (
    <Container onSubmit={handleSubmit}>
      <Input
        data-testid="search-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Campo de busca"
      />
      {query.length > 0 && (
        <ClearButton
          data-testid="search-btn-clear"
          type="button"
          onClick={handleClear}
          aria-label="Limpar busca"
        >
          ✕
        </ClearButton>
      )}
      <Button data-testid="search-btn-submit" type="submit">
        Buscar
      </Button>
    </Container>
  );
}

export default SearchBar;
