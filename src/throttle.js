// throttle.js — controls concurrency and rate limiting for capture runs

const DEFAULT_CONCURRENCY = 3;
const DEFAULT_DELAY_MS = 0;

/**
 * Parse throttle options from config or CLI args.
 * @param {object} input
 * @returns {{ concurrency: number, delayMs: number }}
 */
function parseThrottleOptions(input = {}) {
  const concurrency = Math.max(1, parseInt(input.concurrency ?? DEFAULT_CONCURRENCY, 10));
  const delayMs = Math.max(0, parseInt(input.delayMs ?? input.delay ?? DEFAULT_DELAY_MS, 10));
  return { concurrency, delayMs };
}

/**
 * Run tasks with bounded concurrency and optional delay between each.
 * @param {Array<() => Promise<any>>} tasks
 * @param {{ concurrency: number, delayMs: number }} options
 * @returns {Promise<Array<{ status: string, value?: any, reason?: any }>>}
 */
async function runThrottled(tasks, options = {}) {
  const { concurrency, delayMs } = parseThrottleOptions(options);
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      try {
        const value = await tasks[i]();
        results[i] = { status: 'fulfilled', value };
      } catch (reason) {
        results[i] = { status: 'rejected', reason };
      }
      if (delayMs > 0 && index < tasks.length) {
        await sleep(delayMs);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Describe throttle settings as a human-readable string.
 */
function describeThrottle({ concurrency, delayMs }) {
  const parts = [`concurrency=${concurrency}`];
  if (delayMs > 0) parts.push(`delay=${delayMs}ms`);
  return parts.join(', ');
}

module.exports = { parseThrottleOptions, runThrottled, describeThrottle, sleep };
