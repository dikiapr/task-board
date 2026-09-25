import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AvatarStack, MemberAvatar } from '../../../components/avatar/Avatar';
import { MEMBERS } from '../../../data/constants';

describe('MemberAvatar', () => {
  it('shows initials, the name as label, and the member color', () => {
    render(<MemberAvatar member={MEMBERS[0]} size="md" />);
    const avatar = screen.getByLabelText('Andi Pratama');
    expect(avatar).toHaveTextContent('AP');
    expect(avatar).toHaveClass('k-avatar', 'k-avatar--md');
    expect(avatar).toHaveStyle({ backgroundColor: MEMBERS[0].color });
  });

  it('defaults to size sm', () => {
    render(<MemberAvatar member={MEMBERS[1]} />);
    expect(screen.getByLabelText('Budi Santoso')).toHaveClass('k-avatar--sm');
  });
});

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
