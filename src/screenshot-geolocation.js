// screenshot-geolocation.js — set browser geolocation before capture

const DEFAULTS = { accuracy: 100 };

const PRESETS = {
  london: { latitude: 51.5074, longitude: -0.1278, accuracy: 50 },
  'new-york': { latitude: 40.7128, longitude: -74.006, accuracy: 50 },
  tokyo: { latitude: 35.6762, longitude: 139.6503, accuracy: 50 },
  sydney: { latitude: -33.8688, longitude: 151.2093, accuracy: 50 },
  paris: { latitude: 48.8566, longitude: 2.3522, accuracy: 50 },
};

function parseGeolocation(input) {
  if (!input) return null;

  if (typeof input === 'string') {
    const preset = PRESETS[input.toLowerCase()];
    if (preset) return { ...preset };

    // Accept "lat,lng" or "lat,lng,accuracy"
    const parts = input.split(',').map(Number);
    if (parts.length < 2 || parts.some(isNaN)) {
      throw new Error(`Invalid geolocation: "${input}". Use a preset name or "lat,lng[,accuracy]".`);
    }
    const [latitude, longitude, accuracy = DEFAULTS.accuracy] = parts;
    return { latitude, longitude, accuracy };
  }

  if (typeof input === 'object') {
    const { latitude, longitude, accuracy = DEFAULTS.accuracy } = input;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new Error('Geolocation object must have numeric latitude and longitude.');
    }
    return { latitude, longitude, accuracy };
  }

  throw new Error('Geolocation must be a string preset, "lat,lng" string, or object.');
}

function validateGeolocation({ latitude, longitude, accuracy }) {
  if (latitude < -90 || latitude > 90) throw new Error(`Latitude out of range: ${latitude}`);
  if (longitude < -180 || longitude > 180) throw new Error(`Longitude out of range: ${longitude}`);
  if (accuracy < 0) throw new Error(`Accuracy must be non-negative: ${accuracy}`);
}

function buildGeolocationContext(geo) {
  if (!geo) return null;
  validateGeolocation(geo);
  return { latitude: geo.latitude, longitude: geo.longitude, accuracy: geo.accuracy };
}

function describeGeolocation(geo) {
  if (!geo) return 'none';
  return `lat=${geo.latitude}, lng=${geo.longitude}, accuracy=${geo.accuracy}m`;
}

function listPresets() {
  return Object.entries(PRESETS).map(([name, coords]) => ({ name, ...coords }));
}

module.exports = { parseGeolocation, validateGeolocation, buildGeolocationContext, describeGeolocation, listPresets, PRESETS };
