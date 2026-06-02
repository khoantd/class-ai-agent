#!/usr/bin/env node
/**
 * Prepend a release entry to README.md and sync the version badge.
 *
 * Usage:
 *   node scripts/update-readme-release.mjs --version 1.2.6 --date 2026-06-02 --notes-file notes.md
 *   echo "- Fix foo" | node scripts/update-readme-release.mjs --version 1.2.6
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const README = path.join(ROOT, 'README.md');
const RELEASE_HEADING = '## Release notes';

function parseArgs(argv) {
  const opts = { version: null, date: null, notesFile: null, readme: README };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--version' && argv[i + 1]) opts.version = argv[++i];
    else if (a === '--date' && argv[i + 1]) opts.date = argv[++i];
    else if (a === '--notes-file' && argv[i + 1]) opts.notesFile = argv[++i];
    else if (a === '--readme' && argv[i + 1]) opts.readme = path.resolve(argv[++i]);
    else if (a === '--help' || a === '-h') {
      console.log(`Usage: node scripts/update-readme-release.mjs --version SEMVER [--date YYYY-MM-DD] [--notes-file PATH]

Reads bullet lines from --notes-file or stdin. Updates version badge and prepends under "${RELEASE_HEADING}".`);
      process.exit(0);
    }
  }
  return opts;
}

function readNotes(opts) {
  let raw = '';
  if (opts.notesFile) {
    raw = fs.readFileSync(opts.notesFile, 'utf8');
  } else if (!process.stdin.isTTY) {
    raw = fs.readFileSync(0, 'utf8');
  } else {
    console.error('Error: provide --notes-file or pipe bullet lines on stdin.');
    process.exit(1);
  }
  const bullets = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith('- ') ? line : `- ${line.replace(/^-\s*/, '')}`));
  if (bullets.length === 0) {
    console.error('Error: no release note bullets found.');
    process.exit(1);
  }
  return bullets.join('\n');
}

function updateVersionBadge(content, version) {
  const badgeRe = /(<img src="https:\/\/img\.shields\.io\/badge\/version-)[^"-]+(-blue[^"]*" alt="Version" \/>)/;
  if (!badgeRe.test(content)) {
    console.error('Error: version badge not found in README.');
    process.exit(1);
  }
  return content.replace(badgeRe, `$1${version}$2`);
}

function prependReleaseEntry(content, version, date, bullets) {
  const block = `### ${version} — ${date}\n\n${bullets}\n\n`;
  const idx = content.indexOf(RELEASE_HEADING);
  if (idx === -1) {
    console.error(`Error: "${RELEASE_HEADING}" not found in README. Add the section first.`);
    process.exit(1);
  }
  const afterHeading = idx + RELEASE_HEADING.length;
  let insertAt = afterHeading;
  while (insertAt < content.length && (content[insertAt] === '\n' || content[insertAt] === '\r')) {
    insertAt++;
  }
  return content.slice(0, insertAt) + '\n\n' + block + content.slice(insertAt);
}

function main() {
  const opts = parseArgs(process.argv);
  if (!opts.version || !/^\d+\.\d+\.\d+/.test(opts.version)) {
    console.error('Error: --version SEMVER is required (e.g. 1.2.6).');
    process.exit(1);
  }
  const date =
    opts.date ||
    new Date().toISOString().slice(0, 10);
  const bullets = readNotes(opts);
  let content = fs.readFileSync(opts.readme, 'utf8');
  content = updateVersionBadge(content, opts.version);
  content = prependReleaseEntry(content, opts.version, date, bullets);
  fs.writeFileSync(opts.readme, content);
  console.log(`Updated ${path.relative(ROOT, opts.readme)}: release ${opts.version} (${date})`);
}

main();
