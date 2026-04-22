import { parseViewport, resolveViewports } from './viewport.js';
import { parseFormat, buildScreenshotOptions } from './screenshot-format.js';
import { parseMasks } from './mask.js';
import { applyTimeouts } from './timeout.js';
import { parseThrottleOptions, sleep } from './throttle.js';

/**
 * Build a unified pipeline config from raw CLI/config options.
 */
export function buildPipelineConfig(opts = {}) {
  const viewports = resolveViewports(opts.viewports || opts.viewport);
  const format = parseFormat(opts.format || 'png');
  const masks = parseMasks(opts.masks || []);
  const timeouts = applyTimeouts(opts.timeouts || {});
  const throttle = parseThrottleOptions(opts.throttle || {});

  return { viewports, format, masks, timeouts, throttle };
}

/**
 * Run the screenshot pipeline for a single URL across all configured viewports.
 * Returns array of { viewport, screenshotPath, meta }.
 */
export async function runPipeline(url, pipelineConfig, capturefn) {
  const { viewports, format, masks, timeouts, throttle } = pipelineConfig;
  const screenshotOptions = buildScreenshotOptions(format, { masks, timeouts });
  const results = [];

  for (const viewport of viewports) {
    if (throttle.delayMs > 0) {
      await sleep(throttle.delayMs);
    }

    const result = await captureWithRetry(url, viewport, screenshotOptions, capturefn, timeouts);
    results.push(result);
  }

  return results;
}

async function captureWithRetry(url, viewport, screenshotOptions, capturefn, timeouts) {
  const deadline = Date.now() + (timeouts.total || 30000);
  let lastErr;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (Date.now() > deadline) break;
    try {
      const screenshotPath = await capturefn(url, viewport, screenshotOptions);
      return { viewport, screenshotPath, meta: { attempt, url } };
    } catch (err) {
      lastErr = err;
      await sleep(500 * (attempt + 1));
    }
  }

  throw lastErr || new Error(`Failed to capture ${url}`);
}

/**
 * Describe the pipeline configuration for logging.
 */
export function describePipeline(config) {
  const { viewports, format, masks, throttle } = config;
  return [
    `viewports: ${viewports.map(v => `${v.width}x${v.height}`).join(', ')}`,
    `format: ${format.type}`,
    `masks: ${masks.length}`,
    `throttle: ${throttle.delayMs}ms`,
  ].join(' | ');
}
