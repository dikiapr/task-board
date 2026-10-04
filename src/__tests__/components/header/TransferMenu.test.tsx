import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TransferMenu from '../../../components/header/TransferMenu';

const renderMenu = () => {
  const handlers = { onExport: vi.fn(), onImport: vi.fn() };
  const view = render(<TransferMenu {...handlers} />);
  return { ...handlers, ...view };
};

describe('TransferMenu', () => {
  it('"Export as JSON" calls onExport', async () => {
    const { onExport } = renderMenu();
    await userEvent.click(screen.getByRole('button', { name: 'Export / Import' }));
    await userEvent.click(await screen.findByText('Export as JSON'));
    expect(onExport).toHaveBeenCalledWith('json');
  });

  it('"Export as CSV" calls onExport with csv', async () => {
    const { onExport } = renderMenu();
    await userEvent.click(screen.getByRole('button', { name: 'Export / Import' }));
    await userEvent.click(await screen.findByText('Export as CSV'));
    expect(onExport).toHaveBeenCalledWith('csv');
  });

  it('passes the file chosen for import to onImport', () => {
    const { onImport, container } = renderMenu();
    const file = new File(['{}'], 'board.json', { type: 'application/json' });
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [file] } });
    expect(onImport).toHaveBeenCalledWith(file);
  });
});
