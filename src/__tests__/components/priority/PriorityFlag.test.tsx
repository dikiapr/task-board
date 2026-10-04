import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PriorityFlag from '../../../components/priority/PriorityFlag';
import { PRIORITY_COLORS } from '../../../data/constants';

describe('PriorityFlag', () => {
  it('labels the flag with the priority and uses its color', () => {
    render(<PriorityFlag priority="High" />);
    const flag = screen.getByLabelText('High priority');
    expect(flag).toHaveAttribute('title', 'High priority');
    expect(flag).toHaveStyle({ color: PRIORITY_COLORS.High });
  });
});
