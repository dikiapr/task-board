import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import SortableKanbanCard from '../../../components/card/SortableKanbanCard';
import { makeTask } from '../../fixtures';

describe('SortableKanbanCard', () => {
  const renderSortable = (onOpen = vi.fn()) => {
    const task = makeTask({ title: 'Design' });
    render(
      <DndContext sensors={[]}>
        <SortableContext items={[task.id]}>
          <SortableKanbanCard task={task} onOpen={onOpen} />
        </SortableContext>
      </DndContext>,
    );
    return { task, onOpen, card: screen.getByLabelText('Task: Design') };
  };

  it('opens the task on click', async () => {
    const { task, onOpen, card } = renderSortable();
    await userEvent.click(card);
    expect(onOpen).toHaveBeenCalledWith(task);
  });

  it('opens the task on Enter', () => {
    const { task, onOpen, card } = renderSortable();
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onOpen).toHaveBeenCalledWith(task);
  });
});
