import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import InviteMenu from '../../../components/header/InviteMenu';
import { nextPresent } from '../../fixtures';

const renderMenu = () => {
  const onInvite = vi.fn();
  render(<InviteMenu onInvite={onInvite} />);
  return { onInvite };
};

describe('InviteMenu', () => {
  const openInvite = async () => {
    const shown = nextPresent();
    await userEvent.click(screen.getByRole('button', { name: 'Invite' }));
    await shown;
    const input = screen.getByRole('textbox', { name: 'Email to invite' });
    const form = input.closest('form')!;
    return { input, submit: within(form).getByRole('button', { name: 'Invite' }) };
  };

  it('lists the team members', async () => {
    renderMenu();
    await openInvite();
    expect(screen.getByText('Team members')).toBeInTheDocument();
    expect(screen.getByText('Fajar Nugroho')).toBeInTheDocument();
  });

  it('disables Invite for an invalid email', async () => {
    renderMenu();
    const { input, submit } = await openInvite();
    await userEvent.type(input, 'bukan-email');
    expect(submit).toBeDisabled();
  });

  it('sends a valid email, trimmed', async () => {
    const { onInvite } = renderMenu();
    const { input, submit } = await openInvite();
    await userEvent.type(input, '  budi@company.com ');
    await userEvent.click(submit);
    expect(onInvite).toHaveBeenCalledWith('budi@company.com');
  });
});
