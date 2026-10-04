import { describe, expect, it } from 'vitest';
import { cleanDraft, emptyDraft, getReturnColumnId, isDraftChanged, toDraft } from '../../utils/taskDraft';
import { DEFAULT_COLUMNS } from '../../data/constants';
import { makeTask } from '../fixtures';

describe('taskDraft', () => {
  it('emptyDraft starts blank in the given column', () => {
    expect(emptyDraft('review')).toMatchObject({ columnId: 'review', title: '', assigneeIds: [], dueDate: null });
  });

  it('toDraft drops id, createdAt, and activity', () => {
    const draft = toDraft(makeTask({ title: 'Fix login' }));
    expect(draft.title).toBe('Fix login');
    expect(draft).not.toHaveProperty('id');
    expect(draft).not.toHaveProperty('createdAt');
    expect(draft).not.toHaveProperty('activity');
  });

  it('isDraftChanged compares by value', () => {
    const draft = emptyDraft('todo');
    expect(isDraftChanged({ ...draft }, draft)).toBe(false);
    expect(isDraftChanged({ ...draft, title: 'x' }, draft)).toBe(true);
  });

  it('cleanDraft trims title and description', () => {
    const draft = cleanDraft({ ...emptyDraft('todo'), title: '  Fix  ', description: ' notes \n' });
    expect(draft.title).toBe('Fix');
    expect(draft.description).toBe('notes');
  });

  describe('getReturnColumnId', () => {
    it('returns the original column', () => {
      expect(getReturnColumnId('review', DEFAULT_COLUMNS)).toBe('review');
    });

    it('falls back to the first non-Done column for tasks that started in Done', () => {
      expect(getReturnColumnId('done', DEFAULT_COLUMNS)).toBe('todo');
    });
  });
});
