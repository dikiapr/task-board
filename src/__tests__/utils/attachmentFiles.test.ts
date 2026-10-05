import { describe, expect, it } from 'vitest';
import { getAttachmentFile, removeUnusedAttachmentFiles, saveAttachmentFile } from '../../utils/attachmentFiles';
import { makeTask } from '../fixtures';

describe('attachmentFiles', () => {
  // fake-indexeddb cannot clone jsdom's File contents, so only presence is checked here.
  it('saves and reads a file by attachment id', async () => {
    await saveAttachmentFile('f1', new File(['hello'], 'note.pdf', { type: 'application/pdf' }));
    expect(await getAttachmentFile('f1')).toBeDefined();
    expect(await getAttachmentFile('missing')).toBeUndefined();
  });

  it('removes files that no task points to', async () => {
    await saveAttachmentFile('keep', new Blob(['a']));
    await saveAttachmentFile('orphan', new Blob(['b']));
    const tasks = [makeTask({ attachments: [{ id: 'keep', name: 'a.pdf', type: 'pdf' }] })];

    await removeUnusedAttachmentFiles(tasks);

    expect(await getAttachmentFile('keep')).toBeDefined();
    expect(await getAttachmentFile('orphan')).toBeUndefined();
  });
});
