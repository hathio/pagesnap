import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {
  parseProxyOptions,
  applyRewriteRules,
  isBlocked,
  startProxy,
  stopProxy,
} from './proxy.js';

describe('parseProxyOptions', () => {
  it('returns defaults for empty input', () => {
    const opts = parseProxyOptions();
    assert.equal(opts.port, 0);
    assert.deepEqual(opts.headers, {});
    assert.deepEqual(opts.blockList, []);
    assert.deepEqual(opts.allowList, []);
    assert.deepEqual(opts.rewriteRules, []);
  });

  it('preserves provided values', () => {
    const opts = parseProxyOptions({ port: 9090, blockList: ['ads.example.com'] });
    assert.equal(opts.port, 9090);
    assert.deepEqual(opts.blockList, ['ads.example.com']);
  });
});

describe('applyRewriteRules', () => {
  it('replaces matching patterns', () => {
    const result = applyRewriteRules('http://old.host/page', [
      { pattern: 'old.host', replacement: 'new.host' },
    ]);
    assert.equal(result, 'http://new.host/page');
  });

  it('returns url unchanged when no rules match', () => {
    const result = applyRewriteRules('http://example.com/', []);
    assert.equal(result, 'http://example.com/');
  });
});

describe('isBlocked', () => {
  it('blocks urls matching blockList', () => {
    assert.ok(isBlocked('http://ads.example.com/', ['ads.example.com'], []));
  });

  it('allows urls not in blockList', () => {
    assert.ok(!isBlocked('http://safe.com/', ['ads.example.com'], []));
  });

  it('blocks urls not in allowList when allowList is set', () => {
    assert.ok(isBlocked('http://other.com/', [], ['safe.com']));
  });

  it('allows urls in allowList', () => {
    assert.ok(!isBlocked('http://safe.com/page', [], ['safe.com']));
  });
});

describe('startProxy / stopProxy', () => {
  let handle;

  after(async () => {
    if (handle) await stopProxy(handle);
  });

  it('starts a proxy server on a random port', async () => {
    handle = await startProxy({ headers: { 'x-test': '1' } });
    assert.ok(handle.port > 0);
    assert.ok(handle.server);
  });

  it('responds with rewritten url header', async () => {
    const result = await new Promise((resolve, reject) => {
      const req = http.get(`http://127.0.0.1:${handle.port}/hello`, (res) => {
        resolve(res.headers);
      });
      req.on('error', reject);
    });
    assert.equal(result['x-proxy-url'], '/hello');
    assert.equal(result['x-test'], '1');
  });
});
