import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { Attachment } from '../../../types/task';
import AttachmentsField from '../../../components/modal/AttachmentsField';

const Harness: React.FC<{ initial?: Attachment[] }> = ({ initial = [] }) => {
  const [value, setValue] = useState(initial);
  return <AttachmentsField value={value} onChange={setValue} />;
};

const file = (name: string) => new File(['x'], name);

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
});
