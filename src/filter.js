// filter snapshots by url pattern, label, or date range

function matchesPattern(url, pattern) {
  if (!pattern) return true;
  if (pattern instanceof RegExp) return pattern.test(url);
  return url.includes(pattern);
}

function filterSnapshots(snapshots, opts = {}) {
  const { pattern, label, since, until } = opts;
  return snapshots.filter((snap) => {
    if (pattern && !matchesPattern(snap.url, pattern)) return false;
    if (label && snap.label !== label) return false;
    if (since || until) {
      const ts = new Date(snap.timestamp).getTime();
      if (since && ts < new Date(since).getTime()) return false;
      if (until && ts > new Date(until).getTime()) return false;
    }
    return true;
  });
}

function parseFilterArgs(args = {}) {
  const opts = {};
  if (args.pattern) {
    opts.pattern = args.pattern.startsWith('/')
      ? new RegExp(args.pattern.slice(1, args.pattern.lastIndexOf('/')))
      : args.pattern;
  }
  if (args.label) opts.label = args.label;
  if (args.since) opts.since = args.since;
  if (args.until) opts.until = args.until;
  return opts;
}

module.exports = { filterSnapshots, parseFilterArgs, matchesPattern };
