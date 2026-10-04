import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useTaskDraft } from '../../hooks/useTaskDraft';
import { makeTask, resetBoard } from '../fixtures';

beforeEach(() => resetBoard([makeTask({ id: 'a', title: 'Alpha', assigneeIds: ['m1'] })]));

describe('useTaskDraft', () => {
  it('starts from an empty draft in create mode', () => {
    const { result } = renderHook(() => useTaskDraft({ mode: 'create', columnId: 'doing' }));
    expect(result.current.draft).toMatchObject({ columnId: 'doing', title: '' });
    expect(result.current.isDirty).toBe(false);
  });

  it('starts from the task in edit mode', () => {
    const { result } = renderHook(() => useTaskDraft({ mode: 'edit', taskId: 'a' }));
    expect(result.current.draft.title).toBe('Alpha');
  });

  it('update accepts a value or an updater function and marks the draft dirty', () => {
    const { result } = renderHook(() => useTaskDraft({ mode: 'edit', taskId: 'a' }));

    act(() => result.current.update('title', 'Beta'));
    expect(result.current.draft.title).toBe('Beta');

    act(() => result.current.update('assigneeIds', (ids) => [...ids, 'm2']));
    expect(result.current.draft.assigneeIds).toEqual(['m1', 'm2']);

    expect(result.current.isDirty).toBe(true);
    expect(result.current.initial.title).toBe('Alpha');
  });
});
