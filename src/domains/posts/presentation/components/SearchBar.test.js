import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import theme from '../../../../shared/styles/theme';
import SearchBar from './SearchBar';

function renderSearchBar(props = {}) {
  const defaultProps = {
    onSearch: jest.fn(),
    onClear: jest.fn(),
    ...props,
  };

  return render(
    <ThemeProvider theme={theme}>
      <SearchBar {...defaultProps} />
    </ThemeProvider>
  );
}

describe('SearchBar', () => {
  describe('dado renderização inicial', () => {
    it('deve renderizar input e botão de busca', () => {
      renderSearchBar();

      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('search-btn-submit')).toBeInTheDocument();
    });

    it('não deve exibir botão de limpar', () => {
      renderSearchBar();

      expect(screen.queryByTestId('search-btn-clear')).not.toBeInTheDocument();
    });

    it('input deve ter placeholder "Buscar posts..."', () => {
      renderSearchBar();

      expect(screen.getByTestId('search-input')).toHaveAttribute('placeholder', 'Buscar posts...');
    });

    it('input deve ter type="search"', () => {
      renderSearchBar();

      expect(screen.getByTestId('search-input')).toHaveAttribute('type', 'search');
    });
  });

  describe('dado digitação e submit via botão', () => {
    it('deve chamar onSearch com o texto digitado', async () => {
      // Given
      const user = userEvent.setup();
      const onSearch = jest.fn();
      renderSearchBar({ onSearch });

      // When
      await user.type(screen.getByTestId('search-input'), 'react');
      await user.click(screen.getByTestId('search-btn-submit'));

      // Then
      expect(onSearch).toHaveBeenCalledWith('react');
    });
  });

  describe('dado digitação e submit via Enter', () => {
    it('deve chamar onSearch com o texto digitado', async () => {
      // Given
      const user = userEvent.setup();
      const onSearch = jest.fn();
      renderSearchBar({ onSearch });

      // When
      await user.type(screen.getByTestId('search-input'), 'javascript{enter}');

      // Then
      expect(onSearch).toHaveBeenCalledWith('javascript');
    });
  });

  describe('dado campo vazio e submit', () => {
    it('deve chamar onClear (não onSearch)', async () => {
      // Given
      const user = userEvent.setup();
      const onSearch = jest.fn();
      const onClear = jest.fn();
      renderSearchBar({ onSearch, onClear });

      // When
      await user.click(screen.getByTestId('search-btn-submit'));

      // Then
      expect(onClear).toHaveBeenCalled();
      expect(onSearch).not.toHaveBeenCalled();
    });
  });

  describe('dado texto no campo', () => {
    it('deve exibir botão de limpar', async () => {
      // Given
      const user = userEvent.setup();
      renderSearchBar();

      // When
      await user.type(screen.getByTestId('search-input'), 'react');

      // Then
      expect(screen.getByTestId('search-btn-clear')).toBeInTheDocument();
    });

    it('ao clicar limpar, deve limpar input e chamar onClear', async () => {
      // Given
      const user = userEvent.setup();
      const onClear = jest.fn();
      renderSearchBar({ onClear });

      await user.type(screen.getByTestId('search-input'), 'react');

      // When
      await user.click(screen.getByTestId('search-btn-clear'));

      // Then
      expect(screen.getByTestId('search-input')).toHaveValue('');
      expect(onClear).toHaveBeenCalled();
    });
  });
});
