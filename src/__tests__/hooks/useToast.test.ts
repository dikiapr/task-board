import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkmarkCircleOutline, trashOutline } from 'ionicons/icons';
import { useToast } from '../../hooks/useToast';

const present = vi.fn();
const dismiss = vi.fn();

vi.mock('@ionic/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@ionic/react')>()),
  useIonToast: () => [present, dismiss],
}));

beforeEach(() => {
  present.mockReset();
  dismiss.mockReset().mockResolvedValue(undefined);
});

describe('useToast', () => {
  it('dismisses the previous toast before presenting the new one', async () => {
    const { result } = renderHook(() => useToast());
    await result.current('Task created');

    expect(dismiss).toHaveBeenCalled();
    expect(dismiss.mock.invocationCallOrder[0]).toBeLessThan(present.mock.invocationCallOrder[0]);
    expect(present).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Task created',
        cssClass: 'k-toast',
        icon: checkmarkCircleOutline,
        buttons: undefined,
      }),
    );
  });

  it('uses icon and color from options', async () => {
    const { result } = renderHook(() => useToast());
    await result.current('Import failed', { icon: trashOutline, color: 'danger' });

    expect(present).toHaveBeenCalledWith(expect.objectContaining({ icon: trashOutline, color: 'danger' }));
  });

  it('adds an Undo button when undo is given', async () => {
    const undo = vi.fn();
    const { result } = renderHook(() => useToast());
    await result.current('Task deleted', { undo });

    const [{ buttons }] = present.mock.calls[0];
    expect(buttons).toEqual([{ text: 'Undo', handler: undo }]);
  });
});
