import { HashService } from './hash.service';

describe('HashService', () => {
  const service = new HashService();

  it('computes the SHA-256 of a buffer', () => {
    const digest = service.sha256(Buffer.from('abc'));
    // Known vector for "abc".
    expect(digest).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
  });

  it('produces a stable short digest', () => {
    expect(service.shortDigest('hello')).toBe(service.shortDigest('hello'));
    expect(service.shortDigest('hello')).toMatch(/^[a-f0-9]{16}$/);
  });
});
