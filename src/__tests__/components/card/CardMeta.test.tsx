import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { checkboxOutline } from 'ionicons/icons';
import CardMeta from '../../../components/card/CardMeta';

describe('CardMeta', () => {
  it('shows the content with the title as tooltip', () => {
    render(
      <CardMeta icon={checkboxOutline} title="Checklist">
        1/2
      </CardMeta>,
    );
    const meta = screen.getByTitle('Checklist');
    expect(meta).toHaveClass('k-meta');
    expect(meta).toHaveTextContent('1/2');
  });
});
