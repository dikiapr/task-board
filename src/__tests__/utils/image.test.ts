import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { imageFileToDataUrl } from '../../utils/image';

// jsdom never loads images, so this stand-in "loads" as soon as src is set.
const next = { width: 0, height: 0, fails: false };

class FakeImage {
  width = 0;
  height = 0;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  set src(_url: string) {
    this.width = next.width;
    this.height = next.height;
    queueMicrotask(() => (next.fails ? this.onerror?.() : this.onload?.()));
  }
}

const drawImage = vi.fn();
const toDataURL = vi.fn(function (this: HTMLCanvasElement, type?: string, quality?: number) {
  return `data:${type};${this.width}x${this.height};q=${quality}`;
});
const { createObjectURL, revokeObjectURL } = URL;
const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });

beforeEach(() => {
  Object.assign(next, { width: 0, height: 0, fails: false });
  vi.stubGlobal('Image', FakeImage);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as never);
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(toDataURL);
  URL.createObjectURL = vi.fn(() => 'blob:photo');
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  drawImage.mockClear();
  URL.createObjectURL = createObjectURL;
  URL.revokeObjectURL = revokeObjectURL;
});

describe('imageFileToDataUrl', () => {
  it('scales a wide image down to 640px and encodes it as JPEG', async () => {
    Object.assign(next, { width: 1280, height: 720 });
    await expect(imageFileToDataUrl(file)).resolves.toBe('data:image/jpeg;640x360;q=0.75');

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(drawImage).toHaveBeenCalledWith(expect.any(FakeImage), 0, 0, 640, 360);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo');
  });

  it('never scales a small image up', async () => {
    Object.assign(next, { width: 320, height: 201 });
    await expect(imageFileToDataUrl(file)).resolves.toBe('data:image/jpeg;320x201;q=0.75');
  });

  it('uses the given max width & quality, rounding the size', async () => {
    Object.assign(next, { width: 1000, height: 333 });
    await expect(imageFileToDataUrl(file, 300, 0.5)).resolves.toBe('data:image/jpeg;300x100;q=0.5');
  });

  it('still resolves when the canvas has no 2D context', async () => {
    Object.assign(next, { width: 10, height: 10 });
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    await expect(imageFileToDataUrl(file)).resolves.toBe('data:image/jpeg;10x10;q=0.75');
    expect(drawImage).not.toHaveBeenCalled();
  });

  it('rejects a file that is not an image and frees the object URL', async () => {
    next.fails = true;
    await expect(imageFileToDataUrl(file)).rejects.toThrow('File is not a valid image');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo');
  });
});
