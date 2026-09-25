import type { Attachment, AttachmentType } from '../types/task';

const ALLOWED_EXTENSIONS = new Map<string, AttachmentType>([
  ['pdf', 'pdf'],
  ['docx', 'doc'],
  ['jpg', 'image'],
  ['jpeg', 'image'],
]);

const extensions = [...ALLOWED_EXTENSIONS.keys()];

export const ALLOWED_ATTACHMENT_LABEL = extensions.map((ext) => ext.toUpperCase()).join(', ');

export const ATTACHMENT_ACCEPT = extensions.map((ext) => `.${ext}`).join(',');

const extensionOf = (fileName: string) => {
  const dot = fileName.lastIndexOf('.');
  return dot === -1 ? '' : fileName.slice(dot + 1).toLowerCase();
};

export const detectAttachmentType = (fileName: string): AttachmentType | null =>
  ALLOWED_EXTENSIONS.get(extensionOf(fileName)) ?? null;

export const sanitizeAttachments = (attachments: Attachment[]): Attachment[] =>
  attachments.flatMap((a) => {
    const type = typeof a?.name === 'string' ? detectAttachmentType(a.name) : null;
    return type ? [{ ...a, type }] : [];
  });
