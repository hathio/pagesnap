import { setTimeout as sleep } from 'node:timers/promises';

const DEFAULT_RETRIES = 3;
const DEFAULT_DELAY_MS = 500;
const DEFAULT_BACKOFF = 2;

export async function withRetry(fn, options = {}) {
  const {
    retries = DEFAULT_RETRIES,
    delayMs = DEFAULT_DELAY_MS,
    backoff = DEFAULT_BACKOFF,
    onRetry = null,
  } = options;

  let attempt = 0;
  let delay = delayMs;

  while (true) {
    try {
      return await fn(attempt);
    } catch (err) {
      if (attempt >= retries) throw err;
      if (onRetry) onRetry({ attempt, err, delay });
      await sleep(delay);
      delay = Math.round(delay * backoff);
      attempt++;
    }
  }
}

export function buildRetryOptions(config = {}) {
  return {
    retries: config.retries ?? DEFAULT_RETRIES,
    delayMs: config.retryDelayMs ?? DEFAULT_DELAY_MS,
    backoff: config.retryBackoff ?? DEFAULT_BACKOFF,
  };
}
