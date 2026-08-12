import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EvidenceDropzone } from './EvidenceDropzone';

jest.mock('@/lib/queries', () => ({
  useUploadEvidence: () => ({
    isPending: false,
    mutate: (vars: { file: File; fields: Record<string, string> }, opts?: { onSuccess?: (d: { id: string }) => void }) => {
      if (opts?.onSuccess) opts.onSuccess({ id: 'ev-new' });
    },
  }),
}));

jest.mock('@/lib/auth-store', () => ({
  useAuth: (selector: (s: { has: (p: string) => boolean }) => unknown) =>
    selector({ has: (p: string) => p === 'evidence.create' }),
}));

describe('EvidenceDropzone', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the upload affordance for permitted users', () => {
    render(<EvidenceDropzone />);
    expect(screen.getByText(/DROP EVIDENCE OR CLICK TO BROWSE/i)).toBeTruthy();
  });

  it('shows a size rejection inline for oversized files', async () => {
    render(<EvidenceDropzone />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const big = new File([new ArrayBuffer(26 * 1024 * 1024)], 'big.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [big] } });
    await waitFor(() => expect(screen.getByText(/exceeds 25 MiB/i)).toBeTruthy());
  });

  it('calls onUploaded after a successful upload', async () => {
    const onUploaded = jest.fn();
    render(<EvidenceDropzone onUploaded={onUploaded} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['%PDF-1.4'], 'small.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith('ev-new'));
  });
});
