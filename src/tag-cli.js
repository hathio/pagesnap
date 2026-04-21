import { addTag, removeTag, getTagsForSnapshot, getSnapshotsByTag, listAllTags } from './tag.js';
import { getStorageRoot } from './storage.js';

const usage = `
Usage: pagesnap tag <command> [options]

Commands:
  add <snapshotId> <tag>     Add a tag to a snapshot
  remove <snapshotId> <tag>  Remove a tag from a snapshot
  list <snapshotId>          List tags for a snapshot
  find <tag>                 Find snapshots with a given tag
  all                        List all known tags
`.trim();

export function runTagCli(argv) {
  const [cmd, ...args] = argv;
  const dir = getStorageRoot();

  switch (cmd) {
    case 'add': {
      const [snapshotId, tag] = args;
      if (!snapshotId || !tag) { console.error('Usage: tag add <snapshotId> <tag>'); process.exit(1); }
      const result = addTag(snapshotId, tag, dir);
      console.log(`Tagged "${snapshotId}" with: ${result.join(', ')}`);
      break;
    }
    case 'remove': {
      const [snapshotId, tag] = args;
      if (!snapshotId || !tag) { console.error('Usage: tag remove <snapshotId> <tag>'); process.exit(1); }
      const result = removeTag(snapshotId, tag, dir);
      console.log(`Tags for "${snapshotId}": ${result.length ? result.join(', ') : '(none)'}`);
      break;
    }
    case 'list': {
      const [snapshotId] = args;
      if (!snapshotId) { console.error('Usage: tag list <snapshotId>'); process.exit(1); }
      const tags = getTagsForSnapshot(snapshotId, dir);
      console.log(tags.length ? tags.join(', ') : '(no tags)');
      break;
    }
    case 'find': {
      const [tag] = args;
      if (!tag) { console.error('Usage: tag find <tag>'); process.exit(1); }
      const snaps = getSnapshotsByTag(tag, dir);
      snaps.forEach(id => console.log(id));
      if (!snaps.length) console.log('(no snapshots)');
      break;
    }
    case 'all': {
      const tags = listAllTags(dir);
      tags.forEach(t => console.log(t));
      if (!tags.length) console.log('(no tags)');
      break;
    }
    default:
      console.log(usage);
  }
}
