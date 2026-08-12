import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentComposer } from './CommentComposer';

const mockCreate = jest.fn((_vars: unknown, opts?: { onSuccess?: () => void }) => {
  opts?.onSuccess?.();
});
const mockReply = jest.fn((_vars: unknown, opts?: { onSuccess?: () => void }) => {
  opts?.onSuccess?.();
});

jest.mock('@/lib/queries', () => ({
  useComments: () => ({
    data: [
      {
        id: 'c1',
        authorId: 'u1',
        body: '<script>window.__x=1</script>hello',
        createdAt: '2026-01-01T00:00:00Z',
        author: { id: 'u1', displayName: 'Analyst' },
        replies: [],
      },
    ],
  }),
  useCreateComment: () => ({ mutate: mockCreate }),
  useReplyToComment: () => ({ mutate: mockReply }),
}));

jest.mock('@/lib/api-client', () => ({
  ApiError: class extends Error {},
}));

describe('CommentComposer', () => {
  beforeEach(() => {
    mockCreate.mockClear();
    mockReply.mockClear();
  });

  it('renders existing comments as text, not HTML', () => {
    render(<CommentComposer targetType="EVIDENCE" targetId="ev1" />);
    // The stored <script> must appear as literal text, never executed.
    expect(screen.getByText(/<script>window\.__x=1<\/script>hello/)).toBeTruthy();
  });

  it('submits a new comment', async () => {
    render(<CommentComposer targetType="EVIDENCE" targetId="ev1" />);
    fireEvent.change(screen.getByLabelText('Comment body'), {
      target: { value: 'new observation' },
    });
    fireEvent.click(screen.getByText('COMMENT'));
    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
  });

  it('creates a reply from the reply affordance', async () => {
    render(<CommentComposer targetType="EVIDENCE" targetId="ev1" />);
    fireEvent.click(screen.getByText('REPLY'));
    const replyInput = screen.getByPlaceholderText('Reply…');
    fireEvent.change(replyInput, { target: { value: 'agreed' } });
    fireEvent.click(screen.getByText('SEND'));
    await waitFor(() => expect(mockReply).toHaveBeenCalled());
  });
});
