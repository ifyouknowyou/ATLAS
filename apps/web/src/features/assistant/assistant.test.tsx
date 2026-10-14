import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AssistantWorkspace } from './AssistantWorkspace';

jest.mock('@/features/scenes/AtlasScene', () => ({
  AtlasScene: () => <div data-testid="atlas-scene" />,
}));

interface TestMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  sources: Array<{ kind: string; id: string; title: string }> | null;
  createdAt: string;
}

const seededMessages: TestMessage[] = [
  { id: 'm0', role: 'USER', content: 'Earlier question', sources: null, createdAt: '' },
  { id: 'm1', role: 'ASSISTANT', content: 'Earlier answer', sources: [], createdAt: '' },
];

const chatMutate = jest.fn(async () => {
  seededMessages.push({
    id: 'm2',
    role: 'ASSISTANT',
    content: 'A grounded analytical answer.',
    sources: [{ kind: 'ENTITY', id: 'e1', title: 'Mario Rossi' }],
    createdAt: '',
  });
  return {
    reply: 'A grounded analytical answer.',
    sources: [{ kind: 'ENTITY', id: 'e1', title: 'Mario Rossi' }],
    messageId: 'm2',
  };
});

const summarizeMutate = jest.fn(async () => ({
  summary: {
    overview: 'A probe.',
    keyEntities: ['Mario Rossi'],
    keyRelationships: [],
    evidenceHighlights: [],
    openQuestions: ['Who funded it?'],
  },
  sources: [],
}));

jest.mock('@/lib/queries', () => ({
  useAiChat: () => ({
    mutateAsync: chatMutate,
    isPending: false,
    isError: false,
    error: null,
  }),
  useAiSummarize: () => ({
    mutateAsync: summarizeMutate,
    isPending: false,
    isError: false,
    error: null,
  }),
  useAiMessages: () => ({
    data: [...seededMessages],
    isLoading: false,
  }),
  useInvestigations: () => ({
    data: { items: [{ id: 'inv1', title: 'Probe case' }], total: 1 },
    isLoading: false,
  }),
}));

describe('AssistantWorkspace', () => {
  it('renders persisted conversation history', () => {
    render(<AssistantWorkspace />);
    expect(screen.getByText('Earlier question')).toBeInTheDocument();
    expect(screen.getByText('Earlier answer')).toBeInTheDocument();
  });

  it('sends a message and renders the reply plus sources', async () => {
    render(<AssistantWorkspace />);
    const textarea = screen.getByLabelText('Assistant message');
    fireEvent.change(textarea, { target: { value: 'Who is Mario Rossi?' } });
    fireEvent.submit(textarea.closest('form')!);

    await waitFor(() => {
      expect(chatMutate).toHaveBeenCalledWith({
        message: 'Who is Mario Rossi?',
        history: [
          { role: 'USER', content: 'Earlier question' },
          { role: 'ASSISTANT', content: 'Earlier answer' },
        ],
      });
    });
    await waitFor(() => {
      expect(screen.getByText('A grounded analytical answer.')).toBeInTheDocument();
      expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    });
  });

  it('shows the investigation picker and summary generator', () => {
    render(<AssistantWorkspace />);
    expect(screen.getByLabelText('Investigation context')).toBeInTheDocument();
    expect(screen.getByText('GENERATE')).toBeInTheDocument();
  });
});
