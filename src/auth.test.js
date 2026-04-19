import fs from 'fs';
import path from 'path';
import os from 'os';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generateToken,
  writeToken,
  readToken,
  validateToken,
  authMiddleware
} from './auth.js';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-auth-'));
}

describe('auth', () => {
  let tmpDir;

  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it('generateToken returns a 48-char hex string', () => {
    const token = generateToken();
    expect(token).toMatch(/^[a-f0-9]{48}$/);
  });

  it('writeToken and readToken round-trip', () => {
    const token = generateToken();
    writeToken(token, tmpDir);
    expect(readToken(tmpDir)).toBe(token);
  });

  it('readToken returns null when no token file exists', () => {
    expect(readToken(tmpDir)).toBeNull();
  });

  it('validateToken returns true for correct token', () => {
    const token = generateToken();
    writeToken(token, tmpDir);
    expect(validateToken(token, tmpDir)).toBe(true);
  });

  it('validateToken returns false for wrong token', () => {
    const token = generateToken();
    writeToken(token, tmpDir);
    expect(validateToken('wrongtoken', tmpDir)).toBe(false);
  });

  it('authMiddleware passes when no token file exists', () => {
    const mw = authMiddleware(tmpDir);
    const next = { called: false };
    mw({}, {}, () => { next.called = true; });
    expect(next.called).toBe(true);
  });

  it('authMiddleware rejects missing token header', () => {
    const token = generateToken();
    writeToken(token, tmpDir);
    const mw = authMiddleware(tmpDir);
    const res = { statusCode: null, ended: '' };
    res.end = (body) => { res.ended = body; };
    mw({ headers: {} }, res, () => {});
    expect(res.statusCode).toBe(401);
  });
});
