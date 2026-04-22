import { describe, it, expect, vi } from 'vitest';
import { buildPipelineConfig, runPipeline, describePipeline } from './screenshot-pipeline.js';

describe('buildPipelineConfig', () => {
  it('returns defaults when no options given', () => {
    const cfg = buildPipelineConfig({});
    expect(cfg.viewports).toBeDefined();
    expect(cfg.format).toBeDefined();
    expect(cfg.masks).toEqual([]);
    expect(cfg.timeouts).toBeDefined();
    expect(cfg.throttle).toBeDefined();
  });

  it('passes through viewport string', () => {
    const cfg = buildPipelineConfig({ viewport: '1280x800' });
    expect(cfg.viewports.some(v => v.width === 1280 && v.height === 800)).toBe(true);
  });

  it('respects format option', () => {
    const cfg = buildPipelineConfig({ format: 'jpeg' });
    expect(cfg.format.type).toBe('jpeg');
  });
});

describe('runPipeline', () => {
  it('calls capturefn for each viewport', async () => {
    const cfg = buildPipelineConfig({ viewport: '800x600' });
    const captureStub = vi.fn().mockResolvedValue('/tmp/shot.png');

    const results = await runPipeline('http://example.com', cfg, captureStub);
    expect(captureStub).toHaveBeenCalledTimes(cfg.viewports.length);
    expect(results[0].screenshotPath).toBe('/tmp/shot.png');
  });

  it('retries on failure and eventually throws', async () => {
    const cfg = buildPipelineConfig({ viewport: '800x600', throttle: { delayMs: 0 } });
    const captureStub = vi.fn().mockRejectedValue(new Error('boom'));

    await expect(runPipeline('http://example.com', cfg, captureStub)).rejects.toThrow('boom');
    expect(captureStub.mock.calls.length).toBeGreaterThan(1);
  });

  it('returns meta with url and attempt', async () => {
    const cfg = buildPipelineConfig({ viewport: '1024x768' });
    const captureStub = vi.fn().mockResolvedValue('/out/img.png');

    const results = await runPipeline('http://test.dev', cfg, captureStub);
    expect(results[0].meta.url).toBe('http://test.dev');
    expect(results[0].meta.attempt).toBe(0);
  });
});

describe('describePipeline', () => {
  it('returns a readable string', () => {
    const cfg = buildPipelineConfig({ viewport: '1280x800', format: 'png' });
    const desc = describePipeline(cfg);
    expect(desc).toContain('viewports');
    expect(desc).toContain('format');
    expect(desc).toContain('masks');
    expect(desc).toContain('throttle');
  });
});
