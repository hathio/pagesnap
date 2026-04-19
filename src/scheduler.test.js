import { describe, it, expect, vi, afterEach } from 'vitest';
import { startScheduler, stopScheduler } from './scheduler.js';

vi.mock('./watch.js', () => ({
  startWatch: vi.fn(),
  stopWatch: vi.fn(),
}));

vi.mock('./capture.js', () => ({
  captureAll: vi.fn(async () => [{ url: 'http://localhost', file: 'snap.png' }]),
}));

vi.mock('./report.js', () => ({
  generateReport: vi.fn(async (results) => ({ results, diffs: [] })),
}));

describe('scheduler', () => {
  afterEach(() => {
    stopScheduler();
    vi.clearAllMocks();
  });

  it('calls startWatch on start', async () => {
    const { startWatch } = await import('./watch.js');
    startScheduler('pagesnap.config.json');
    expect(startWatch).toHaveBeenCalledWith('pagesnap.config.json', expect.any(Function));
  });

  it('calls stopWatch on stop', async () => {
    const { stopWatch } = await import('./watch.js');
    startScheduler('pagesnap.config.json');
    stopScheduler();
    expect(stopWatch).toHaveBeenCalled();
  });

  it('invokes onCycle callback after debounce', async () => {
    vi.useFakeTimers();
    const { startWatch } = await import('./watch.js');
    const onCycle = vi.fn();

    startScheduler('pagesnap.config.json', { debounce: 100, onCycle });
    const triggerChange = startWatch.mock.calls[0][1];
    triggerChange('src/index.html');

    await vi.runAllTimersAsync();
    expect(onCycle).toHaveBeenCalledWith(expect.objectContaining({ diffs: [] }));
    vi.useRealTimers();
  });
});
