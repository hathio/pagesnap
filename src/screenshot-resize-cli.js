import path from 'path';
import { parseResizeOptions, resizeImage, describeResize } from './screenshot-resize.js';

function printUsage() {
  console.log(`
Usage: pagesnap resize <input> <output> [options]

Options:
  --width <px>       Target width in pixels
  --height <px>      Target height in pixels
  --mode <mode>      Fit mode: cover|contain|fill|inside|outside  (default: cover)
  --background <hex> Background color for contain/inside modes    (default: #ffffff)

Examples:
  pagesnap resize snap.png out.png --width 800
  pagesnap resize snap.png out.png --width 800 --height 600 --mode contain
`.trim());
}

export function parseArgs(argv) {
  const args = argv.slice(2);
  if (args[0] === 'resize' && args[1] === '--help') {
    printUsage();
    return null;
  }
  if (args[0] !== 'resize' || args.length < 3) {
    printUsage();
    process.exit(1);
  }

  const input = path.resolve(args[1]);
  const output = path.resolve(args[2]);
  const rest = args.slice(3);
  const opts = {};
  for (let i = 0; i < rest.length; i += 2) {
    const key = rest[i].replace(/^--/, '');
    opts[key] = rest[i + 1];
  }
  return { input, output, opts };
}

export async function runResizeCli(argv = process.argv) {
  const parsed = parseArgs(argv);
  if (!parsed) return;

  const { input, output, opts } = parsed;

  let resizeOptions;
  try {
    resizeOptions = parseResizeOptions(opts);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  console.log(`Resizing: ${path.basename(input)} → ${path.basename(output)}`);
  console.log(`  ${describeResize(resizeOptions)}`);

  try {
    await resizeImage(input, output, resizeOptions);
    console.log('Done.');
  } catch (err) {
    console.error(`Failed to resize image: ${err.message}`);
    process.exit(1);
  }
}
