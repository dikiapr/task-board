import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { add } from 'ionicons/icons';
import Button from '../../../components/button/Button';

describe('Button', () => {
  it('applies the variant class', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('k-btn', 'k-btn--danger');
  });

  it('defaults to type "button" and can be "submit"', () => {
    render(
      <>
        <Button variant="soft">Discard</Button>
        <Button variant="primary" type="submit">
          Save
        </Button>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Discard' })).toHaveAttribute('type', 'button');
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit');
  });

  it('adds the block class and extra className', () => {
    render(
      <Button variant="ghost" block className="is-active">
        Filter
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Filter' })).toHaveClass('k-btn--block', 'is-active');
  });

  it('renders an icon only when the icon prop is set', () => {
    const { container, rerender } = render(<Button variant="soft">Add</Button>);
    expect(container.querySelector('ion-icon')).toBeNull();

    rerender(
      <Button variant="soft" icon={add}>
        Add
      </Button>,
    );
    expect(container.querySelector('ion-icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('calls onClick unless disabled', async () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button variant="primary" onClick={onClick}>
        Save
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button variant="primary" onClick={onClick} disabled>
        Save
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
