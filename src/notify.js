const fs = require('fs');
const path = require('path');

async function sendSlackNotification(webhookUrl, message) {
  const { default: fetch } = await import('node-fetch').catch(() => {
    throw new Error('node-fetch not available');
  });
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message }),
  });
  if (!res.ok) throw new Error(`Slack webhook failed: ${res.status}`);
}

function formatDiffSummary(results) {
  const total = results.length;
  const changed = results.filter(r => r.diffPercent > 0).length;
  const failed = results.filter(r => r.error).length;
  const lines = [
    `pagesnap diff complete: ${total} page(s) checked`,
    changed > 0 ? `  ⚠️  ${changed} page(s) changed` : '  ✅ No visual changes',
    failed > 0 ? `  ❌ ${failed} page(s) errored` : null,
  ].filter(Boolean);
  return lines.join('\n');
}

function writeNotifyLog(logPath, results) {
  const entry = {
    timestamp: new Date().toISOString(),
    summary: results.map(r => ({
      url: r.url,
      diffPercent: r.diffPercent ?? null,
      error: r.error ?? null,
    })),
  };
  const existing = fs.existsSync(logPath)
    ? JSON.parse(fs.readFileSync(logPath, 'utf8'))
    : [];
  existing.push(entry);
  fs.writeFileSync(logPath, JSON.stringify(existing, null, 2));
}

async function notify(config, results) {
  const message = formatDiffSummary(results);
  if (config.notify?.slack) {
    await sendSlackNotification(config.notify.slack, message);
  }
  if (config.notify?.logFile) {
    writeNotifyLog(config.notify.logFile, results);
  }
  return message;
}

module.exports = { notify, formatDiffSummary, writeNotifyLog };
