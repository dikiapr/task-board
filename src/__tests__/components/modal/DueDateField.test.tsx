import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DueDateField from '../../../components/modal/DueDateField';

const nativeInput = (container: HTMLElement) => container.querySelector<HTMLInputElement>('input[type="date"]')!;

describe('DueDateField', () => {
  it('shows a placeholder and no clear button when empty', () => {
    render(<DueDateField value={null} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Select date' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear due date' })).not.toBeInTheDocument();
  });

  it('shows the formatted date and can be cleared', async () => {
    const onChange = vi.fn();
    render(<DueDateField value="2026-09-25" onChange={onChange} />);
    expect(screen.getByRole('button', { name: '25 Sep, 2026' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Clear due date' }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('sends the date from the native input', () => {
    const onChange = vi.fn();
    const { container } = render(<DueDateField value={null} onChange={onChange} />);
    fireEvent.change(nativeInput(container), { target: { value: '2026-10-01' } });
    expect(onChange).toHaveBeenCalledWith('2026-10-01');
  });

  it('calls showPicker when the button is clicked', async () => {
    const { container } = render(<DueDateField value={null} onChange={vi.fn()} />);
    const input = nativeInput(container);
    input.showPicker = vi.fn();

    await userEvent.click(screen.getByRole('button', { name: 'Select date' }));
    expect(input.showPicker).toHaveBeenCalled();
  });

  it('focuses the input when showPicker is unsupported', async () => {
    const { container } = render(<DueDateField value={null} onChange={vi.fn()} />);
    const input = nativeInput(container);
    input.showPicker = () => {
      throw new Error('Not supported');
    };

    await userEvent.click(screen.getByRole('button', { name: 'Select date' }));
    expect(input).toHaveFocus();
  });
});
