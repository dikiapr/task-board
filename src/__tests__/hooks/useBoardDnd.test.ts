import { act, renderHook } from '@testing-library/react';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { useBoardDnd } from '../../hooks/useBoardDnd';
import { useBoardStore } from '../../store/useBoardStore';
import { makeTask, resetBoard } from '../fixtures';

// Over targets are 100px tall starting at top 0, so the midpoint is at 50.
const OVER_RECT = { top: 0, height: 100 };

const active = (id: string, top = 0) => ({ id, rect: { current: { translated: { top } } } });

const overTask = (id: string) => ({ id, rect: OVER_RECT, data: { current: { type: 'task' } } });

const overColumn = (id: string) => ({ id, rect: OVER_RECT, data: { current: { type: 'column' } } });

type Over = ReturnType<typeof overTask> | null;

const startEvent = (id: string) => ({ active: active(id) }) as unknown as DragStartEvent;
const overEvent = (id: string, over: Over, top = 0) =>
  ({ active: active(id, top), over }) as unknown as DragOverEvent;
const endEvent = (id: string, over: Over) => ({ active: active(id), over }) as unknown as DragEndEvent;

const order = () => useBoardStore.getState().tasks.map((t) => `${t.columnId}:${t.id}`);
const activityOf = (id: string) =>
  useBoardStore.getState().tasks.find((t) => t.id === id)!.activity.map((a) => a.message);

beforeEach(() =>
  resetBoard([
    makeTask({ id: 'a', columnId: 'todo' }),
    makeTask({ id: 'b', columnId: 'todo' }),
    makeTask({ id: 'x', columnId: 'doing' }),
    makeTask({ id: 'y', columnId: 'doing' }),
  ]),
);

describe('useBoardDnd', () => {
  it('starts idle', () => {
    const { result } = renderHook(() => useBoardDnd());
    expect(result.current.activeTask).toBeNull();
    expect(result.current.draggingColumnId).toBeUndefined();
  });

  it('drag start tracks the active task and its column', () => {
    const { result } = renderHook(() => useBoardDnd());
    act(() => result.current.contextProps.onDragStart(startEvent('a')));

    expect(result.current.activeTask?.id).toBe('a');
    expect(result.current.draggingColumnId).toBe('todo');
  });

  describe('drag over', () => {
    it('moves the task to the end of an empty column area', () => {
      const { result } = renderHook(() => useBoardDnd());
      act(() => result.current.contextProps.onDragStart(startEvent('a')));
      act(() => result.current.contextProps.onDragOver(overEvent('a', overColumn('review'))));

      expect(order()).toEqual(['todo:b', 'doing:x', 'doing:y', 'review:a']);
      expect(result.current.draggingColumnId).toBe('review');
    });

    it('inserts before a task when above its midpoint', () => {
      const { result } = renderHook(() => useBoardDnd());
      act(() => result.current.contextProps.onDragOver(overEvent('a', overTask('y'), 10)));

      expect(order()).toEqual(['todo:b', 'doing:x', 'doing:a', 'doing:y']);
    });

    it('inserts after a task when below its midpoint', () => {
      const { result } = renderHook(() => useBoardDnd());
      act(() => result.current.contextProps.onDragOver(overEvent('a', overTask('x'), 60)));

      expect(order()).toEqual(['todo:b', 'doing:x', 'doing:a', 'doing:y']);
    });

    it('ignores a target in the same column or no target at all', () => {
      const { result } = renderHook(() => useBoardDnd());
      const before = order();

      act(() => result.current.contextProps.onDragOver(overEvent('a', overTask('b'))));
      act(() => result.current.contextProps.onDragOver(overEvent('a', overColumn('todo'))));
      act(() => result.current.contextProps.onDragOver(overEvent('a', null)));

      expect(order()).toEqual(before);
    });
  });

  describe('drag end', () => {
    it('reorders within the same column', () => {
      const { result } = renderHook(() => useBoardDnd());
      act(() => result.current.contextProps.onDragStart(startEvent('b')));
      act(() => result.current.contextProps.onDragEnd(endEvent('b', overTask('a'))));

      expect(order()).toEqual(['todo:b', 'todo:a', 'doing:x', 'doing:y']);
      expect(activityOf('b')).toEqual([]);
      expect(result.current.activeTask).toBeNull();
    });

    it('logs one activity entry after moving to another column', () => {
      const { result } = renderHook(() => useBoardDnd());
      act(() => result.current.contextProps.onDragStart(startEvent('a')));
      act(() => result.current.contextProps.onDragOver(overEvent('a', overColumn('review'))));
      act(() => result.current.contextProps.onDragOver(overEvent('a', overTask('x'))));
      // Once the card has moved into place, dnd-kit reports the card itself as the drop target.
      act(() => result.current.contextProps.onDragEnd(endEvent('a', overTask('a'))));

      expect(order()).toEqual(['todo:b', 'doing:a', 'doing:x', 'doing:y']);
      expect(activityOf('a')).toEqual(['Moved from To Do to Doing']);
      expect(result.current.activeTask).toBeNull();
      expect(result.current.draggingColumnId).toBeUndefined();
    });

    it('logs "Marked as complete" when dropped in Done', () => {
      const { result } = renderHook(() => useBoardDnd());
      act(() => result.current.contextProps.onDragStart(startEvent('a')));
      act(() => result.current.contextProps.onDragOver(overEvent('a', overColumn('done'))));
      act(() => result.current.contextProps.onDragEnd(endEvent('a', overColumn('done'))));

      expect(activityOf('a')).toEqual(['Marked as complete']);
    });
  });

  it('drag cancel restores the board as it was before the drag', () => {
    const { result } = renderHook(() => useBoardDnd());
    const before = order();

    act(() => result.current.contextProps.onDragStart(startEvent('a')));
    act(() => result.current.contextProps.onDragOver(overEvent('a', overColumn('review'))));
    act(() => result.current.contextProps.onDragCancel());

    expect(order()).toEqual(before);
    expect(result.current.activeTask).toBeNull();
  });
});
