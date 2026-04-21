import fs from 'fs';
import path from 'path';
import os from 'os';
import { loadEnvFile, applyEnvToConfig, listKnownVars, describeEnvVar, validateEnv } from './env.js';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-env-'));
}

test('loadEnvFile returns empty object for missing file', () => {
  const result = loadEnvFile('/nonexistent/.env');
  expect(result).toEqual({});
});

test('loadEnvFile parses key=value pairs', () => {
  const dir = makeTmpDir();
  const envFile = path.join(dir, '.env');
  fs.writeFileSync(envFile, 'PAGESNAP_BASE_URL=http://localhost\nPAGESNAP_TIMEOUT=5000\n');
  const result = loadEnvFile(envFile);
  expect(result.PAGESNAP_BASE_URL).toBe('http://localhost');
  expect(result.PAGESNAP_TIMEOUT).toBe('5000');
});

test('loadEnvFile skips comments and blank lines', () => {
  const dir = makeTmpDir();
  const envFile = path.join(dir, '.env');
  fs.writeFileSync(envFile, '# comment\n\nPAGESNAP_TOKEN=abc123\n');
  const result = loadEnvFile(envFile);
  expect(Object.keys(result)).toEqual(['PAGESNAP_TOKEN']);
  expect(result.PAGESNAP_TOKEN).toBe('abc123');
});

test('loadEnvFile strips quotes from values', () => {
  const dir = makeTmpDir();
  const envFile = path.join(dir, '.env');
  fs.writeFileSync(envFile, 'PAGESNAP_BASE_URL="http://example.com"\n');
  const result = loadEnvFile(envFile);
  expect(result.PAGESNAP_BASE_URL).toBe('http://example.com');
});

test('applyEnvToConfig maps env vars to config fields', () => {
  const config = { baseUrl: '', timeout: 3000 };
  const env = { PAGESNAP_BASE_URL: 'http://prod.example.com', PAGESNAP_TIMEOUT: '8000' };
  const result = applyEnvToConfig(config, env);
  expect(result.baseUrl).toBe('http://prod.example.com');
  expect(result.timeout).toBe(8000);
});

test('applyEnvToConfig does not mutate original config', () => {
  const config = { baseUrl: 'http://original.com' };
  applyEnvToConfig(config, { PAGESNAP_BASE_URL: 'http://new.com' });
  expect(config.baseUrl).toBe('http://original.com');
});

test('listKnownVars returns array of strings', () => {
  const vars = listKnownVars();
  expect(Array.isArray(vars)).toBe(true);
  expect(vars.length).toBeGreaterThan(0);
  expect(vars).toContain('PAGESNAP_BASE_URL');
});

test('describeEnvVar returns description for known var', () => {
  const desc = describeEnvVar('PAGESNAP_BASE_URL');
  expect(typeof desc).toBe('string');
  expect(desc.length).toBeGreaterThan(0);
});

test('describeEnvVar returns null for unknown var', () => {
  expect(describeEnvVar('UNKNOWN_VAR')).toBeNull();
});

test('validateEnv returns warnings for invalid values', () => {
  const warnings = validateEnv({ PAGESNAP_TIMEOUT: 'notanumber', PAGESNAP_VIEWPORT: 'badformat' });
  expect(warnings.length).toBe(2);
});

test('validateEnv returns empty array for valid env', () => {
  const warnings = validateEnv({ PAGESNAP_TIMEOUT: '5000', PAGESNAP_VIEWPORT: '1280x800', PAGESNAP_CONCURRENCY: '4' });
  expect(warnings).toEqual([]);
});
