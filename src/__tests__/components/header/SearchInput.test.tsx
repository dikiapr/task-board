import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchInput from '../../../components/header/SearchInput';

describe('SearchInput', () => {
  it('sends the typed text to onChange', async () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search tasks' }), 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('hides the clear button when empty', () => {
    render(<SearchInput value="" onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('the clear button empties the value', async () => {
    const onChange = vi.fn();
    render(<SearchInput value="bug" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onChange).toHaveBeenCalledWith('');
  });
});
