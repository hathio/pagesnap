import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { withRetry, buildRetryOptions } from './retry.js';

describe('withRetry', () => {
  it('resolves immediately on success', async () => {
    const result = await withRetry(async () => 42);
    assert.equal(result, 42);
  });

  it('retries on failure and eventually resolves', async () => {
    let calls = 0;
    const result = await withRetry(async () => {
      calls++;
      if (calls < 3) throw new Error('fail');
      return 'ok';
    }, { retries: 3, delayMs: 0 });
    assert.equal(result, 'ok');
    assert.equal(calls, 3);
  });

  it('throws after exhausting retries', async () => {
    let calls = 0;
    await assert.rejects(
      () => withRetry(async () => { calls++; throw new Error('boom'); }, { retries: 2, delayMs: 0 }),
      /boom/
    );
    assert.equal(calls, 3);
  });

  it('calls onRetry with attempt info', async () => {
    const events = [];
    await withRetry(
      async (attempt) => { if (attempt < 2) throw new Error('x'); return true; },
      { retries: 3, delayMs: 0, onRetry: (info) => events.push(info.attempt) }
    );
    assert.deepEqual(events, [0, 1]);
  });
});

describe('buildRetryOptions', () => {
  it('returns defaults for empty config', () => {
    const opts = buildRetryOptions({});
    assert.equal(opts.retries, 3);
    assert.equal(opts.delayMs, 500);
    assert.equal(opts.backoff, 2);
  });

  it('picks up config values', () => {
    const opts = buildRetryOptions({ retries: 5, retryDelayMs: 100, retryBackoff: 1.5 });
    assert.equal(opts.retries, 5);
    assert.equal(opts.delayMs, 100);
    assert.equal(opts.backoff, 1.5);
  });
});
