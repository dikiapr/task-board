import { createStore, del, get, keys, set, type UseStore } from 'idb-keyval';
import type { Task } from '../types/task';

/**
 * File contents live in IndexedDB, keyed by attachment id, because localStorage (where
 * the board is kept) only holds a few MB. Tasks store just the name and type.
 */
let store: UseStore | undefined;

/** Opened on first use, so a browser without IndexedDB only loses previews, not the app. */
const fileStore = () => (store ??= createStore('task-board-files', 'attachments'));

export const saveAttachmentFile = async (id: string, file: Blob) => set(id, file, fileStore());

export const getAttachmentFile = async (id: string) => get<Blob>(id, fileStore());

/**
 * Deletes files no task points to anymore: removed attachments, deleted tasks, discarded
 * drafts, or a replaced board. Run on startup rather than on every delete so "Undo" can
 * still bring a deleted task back with its files.
 */
export const removeUnusedAttachmentFiles = async (tasks: Task[]) => {
  const used = new Set(tasks.flatMap((t) => t.attachments.map((a) => a.id)));
  const stored = await keys<string>(fileStore());
  await Promise.all(stored.filter((id) => !used.has(id)).map((id) => del(id, fileStore())));
};
