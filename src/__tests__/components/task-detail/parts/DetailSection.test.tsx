import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DetailSection from '../../../../components/task-detail/parts/DetailSection';

describe('DetailSection', () => {
  it('shows the title as a heading above the content', () => {
    render(
      <DetailSection title="Attachments">
        <p>content</p>
      </DetailSection>,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Attachments' })).toHaveClass('k-detail__heading');
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('renders no heading without a title', () => {
    render(
      <DetailSection>
        <p>content</p>
      </DetailSection>,
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
