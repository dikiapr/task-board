import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from '../../../components/error/ErrorBoundary';
import { useBoardStore } from '../../../store/useBoardStore';
import { makeTask, resetBoard } from '../../fixtures';

// Renders the board's task titles, and throws while `crash.on` is set.
const crash = { on: false };
const Board = () => {
  const tasks = useBoardStore((s) => s.tasks);
  if (crash.on) throw new Error('Cannot read properties of undefined');
  return <p>{tasks.length} tasks</p>;
};

beforeEach(() => {
  crash.on = false;
  resetBoard([makeTask()]);
  // React reports every caught render error through console.error.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe('ErrorBoundary', () => {
  it('renders its children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <Board />
      </ErrorBoundary>,
    );
    expect(screen.getByText('1 tasks')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a recovery screen with the error message when a child throws', () => {
    crash.on = true;
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Board />
      </ErrorBoundary>,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Something went wrong');
    expect(alert).toHaveTextContent('Cannot read properties of undefined');
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Cannot read properties of undefined' }),
      expect.anything(),
    );
  });

  it('"Try again" renders the children again', async () => {
    crash.on = true;
    render(
      <ErrorBoundary>
        <Board />
      </ErrorBoundary>,
    );

    crash.on = false;
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('1 tasks')).toBeInTheDocument();
    expect(useBoardStore.getState().tasks).toHaveLength(1);
  });

  it('"Try again" shows the recovery screen again if the error persists', async () => {
    crash.on = true;
    render(
      <ErrorBoundary>
        <Board />
      </ErrorBoundary>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('"Reset board" restores the sample data and renders the children again', async () => {
    crash.on = true;
    render(
      <ErrorBoundary>
        <Board />
      </ErrorBoundary>,
    );

    crash.on = false;
    await userEvent.click(screen.getByRole('button', { name: 'Reset board' }));
    const seeded = useBoardStore.getState().tasks.length;
    expect(seeded).toBeGreaterThan(1);
    expect(screen.getByText(`${seeded} tasks`)).toBeInTheDocument();
  });
});
