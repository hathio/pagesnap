#!/usr/bin/env node
import { startProxy, stopProxy, parseProxyOptions } from './proxy.js';

function printUsage() {
  console.log(`Usage: pagesnap proxy [options]

Options:
  --port <n>          Port to listen on (default: random)
  --block <pattern>   Block URLs matching pattern (repeatable)
  --allow <pattern>   Only allow URLs matching pattern (repeatable)
  --rewrite <from=to> Rewrite rule applied to request URLs (repeatable)
  --header <k=v>      Inject response header (repeatable)
  --help              Show this help
`);
}

export function parseArgs(argv = process.argv.slice(2)) {
  const args = { port: 0, blockList: [], allowList: [], rewriteRules: [], headers: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help') { printUsage(); process.exit(0); }
    else if (a === '--port') args.port = Number(argv[++i]);
    else if (a === '--block') args.blockList.push(argv[++i]);
    else if (a === '--allow') args.allowList.push(argv[++i]);
    else if (a === '--rewrite') {
      const [pattern, replacement = ''] = (argv[++i] || '').split('=');
      args.rewriteRules.push({ pattern, replacement });
    } else if (a === '--header') {
      const [k, ...rest] = (argv[++i] || '').split('=');
      args.headers[k] = rest.join('=');
    }
  }
  return args;
}

export async function runProxyCli(argv) {
  const args = parseArgs(argv);
  const options = parseProxyOptions(args);
  const handle = await startProxy(options);
  console.log(`proxy listening on http://127.0.0.1:${handle.port}`);
  if (options.blockList.length) console.log(`  blocking: ${options.blockList.join(', ')}`);
  if (options.allowList.length) console.log(`  allowing: ${options.allowList.join(', ')}`);
  if (options.rewriteRules.length) console.log(`  rewrite rules: ${options.rewriteRules.length}`);

  const shutdown = async () => {
    console.log('\nstopping proxy...');
    await stopProxy(handle);
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

if (process.argv[1] && process.argv[1].endsWith('proxy-cli.js')) {
  runProxyCli(process.argv.slice(2)).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
