#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PKG_ROOT = path.resolve(__dirname, '..');

function readPkg() {
  const p = path.join(PKG_ROOT, 'package.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function printHelp() {
  console.log(`class-ai-agent — Install Claude Code, Cursor & Kiro AI agent scaffolding

Usage:
  npx class-ai-agent [init] [options]

Options:
  -d, --dir <path>   Target directory (default: current working directory)
      --claude       Install only .claude/
      --cursor       Install only .cursor/
      --kiro         Install only .kiro/
  -f, --force        Overwrite existing files or directories
  -h, --help         Show help
  -v, --version      Print version

AGENTS.md is installed with --cursor, --kiro, or a full install (no --*-only flags).

.agent/:
  Cross-tool session handoff (.agent/SESSION.md). Seeded from template on install;
  existing SESSION.md is never overwritten unless you use --force on .agent/.

CodeGraph:
  After install, runs "npx @colbymchenry/codegraph init -i" in the target directory
  (Node 20+ recommended). Set CODEGRAPH_SKIP_INIT=1 to skip indexing.

Examples:
  npx class-ai-agent
  npx class-ai-agent --dir ./my-app
  npx class-ai-agent --kiro --force
  CODEGRAPH_SKIP_INIT=1 npx class-ai-agent
`);
}

function parseArgs(argv) {
  const opts = {
    command: 'init',
    dir: process.cwd(),
    claudeOnly: false,
    cursorOnly: false,
    kiroOnly: false,
    force: false,
    help: false,
    version: false,
  };

  let i = 0;
  if (argv[0] === 'init') {
    i = 1;
  }

  for (; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') {
      opts.help = true;
      continue;
    }
    if (a === '-v' || a === '--version') {
      opts.version = true;
      continue;
    }
    if (a === '-f' || a === '--force') {
      opts.force = true;
      continue;
    }
    if (a === '--claude') {
      opts.claudeOnly = true;
      continue;
    }
    if (a === '--cursor') {
      opts.cursorOnly = true;
      continue;
    }
    if (a === '--kiro') {
      opts.kiroOnly = true;
      continue;
    }
    if (a === '-d' || a === '--dir') {
      const v = argv[++i];
      if (!v) {
        console.error('Error: missing value for --dir');
        process.exit(1);
      }
      opts.dir = path.resolve(v);
      continue;
    }
    console.error(`Unknown argument: ${a}`);
    process.exit(1);
  }

  return opts;
}

function ensureParentDir(filePath) {
  const d = path.dirname(filePath);
  fs.mkdirSync(d, { recursive: true });
}

