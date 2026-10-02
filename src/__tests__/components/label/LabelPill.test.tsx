import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LabelPill from '../../../components/label/LabelPill';

describe('LabelPill', () => {
  it('applies the label class', () => {
    render(<LabelPill label="Bug" />);
    expect(screen.getByText('Bug')).toHaveClass('k-label', 'k-label--bug');
  });
});
