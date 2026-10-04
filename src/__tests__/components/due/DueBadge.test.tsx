import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DueBadge from '../../../components/due/DueBadge';

describe('DueBadge', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 25));
  });

  afterEach(() => vi.useRealTimers());

  it('shows the short date', () => {
    render(<DueBadge date="2026-10-02" />);
    expect(screen.getByTitle('Due date')).toHaveTextContent('2 Oct');
  });

  it('marks a past date as overdue', () => {
    render(<DueBadge date="2026-09-20" />);
    expect(screen.getByTitle('Due date')).toHaveClass('k-due--overdue');
  });

  it('marks today as due today', () => {
    render(<DueBadge date="2026-09-25" />);
    expect(screen.getByTitle('Due date')).toHaveClass('k-due--today');
  });

  it('does not flag the date when the task is done', () => {
    render(<DueBadge date="2026-09-20" isDone />);
    expect(screen.getByTitle('Due date')).toHaveClass('k-due--none');
  });
});
