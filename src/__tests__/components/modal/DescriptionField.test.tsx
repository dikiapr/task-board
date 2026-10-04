import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DescriptionField from '../../../components/modal/DescriptionField';

describe('DescriptionField', () => {
  it('shows the value and sends edits to onChange', async () => {
    const onChange = vi.fn();
    render(<DescriptionField value="Draft" onChange={onChange} />);
    const textarea = screen.getByRole('textbox', { name: 'Description' });
    expect(textarea).toHaveValue('Draft');

    await userEvent.type(textarea, '!');
    expect(onChange).toHaveBeenCalledWith('Draft!');
  });
});
