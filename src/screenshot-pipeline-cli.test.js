import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';

// Unit-level tests for parseArgs logic extracted inline
function parseArgs(argv) {
  const args = { urls: [], viewport: null, format: 'png', throttle: {}, dryRun: false };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === '--viewport') { args.viewport = argv[++i]; }
    else if (arg === '--format') { args.format = argv[++i]; }
    else if (arg === '--throttle') { args.throttle = { delayMs: Number(argv[++i]) }; }
    else if (arg === '--dry-run') { args.dryRun = true; }
    else if (!arg.startsWith('--')) { args.urls.push(arg); }
    i++;
  }
  return args;
}

describe('screenshot-pipeline-cli parseArgs', () => {
  it('parses a URL', () => {
    const args = parseArgs(['http://example.com']);
    expect(args.urls).toEqual(['http://example.com']);
  });

  it('parses --viewport', () => {
    const args = parseArgs(['http://example.com', '--viewport', '1280x800']);
    expect(args.viewport).toBe('1280x800');
  });

  it('parses --format', () => {
    const args = parseArgs(['http://example.com', '--format', 'jpeg']);
    expect(args.format).toBe('jpeg');
  });

  it('parses --throttle as number', () => {
    const args = parseArgs(['http://example.com', '--throttle', '200']);
    expect(args.throttle.delayMs).toBe(200);
  });

  it('parses --dry-run flag', () => {
    const args = parseArgs(['http://example.com', '--dry-run']);
    expect(args.dryRun).toBe(true);
  });

  it('collects multiple URLs', () => {
    const args = parseArgs(['http://a.com', 'http://b.com']);
    expect(args.urls).toHaveLength(2);
  });

  it('defaults dryRun to false', () => {
    const args = parseArgs([]);
    expect(args.dryRun).toBe(false);
  });
});
