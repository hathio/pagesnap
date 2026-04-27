// screenshot-timezone.js — timezone emulation for screenshot capture

const PRESETS = {
  utc: { id: 'UTC', label: 'Coordinated Universal Time', offset: 0 },
  'us-east': { id: 'America/New_York', label: 'US Eastern', offset: -300 },
  'us-central': { id: 'America/Chicago', label: 'US Central', offset: -360 },
  'us-west': { id: 'America/Los_Angeles', label: 'US Pacific', offset: -480 },
  london: { id: 'Europe/London', label: 'London', offset: 0 },
  berlin: { id: 'Europe/Berlin', label: 'Central European', offset: 60 },
  tokyo: { id: 'Asia/Tokyo', label: 'Japan Standard', offset: 540 },
  sydney: { id: 'Australia/Sydney', label: 'Australian Eastern', offset: 600 },
  dubai: { id: 'Asia/Dubai', label: 'Gulf Standard', offset: 240 },
  shanghai: { id: 'Asia/Shanghai', label: 'China Standard', offset: 480 },
};

function parseTimezone(input) {
  if (!input) return null;
  const key = String(input).toLowerCase().trim();
  if (PRESETS[key]) return { ...PRESETS[key], preset: key };
  // Accept IANA timezone string directly
  try {
    Intl.DateTimeFormat(undefined, { timeZone: input });
    return { id: input, label: input, offset: null, preset: null };
  } catch {
    throw new Error(`Unknown timezone: "${input}". Use a preset or valid IANA timezone.`);
  }
}

function buildTimezoneContext(tz) {
  if (!tz) return {};
  return { timezoneId: tz.id };
}

function buildTimezoneScript(tz) {
  if (!tz) return '';
  return `
    // Override timezone to ${tz.id}
    Object.defineProperty(Intl, 'DateTimeFormat', {
      value: new Proxy(Intl.DateTimeFormat, {
        construct(target, args) {
          if (args[1]) args[1].timeZone = args[1].timeZone || '${tz.id}';
          else args[1] = { timeZone: '${tz.id}' };
          return new target(...args);
        }
      })
    });
  `.trim();
}

function describeTimezone(tz) {
  if (!tz) return 'no timezone override';
  const preset = tz.preset ? ` (preset: ${tz.preset})` : '';
  const offset = tz.offset !== null ? `, UTC${tz.offset >= 0 ? '+' : ''}${tz.offset / 60}` : '';
  return `${tz.id}${offset}${preset}`;
}

function listPresets() {
  return Object.entries(PRESETS).map(([key, val]) => ({
    key,
    id: val.id,
    label: val.label,
    offset: val.offset,
  }));
}

module.exports = { parseTimezone, buildTimezoneContext, buildTimezoneScript, describeTimezone, listPresets };