function copyDir(src, dest, { force }) {
  if (!fs.existsSync(src)) {
    console.error(`Error: template missing from package: ${src}`);
    process.exit(1);
  }
  if (fs.existsSync(dest)) {
    if (!force) {
      console.error(`Error: already exists (use --force to overwrite): ${dest}`);
      process.exit(1);
    }
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function copyFile(src, dest, { force }) {
  if (!fs.existsSync(src)) {
    console.error(`Error: template missing from package: ${src}`);
    process.exit(1);
  }
  if (fs.existsSync(dest) && !force) {
    console.error(`Error: already exists (use --force to overwrite): ${dest}`);
    process.exit(1);
  }
  ensureParentDir(dest);
  fs.copyFileSync(src, dest);
}

const CODEGRAPH_GITIGNORE_ENTRY = '.codegraph/';

function ensureCodegraphGitignore(targetDir) {
  const gitignorePath = path.join(targetDir, '.gitignore');
  const entry = CODEGRAPH_GITIGNORE_ENTRY;

  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    if (content.includes(entry) || content.includes('.codegraph')) {
      return;
    }
    const suffix = content.endsWith('\n') ? '' : '\n';
    fs.appendFileSync(gitignorePath, `${suffix}${entry}\n`);
    console.log(`Updated: ${gitignorePath} (${entry})`);
    return;
  }

  fs.writeFileSync(gitignorePath, `${entry}\n`);
  console.log(`Created: ${gitignorePath} (${entry})`);
}

function runCodegraphInit(targetDir) {
  if (process.env.CODEGRAPH_SKIP_INIT === '1') {
    console.log('\nCodeGraph: skipped (CODEGRAPH_SKIP_INIT=1).');
    return;
  }

  console.log('\nCodeGraph: building local index (npx @colbymchenry/codegraph init -i)...');
  const result = spawnSync(
    'npx',
    ['-y', '@colbymchenry/codegraph@latest', 'init', '-i'],
    {
      cwd: targetDir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    }
  );

  if (result.status === 0) {
    console.log(`CodeGraph: index ready under ${path.join(targetDir, '.codegraph')}`);
    console.log(
      'CodeGraph: reload Cursor (.cursor/mcp.json) and/or restart Kiro (.kiro/settings/mcp.json).'
    );
    return;
  }

  console.warn(
    '\nCodeGraph: init failed (network, Node version, or permissions). Scaffolding was installed.'
  );
  console.warn(
    '  Retry: npx @colbymchenry/codegraph init -i  (Node 20+ recommended)'
  );
}

function shouldInstallTarget(target, opts) {
  const only = {
    claude: opts.claudeOnly,
    cursor: opts.cursorOnly,
    kiro: opts.kiroOnly,
  };
  const anyOnly = only.claude || only.cursor || only.kiro;
  if (!anyOnly) return true;
  return only[target];
}

function shouldInstallAgentDir(opts) {
  const anyOnly = opts.claudeOnly || opts.cursorOnly || opts.kiroOnly;
  return !anyOnly;
}

function installAgentContinuity(targetDir, { force }) {
  const srcDir = path.join(PKG_ROOT, '.agent');
  const destDir = path.join(targetDir, '.agent');
  const templateSrc = path.join(srcDir, 'SESSION.template.md');
  const sessionDest = path.join(destDir, 'SESSION.md');

  if (!fs.existsSync(srcDir)) {
    console.error(`Error: template missing from package: ${srcDir}`);
    process.exit(1);
  }

  if (fs.existsSync(destDir)) {
    if (force) {
      fs.rmSync(destDir, { recursive: true, force: true });
      fs.cpSync(srcDir, destDir, { recursive: true });
      console.log(`Installed: ${destDir} (overwritten)`);
    } else {
      const readmeSrc = path.join(srcDir, 'README.md');
      const readmeDest = path.join(destDir, 'README.md');
      if (fs.existsSync(readmeSrc) && (!fs.existsSync(readmeDest) || force)) {
        ensureParentDir(readmeDest);
        fs.copyFileSync(readmeSrc, readmeDest);
        console.log(`Updated: ${readmeDest}`);
      }
      const templateDest = path.join(destDir, 'SESSION.template.md');
      if (fs.existsSync(templateSrc) && (!fs.existsSync(templateDest) || force)) {
        ensureParentDir(templateDest);
        fs.copyFileSync(templateSrc, templateDest);
        console.log(`Updated: ${templateDest}`);
      }
      console.log(`Skipped overwrite: ${destDir} (existing; use --force to replace)`);
    }
  } else {
    fs.mkdirSync(path.dirname(destDir), { recursive: true });
    fs.cpSync(srcDir, destDir, { recursive: true });
    console.log(`Installed: ${destDir}`);
  }

  if (!fs.existsSync(sessionDest) && fs.existsSync(templateSrc)) {
    ensureParentDir(sessionDest);
    fs.copyFileSync(templateSrc, sessionDest);
    console.log(`Created: ${sessionDest} (from template)`);
  }
}

function run(opts) {
  const installClaude = shouldInstallTarget('claude', opts);
  const installCursor = shouldInstallTarget('cursor', opts);
  const installKiro = shouldInstallTarget('kiro', opts);
  const installAgents = installCursor || installKiro;

  fs.mkdirSync(opts.dir, { recursive: true });

  const copyOpts = { force: opts.force };

  if (installClaude) {
    const src = path.join(PKG_ROOT, '.claude');
    const dest = path.join(opts.dir, '.claude');
    copyDir(src, dest, copyOpts);
    console.log(`Installed: ${dest}`);
  }

  if (installCursor) {
    const src = path.join(PKG_ROOT, '.cursor');
    const dest = path.join(opts.dir, '.cursor');
    copyDir(src, dest, copyOpts);
    console.log(`Installed: ${dest}`);
  }

  if (installKiro) {
    const src = path.join(PKG_ROOT, '.kiro');
    const dest = path.join(opts.dir, '.kiro');
    copyDir(src, dest, copyOpts);
    console.log(`Installed: ${dest}`);
  }

  if (installAgents) {
    const src = path.join(PKG_ROOT, 'AGENTS.md');
    const dest = path.join(opts.dir, 'AGENTS.md');
    copyFile(src, dest, copyOpts);
    console.log(`Installed: ${dest}`);
  }

  if (shouldInstallAgentDir(opts)) {
    installAgentContinuity(opts.dir, copyOpts);
  }

  ensureCodegraphGitignore(opts.dir);
  runCodegraphInit(opts.dir);

  const hints = [];
  if (installClaude) hints.push('.claude/CLAUDE.md');
  if (installCursor) hints.push('.cursor/CURSOR.md');
  if (installKiro) hints.push('.kiro/KIRO.md');
  console.log(`\nDone. Next steps: read ${hints.join(', ')}.`);
  if (installCursor) {
    console.log('  Cursor: reload the window so CodeGraph MCP loads (.cursor/mcp.json).');
  }
  if (installKiro) {
    console.log('  Kiro: restart IDE/CLI so CodeGraph MCP loads (.kiro/settings/mcp.json).');
  }
  if (shouldInstallAgentDir(opts)) {
    console.log('  Continuity: edit .agent/SESSION.md at session end (/handoff); read at start (/resume).');
  }
}

const argv = process.argv.slice(2);
const opts = parseArgs(argv);

if (opts.help) {
  printHelp();
  process.exit(0);
}

if (opts.version) {
  console.log(readPkg().version);
  process.exit(0);
}

run(opts);
