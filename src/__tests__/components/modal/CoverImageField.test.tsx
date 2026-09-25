import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CoverImageField from '../../../components/modal/CoverImageField';

// A plain function instead of vi.fn(): vi.fn reports a rejected result as an
// unhandled error even when the component catches it.
const image = vi.hoisted(() => ({ toDataUrl: (): Promise<string> => Promise.resolve('') }));
vi.mock('../../../utils/image', () => ({ imageFileToDataUrl: () => image.toDataUrl() }));

const upload = (container: HTMLElement) =>
  fireEvent.change(container.querySelector('input[type="file"]')!, {
    target: { files: [new File(['x'], 'cover.png', { type: 'image/png' })] },
  });

describe('CoverImageField', () => {
  it('shows "Add Cover Image" without a cover', () => {
    render(<CoverImageField onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Add Cover Image' })).toBeInTheDocument();
  });

  it('shows the cover and a Remove button', async () => {
    const onChange = vi.fn();
    render(<CoverImageField value="/covers/cover-2.jpg" onChange={onChange} />);
    expect(screen.getByAltText('Task cover')).toHaveAttribute('src', '/covers/cover-2.jpg');

    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('picks a sample image from the popover', async () => {
    const onChange = vi.fn();
    render(<CoverImageField onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add Cover Image' }));

    const samples = await screen.findAllByRole('button', { name: 'Use this sample image' });
    expect(samples).toHaveLength(4);
    await userEvent.click(samples[0]);
    expect(onChange).toHaveBeenCalledWith('/covers/cover-1.jpg');
  });

  it('uploads an image from the device', async () => {
    image.toDataUrl = () => Promise.resolve('data:image/jpeg;base64,abc');
    const onChange = vi.fn();
    const { container } = render(<CoverImageField onChange={onChange} />);

    upload(container);
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith('data:image/jpeg;base64,abc'));
  });

  it('shows an error when the image cannot be processed', async () => {
    image.toDataUrl = () => Promise.reject(new Error('Image is too large'));
    const onChange = vi.fn();
    const { container } = render(<CoverImageField onChange={onChange} />);

    upload(container);
    expect(await screen.findByText('Image is too large')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});
