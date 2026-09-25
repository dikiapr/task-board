import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ActivityList from '../../../components/modal/ActivityList';

describe('ActivityList', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-25T10:00:00Z'));
  });

  afterEach(() => vi.useRealTimers());

  it('shows an empty message without activity', () => {
    render(<ActivityList items={[]} />);
    expect(screen.getByText('Activity will appear here after the task is saved.')).toBeInTheDocument();
  });

  it('shows the message and relative time of each activity', () => {
    render(
      <ActivityList
        items={[
          { id: 'a1', message: 'Created this task', at: '2026-09-25T09:55:00Z' },
          { id: 'a2', message: 'Moved to Doing', at: '2026-09-25T07:00:00Z' },
        ]}
      />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Created this task');
    expect(items[0]).toHaveTextContent('5m ago');
    expect(items[1]).toHaveTextContent('Moved to Doing');
    expect(items[1]).toHaveTextContent('3h ago');
  });
});
