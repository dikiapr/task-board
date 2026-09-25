import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePopover } from '../../hooks/usePopover';

const clickEvent = () => {
  const nativeEvent = new MouseEvent('click');
  return { nativeEvent } as React.MouseEvent;
};

describe('usePopover', () => {
  it('starts closed', () => {
    const { result } = renderHook(() => usePopover());
    expect(result.current.props.isOpen).toBe(false);
    expect(result.current.props.event).toBeUndefined();
  });

  it('open stores the event as the popover position', () => {
    const { result } = renderHook(() => usePopover());
    const event = clickEvent();
    act(() => result.current.open(event));

    expect(result.current.props.isOpen).toBe(true);
    expect(result.current.props.event).toBe(event.nativeEvent);
  });

  it('close and onDidDismiss close the popover', () => {
    const { result } = renderHook(() => usePopover());

    act(() => result.current.open(clickEvent()));
    act(() => result.current.close());
    expect(result.current.props.isOpen).toBe(false);

    act(() => result.current.open(clickEvent()));
    act(() => result.current.props.onDidDismiss());
    expect(result.current.props.isOpen).toBe(false);
  });
});
