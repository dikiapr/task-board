import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MemberAvatar from '../../../components/avatar/MemberAvatar';
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
