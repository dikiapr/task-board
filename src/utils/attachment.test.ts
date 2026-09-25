import { describe, expect, it } from 'vitest';
import type { Attachment } from '../types/task';
import {
  ALLOWED_ATTACHMENT_LABEL,
  ATTACHMENT_ACCEPT,
  detectAttachmentType,
  sanitizeAttachments,
} from './attachment';

describe('detectAttachmentType', () => {
  it('menerima PDF, DOCX, dan JPEG (termasuk .jpg), tanpa peduli huruf besar/kecil', () => {
    expect(detectAttachmentType('laporan.pdf')).toBe('pdf');
    expect(detectAttachmentType('Surat.DOCX')).toBe('doc');
    expect(detectAttachmentType('foto.jpeg')).toBe('image');
    expect(detectAttachmentType('foto.backup.JPG')).toBe('image');
  });

  it('menolak format lain dan file tanpa ekstensi', () => {
    for (const name of ['gambar.png', 'lama.doc', 'catatan.txt', 'arsip.zip', 'README', 'file.constructor']) {
      expect(detectAttachmentType(name)).toBeNull();
    }
  });
});

it('teks petunjuk & atribut accept dibentuk dari daftar format yang sama', () => {
  expect(ALLOWED_ATTACHMENT_LABEL).toBe('PDF, DOCX, JPG, JPEG');
  expect(ATTACHMENT_ACCEPT).toBe('.pdf,.docx,.jpg,.jpeg');
});

it('sanitizeAttachments membuang format yang tidak diperbolehkan & memperbaiki jenisnya', () => {
  const input = [
    { id: '1', name: 'spec.pdf', type: 'pdf' },
    { id: '2', name: 'design.fig', type: 'other' },
    { id: '3', name: 'photo.jpg', type: 'doc' },
  ] as unknown as Attachment[];
  expect(sanitizeAttachments(input)).toEqual([
    { id: '1', name: 'spec.pdf', type: 'pdf' },
    { id: '3', name: 'photo.jpg', type: 'image' },
  ]);
});
