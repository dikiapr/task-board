import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Subtask } from '../../../types/task';
import ChecklistField from '../../../components/modal/ChecklistField';

// IonCheckbox never wires up its ionChange listener in jsdom, so swap in a native checkbox.
vi.mock('@ionic/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@ionic/react')>()),
  IonCheckbox: ({ checked, onIonChange, children }: { checked: boolean; onIonChange: () => void; children: React.ReactNode }) => (
    <label>
      <input type="checkbox" checked={checked} onChange={onIonChange} />
      {children}
    </label>
  ),
}));

const Harness: React.FC<{ initial?: Subtask[] }> = ({ initial = [] }) => {
  const [value, setValue] = useState(initial);
  return <ChecklistField value={value} onChange={setValue} />;
};

const subtasks: Subtask[] = [
  { id: 's1', title: 'Wireframe', done: true },
  { id: 's2', title: 'Prototype', done: false },
];

describe('ChecklistField', () => {
  it('shows the done count and progress', () => {
    render(<Harness initial={subtasks} />);
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  });

  it('adds a subtask with Enter', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Add subtask' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'New subtask title' }), '  Riset  {Enter}');

    expect(screen.getByText('Riset')).toBeInTheDocument();
    expect(screen.getByText('0/1')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'New subtask title' })).toHaveValue('');
  });

  it('disables Add when the title is empty', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Add subtask' }));
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();

    await userEvent.type(screen.getByRole('textbox', { name: 'New subtask title' }), 'Test');
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('Escape and Cancel close the input', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Add subtask' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'New subtask title' }), '{Escape}');
    expect(screen.queryByRole('textbox', { name: 'New subtask title' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Add subtask' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('textbox', { name: 'New subtask title' })).not.toBeInTheDocument();
  });

  it('checks and unchecks a subtask', async () => {
    render(<Harness initial={subtasks} />);
    const prototype = screen.getByRole('checkbox', { name: 'Prototype' });

    await userEvent.click(prototype);
    expect(prototype).toBeChecked();
    expect(screen.getByText('2/2')).toBeInTheDocument();
    expect(prototype.closest('li')).toHaveClass('is-done');

    await userEvent.click(prototype);
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('removes a subtask', async () => {
    render(<Harness initial={subtasks} />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove Wireframe' }));
    expect(screen.queryByText('Wireframe')).not.toBeInTheDocument();
    expect(screen.getByText('0/1')).toBeInTheDocument();
  });
});
