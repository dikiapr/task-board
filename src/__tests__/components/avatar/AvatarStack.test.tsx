import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AvatarStack from '../../../components/avatar/AvatarStack';

describe('AvatarStack', () => {
  it('renders nothing when no member is valid', () => {
    const { container } = render(<AvatarStack memberIds={['unknown']} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows at most `max` avatars and the rest as +N', () => {
    render(<AvatarStack memberIds={['m1', 'm2', 'm3', 'm4']} max={2} />);
    expect(screen.getByLabelText('Andi Pratama')).toBeInTheDocument();
    expect(screen.getByLabelText('Budi Santoso')).toBeInTheDocument();
    expect(screen.queryByLabelText('Citra Lestari')).not.toBeInTheDocument();

    const more = screen.getByText('+2');
    expect(more).toHaveAttribute('title', 'Citra Lestari, Dewi Anggraini');
  });

  it('does not show +N when members do not exceed max', () => {
    render(<AvatarStack memberIds={['m1', 'm2']} max={3} />);
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });
});
