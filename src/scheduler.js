import { startWatch, stopWatch } from './watch.js';
import { captureAll } from './capture.js';
import { generateReport } from './report.js';

let debounceTimer = null;
const DEBOUNCE_MS = 500;

export function startScheduler(configPath, options = {}) {
  const { debounce = DEBOUNCE_MS, onCycle } = options;

  console.log('[scheduler] starting in watch mode');

  startWatch(configPath, (changedFile) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      console.log(`[scheduler] triggering capture after change: ${changedFile}`);
      try {
        const results = await captureAll(configPath);
        const report = await generateReport(results);
        if (onCycle) onCycle(report);
      } catch (err) {
        console.error('[scheduler] cycle error:', err.message);
      }
    }, debounce);
  });
}

export function stopScheduler() {
  clearTimeout(debounceTimer);
  debounceTimer = null;
  stopWatch();
  console.log('[scheduler] stopped');
}
