import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Attachment } from '../../../../types/task';
import AttachmentsField from '../../../../components/task-detail/parts/AttachmentsField';
import { getAttachmentFile, saveAttachmentFile } from '../../../../utils/attachmentFiles';
import { downloadBlob } from '../../../../utils/download';

vi.mock('../../../../utils/attachmentFiles', () => ({
  saveAttachmentFile: vi.fn(() => Promise.resolve()),
  getAttachmentFile: vi.fn(),
}));

vi.mock('../../../../utils/download', () => ({ downloadBlob: vi.fn() }));

const Harness: React.FC<{ initial?: Attachment[] }> = ({ initial = [] }) => {
  const [value, setValue] = useState(initial);
  return <AttachmentsField value={value} onChange={setValue} />;
};

const file = (name: string) => new File(['x'], name);

const { createObjectURL, revokeObjectURL } = URL;

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:preview');
  URL.revokeObjectURL = vi.fn();
  vi.mocked(getAttachmentFile).mockReset();
  vi.mocked(saveAttachmentFile).mockClear();
  vi.mocked(downloadBlob).mockClear();
});

afterEach(() => {
  URL.createObjectURL = createObjectURL;
  URL.revokeObjectURL = revokeObjectURL;
});

describe('AttachmentsField', () => {
  it('shows the allowed formats', () => {
    render(<Harness />);
    expect(screen.getByText('Allowed formats: PDF, DOCX, JPG, JPEG')).toBeInTheDocument();
  });

  it('adds files with allowed formats and rejects the rest', () => {
    const { container } = render(<Harness />);
    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [file('spec.pdf'), file('virus.exe'), file('photo.JPG')] },
    });

    expect(screen.getByText('spec.pdf')).toBeInTheDocument();
    expect(screen.getByText('photo.JPG').closest('li')).toHaveClass('k-file--image');
    expect(screen.getByRole('alert')).toHaveTextContent('Not added (format not allowed): virus.exe');
  });

  it('stores the content of every added file', () => {
    const { container } = render(<Harness />);
    const pdf = file('spec.pdf');
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [pdf] } });
    expect(saveAttachmentFile).toHaveBeenCalledWith(expect.any(String), pdf);
  });

  it('accepts files by drag and drop', () => {
    const { container } = render(<Harness />);
    const dropzone = container.querySelector('.k-dropzone')!;

    fireEvent.dragOver(dropzone);
    expect(dropzone).toHaveClass('is-over');

    fireEvent.drop(dropzone, { dataTransfer: { files: [file('brief.docx')] } });
    expect(dropzone).not.toHaveClass('is-over');
    expect(screen.getByText('brief.docx').closest('li')).toHaveClass('k-file--doc');
  });

  it('removes an attachment', async () => {
    render(<Harness initial={[{ id: 'a1', name: 'spec.pdf', type: 'pdf' }]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove spec.pdf' }));
    expect(screen.queryByText('spec.pdf')).not.toBeInTheDocument();
  });

  describe('opening an attachment', () => {
    const open = async (attachment: Attachment) => {
      render(<Harness initial={[attachment]} />);
      await userEvent.click(screen.getByRole('button', { name: attachment.name }));
    };

    it('previews an image', async () => {
      vi.mocked(getAttachmentFile).mockResolvedValue(new Blob(['img']));
      await open({ id: 'i1', name: 'photo.jpg', type: 'image' });

      expect(await screen.findByRole('img', { name: 'photo.jpg' })).toHaveAttribute('src', 'blob:preview');
      await userEvent.click(screen.getByRole('button', { name: 'Close preview' }));
      await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview'));
    });

    it('previews a PDF and links to it in a new tab', async () => {
      vi.mocked(getAttachmentFile).mockResolvedValue(new Blob(['pdf']));
      await open({ id: 'p1', name: 'spec.pdf', type: 'pdf' });

      await screen.findByRole('link', { name: 'Open in new tab' });
      expect(document.querySelector('iframe[title="spec.pdf"]')).toHaveAttribute('src', 'blob:preview');
      expect(screen.getByRole('link', { name: 'Open in new tab' })).toHaveAttribute('href', 'blob:preview');
    });

    it('downloads a Word document instead of previewing it', async () => {
      const blob = new Blob(['doc']);
      vi.mocked(getAttachmentFile).mockResolvedValue(blob);
      await open({ id: 'd1', name: 'brief.docx', type: 'doc' });

      await waitFor(() => expect(downloadBlob).toHaveBeenCalledWith(blob, 'brief.docx'));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('explains when the file itself was never saved', async () => {
      vi.mocked(getAttachmentFile).mockResolvedValue(undefined);
      await open({ id: 's1', name: 'sample.pdf', type: 'pdf' });

      expect(await screen.findByRole('status')).toHaveTextContent('No preview for sample.pdf');
    });
  });
});
