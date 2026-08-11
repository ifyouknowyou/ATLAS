import { JobQueueService } from './job-queue.service';

const row = {
  id: 'job-1',
  kind: 'EVIDENCE_TEXT_EXTRACTION',
  status: 'QUEUED',
  attempts: 0,
  maxAttempts: 3,
  payload: { evidenceId: 'ev1' },
};

function makeDb(overrides: Record<string, unknown> = {}) {
  const jobs: Array<Record<string, unknown>> = [];
  return {
    backgroundJob: {
      findUnique: jest.fn(async ({ where }) => {
        const key = where?.kind_dedupeKey;
        if (!key) return null;
        return jobs.find((j) => j.kind === key.kind && j.dedupeKey === key.dedupeKey) ?? null;
      }),
      findFirst: jest.fn(async () => jobs.find((j) => j.status === 'QUEUED') ?? null),
      create: jest.fn(async (args: { data: Record<string, unknown> }) => {
        const j = { ...row, ...args.data, id: `job-${jobs.length + 1}` };
        jobs.push(j);
        return j;
      }),
      update: jest.fn(async (args: { where: { id: string }; data: Record<string, unknown> }) => {
        const idx = jobs.findIndex((j) => j.id === args.where.id);
        if (idx !== -1) jobs[idx] = { ...jobs[idx], ...args.data };
        return jobs[idx];
      }),
      findMany: jest.fn(async () => jobs),
    },
    $transaction: jest.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn({ backgroundJob: {} })),
    ...overrides,
  };
}

function makeQueue(db: unknown) {
  return new JobQueueService(
    db as never,
    { jobsPollIntervalMs: 50, storageDir: '/tmp', maxUploadMb: 5, signedUrlTtlS: 120 } as never,
  );
}

describe('JobQueueService', () => {
  it('enqueues idempotently with a dedupe key', async () => {
    const db = makeDb();
    const queue = makeQueue(db);
    const first = await queue.enqueue({
      kind: 'EVIDENCE_TEXT_EXTRACTION',
      payload: { evidenceId: 'ev1' },
      organizationId: 'org1',
      dedupeKey: 'EVIDENCE_TEXT_EXTRACTION:ev1',
    });
    const second = await queue.enqueue({
      kind: 'EVIDENCE_TEXT_EXTRACTION',
      payload: { evidenceId: 'ev1' },
      organizationId: 'org1',
      dedupeKey: 'EVIDENCE_TEXT_EXTRACTION:ev1',
    });
    expect(second.created).toBe(false);
    expect(first.created).toBe(true);
  });

  it('rejects duplicates via unique constraint', async () => {
    const conflicting = {
      code: 'P2002',
    };
    const db = makeDb();
    db.backgroundJob.create = jest.fn().mockRejectedValue(conflicting);
    db.backgroundJob.findUnique = jest.fn().mockResolvedValue({ id: 'existing' });
    const queue = makeQueue(db);
    const result = await queue.enqueue({
      kind: 'EVIDENCE_OCR',
      payload: { evidenceId: 'ev1' },
      organizationId: 'org1',
      dedupeKey: 'EVIDENCE_OCR:ev1',
    });
    expect(result).toEqual({ id: 'existing', created: false });
  });

  it('claims a job atomically', async () => {
    const db = makeDb();
    db.backgroundJob.findFirst = jest.fn().mockResolvedValue(row);
    db.$transaction = jest.fn(async (fn) => {
      const tx = {
        backgroundJob: {
          findFirst: jest.fn().mockResolvedValue(row),
          update: jest.fn().mockResolvedValue(row),
        },
      };
      return fn(tx);
    });
    const queue = makeQueue(db);
    const claimed = await queue.claimNext('worker-1');
    expect(claimed?.id).toBe('job-1');
  });

  it('fails a job permanently after max attempts', async () => {
    const db = makeDb();
    db.backgroundJob.findUnique = jest.fn().mockResolvedValue({
      ...row,
      attempts: 2,
      maxAttempts: 3,
    });
    const queue = makeQueue(db);
    await queue.fail('job-1', 'boom');
    const update = db.backgroundJob.update as jest.Mock;
    expect(update.mock.calls[0][0].data.status).toBe('FAILED');
  });

  it('requeues with backoff when attempts remain', async () => {
    const db = makeDb();
    db.backgroundJob.findUnique = jest.fn().mockResolvedValue({
      ...row,
      attempts: 0,
      maxAttempts: 3,
    });
    const queue = makeQueue(db);
    await queue.fail('job-1', 'try again', true);
    const update = db.backgroundJob.update as jest.Mock;
    expect(update.mock.calls[0][0].data.status).toBe('QUEUED');
    expect(update.mock.calls[0][0].data.scheduledAt).toBeInstanceOf(Date);
  });
});