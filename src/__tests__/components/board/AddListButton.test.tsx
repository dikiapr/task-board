import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AddListButton from '../../../components/board/AddListButton';

const renderButton = () => {
  const onAdd = vi.fn();
  render(<AddListButton onAdd={onAdd} />);
  return onAdd;
};

describe('AddListButton', () => {
  it('adds a new list through the form', async () => {
    const onAdd = renderButton();
    await userEvent.click(screen.getByRole('button', { name: 'Add new List' }));

    const submit = screen.getByRole('button', { name: 'Add list' });
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByRole('textbox', { name: 'List name' }), 'QA');
    await userEvent.click(submit);

    expect(onAdd).toHaveBeenCalledWith('QA');
    expect(screen.getByRole('button', { name: 'Add new List' })).toBeInTheDocument();
  });

  it('Cancel closes the form without adding a list', async () => {
    const onAdd = renderButton();
    await userEvent.click(screen.getByRole('button', { name: 'Add new List' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('textbox', { name: 'List name' })).not.toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('Escape closes the form', async () => {
    renderButton();
    await userEvent.click(screen.getByRole('button', { name: 'Add new List' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'List name' }), '{Escape}');
    expect(screen.queryByRole('textbox', { name: 'List name' })).not.toBeInTheDocument();
  });
});
