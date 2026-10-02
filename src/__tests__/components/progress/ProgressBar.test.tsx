import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProgressBar from '../../../components/progress/ProgressBar';

describe('ProgressBar', () => {
  it('computes the percentage from done/total', () => {
    render(<ProgressBar done={1} total={3} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '33');
    expect(bar).not.toHaveClass('k-progress--complete');
  });

  it('is 0 when total is 0', () => {
    render(<ProgressBar done={0} total={0} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('gets the complete class when everything is done', () => {
    render(<ProgressBar done={2} total={2} />);
    expect(screen.getByRole('progressbar')).toHaveClass('k-progress--complete');
  });
});
