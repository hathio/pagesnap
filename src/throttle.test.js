const { parseThrottleOptions, runThrottled, describeThrottle, sleep } = require('./throttle');

describe('parseThrottleOptions', () => {
  test('defaults when empty', () => {
    const opts = parseThrottleOptions();
    expect(opts.concurrency).toBe(3);
    expect(opts.delayMs).toBe(0);
  });

  test('parses concurrency and delayMs', () => {
    const opts = parseThrottleOptions({ concurrency: '5', delayMs: '200' });
    expect(opts.concurrency).toBe(5);
    expect(opts.delayMs).toBe(200);
  });

  test('accepts delay alias', () => {
    const opts = parseThrottleOptions({ delay: 100 });
    expect(opts.delayMs).toBe(100);
  });

  test('clamps concurrency to minimum 1', () => {
    const opts = parseThrottleOptions({ concurrency: 0 });
    expect(opts.concurrency).toBe(1);
  });

  test('clamps delayMs to minimum 0', () => {
    const opts = parseThrottleOptions({ delayMs: -50 });
    expect(opts.delayMs).toBe(0);
  });
});

describe('runThrottled', () => {
  test('runs all tasks and returns results', async () => {
    const tasks = [1, 2, 3].map((n) => () => Promise.resolve(n * 10));
    const results = await runThrottled(tasks, { concurrency: 2 });
    expect(results).toHaveLength(3);
    expect(results.map((r) => r.value)).toEqual([10, 20, 30]);
    expect(results.every((r) => r.status === 'fulfilled')).toBe(true);
  });

  test('captures rejections without throwing', async () => {
    const tasks = [
      () => Promise.resolve('ok'),
      () => Promise.reject(new Error('boom')),
      () => Promise.resolve('also ok'),
    ];
    const results = await runThrottled(tasks, { concurrency: 2 });
    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('rejected');
    expect(results[1].reason.message).toBe('boom');
    expect(results[2].status).toBe('fulfilled');
  });

  test('respects concurrency limit', async () => {
    let active = 0;
    let maxActive = 0;
    const tasks = Array.from({ length: 6 }, () => async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await sleep(10);
      active--;
    });
    await runThrottled(tasks, { concurrency: 2 });
    expect(maxActive).toBeLessThanOrEqual(2);
  });

  test('handles empty task list', async () => {
    const results = await runThrottled([]);
    expect(results).toEqual([]);
  });
});

describe('describeThrottle', () => {
  test('no delay', () => {
    expect(describeThrottle({ concurrency: 3, delayMs: 0 })).toBe('concurrency=3');
  });

  test('with delay', () => {
    expect(describeThrottle({ concurrency: 5, delayMs: 150 })).toBe('concurrency=5, delay=150ms');
  });
});
