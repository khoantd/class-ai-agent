#!/usr/bin/env node
/**
 * Vendor loop-library agent skill into .cursor/skills.
 * Updates THIRD_PARTY_NOTICES.md (appends Loop Library section) and runs sync:all.
 *
 * Usage: node scripts/sync-loop-library-skill.mjs
 * Pin: scripts/loop-library-skills.lock.json
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCK_PATH = path.join(ROOT, 'scripts', 'loop-library-skills.lock.json');
const lock = JSON.parse(fs.readFileSync(LOCK_PATH, 'utf8'));

const UPSTREAM_NOTICE = `# Upstream

| Field | Value |
|-------|-------|
| Repository | [${lock.repo}](${lock.sourceUrl}) |
| Ref | \`${lock.ref}\` |
| Commit | \`${lock.commit}\` |
| License | ${lock.license} |

Vendored by [class-ai-agent](https://github.com/khoantd/class-ai-agent). Refresh:

\`\`\`bash
npm run sync:loop-library-skill
\`\`\`

Copyright (c) Forward Future — see [upstream LICENSE](${lock.sourceUrl}/blob/${lock.ref}/LICENSE).
`;

function rmIfExists(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function cpDir(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function downloadAndExtract() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'loop-library-skill-'));
  const tarball = path.join(tmp, 'archive.tar.gz');
  const refPath = lock.ref.startsWith('v')
    ? `refs/tags/${lock.ref}`
    : `refs/heads/${lock.ref}`;
  const url = `https://github.com/${lock.repo}/archive/${refPath}.tar.gz`;

  console.log(`Fetching ${url} ...`);
  const curl = spawnSync('curl', ['-fsSL', '-o', tarball, url], { stdio: 'inherit' });
  if (curl.status !== 0) {
    rmIfExists(tmp);
    process.exit(curl.status ?? 1);
  }

  const extractDir = path.join(tmp, 'extract');
  fs.mkdirSync(extractDir, { recursive: true });
  const tar = spawnSync('tar', ['-xzf', tarball, '-C', extractDir], { stdio: 'inherit' });
  if (tar.status !== 0) {
    rmIfExists(tmp);
    process.exit(tar.status ?? 1);
  }

  const entries = fs.readdirSync(extractDir);
  if (entries.length !== 1) {
    console.error('Unexpected archive layout:', entries);
    rmIfExists(tmp);
    process.exit(1);
  }

  const repoRoot = path.join(extractDir, entries[0]);
  return { tmp, repoRoot };
}

function installSkill(repoRoot, skillName) {
  const src = path.join(repoRoot, 'skills', skillName);
  if (!fs.existsSync(src)) {
    console.error(`Missing upstream skill: ${src}`);
    process.exit(1);
  }

  const dest = path.join(ROOT, '.cursor', 'skills', skillName);
  rmIfExists(dest);
  cpDir(src, dest);
  fs.writeFileSync(path.join(dest, 'UPSTREAM.md'), UPSTREAM_NOTICE);
  console.log(`Installed: ${dest}`);
}

function appendThirdPartyNotices() {
  const noticesPath = path.join(ROOT, 'THIRD_PARTY_NOTICES.md');
  const sectionHeader = '## Loop Library Agent Skill';
  const section = [
    '',
    sectionHeader,
    '',
    `- **Source:** [${lock.repo}](${lock.sourceUrl}) @ \`${lock.ref}\` (\`${lock.commit}\`)`,
    `- **License:** ${lock.license} — [LICENSE](${lock.sourceUrl}/blob/${lock.ref}/LICENSE)`,
    `- **Skills:** ${lock.skills.map((s) => `\`${s}\``).join(', ')}`,
    `- **Refresh:** \`npm run sync:loop-library-skill\``,
    '',
    'Copyright (c) Forward Future. Permission is hereby granted, free of charge, to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the MIT license terms in the upstream repository.',
    '',
  ].join('\n');

  let existing = '';
  if (fs.existsSync(noticesPath)) {
    existing = fs.readFileSync(noticesPath, 'utf8');
    if (existing.includes(sectionHeader)) {
      const before = existing.split(sectionHeader)[0].replace(/\n$/, '');
      fs.writeFileSync(noticesPath, before + section);
      console.log('Updated: THIRD_PARTY_NOTICES.md (replaced Loop Library section)');
      return;
    }
  }

  fs.writeFileSync(noticesPath, existing + section);
  console.log('Updated: THIRD_PARTY_NOTICES.md (appended Loop Library section)');
}

function runSyncAll() {
  console.log('\nRunning sync:all ...');
  const result = spawnSync('node', ['scripts/sync-all.mjs'], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function main() {
  const { tmp, repoRoot } = downloadAndExtract();

  try {
    for (const skill of lock.skills) {
      installSkill(repoRoot, skill);
    }
    appendThirdPartyNotices();
  } finally {
    rmIfExists(tmp);
  }

  runSyncAll();
  console.log('\nDone. Loop Library skill synced from', lock.ref);
}

main();
