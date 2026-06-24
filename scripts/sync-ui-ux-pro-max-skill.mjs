#!/usr/bin/env node
/**
 * Vendor ui-ux-pro-max skill from nextlevelbuilder/ui-ux-pro-max-skill into .cursor/skills.
 * Preserves class-ai-agent IMPACT-DEMO.md and multi-tool SKILL.md patches.
 * Updates THIRD_PARTY_NOTICES.md and runs sync:all.
 *
 * Usage: node scripts/sync-ui-ux-pro-max-skill.mjs
 * Pin: scripts/ui-ux-pro-max-skills.lock.json
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCK_PATH = path.join(ROOT, 'scripts', 'ui-ux-pro-max-skills.lock.json');
const SKILL_DEST = path.join(ROOT, '.cursor', 'skills', 'ui-ux-pro-max');
const SCRIPT_PREFIX = '.cursor/skills/ui-ux-pro-max/scripts/search.py';

let lock = JSON.parse(fs.readFileSync(LOCK_PATH, 'utf8'));

const SKILL_PATH_BY_TOOL = `## Skill path by tool

Run commands from project root. Adjust the path prefix to match your tool:

| Tool | Path |
|------|------|
| Cursor | \`.cursor/skills/ui-ux-pro-max/\` |
| Claude Code | \`.claude/skills/ui-ux-pro-max/\` |
| Kiro | \`.kiro/skills/ui-ux-pro-max/\` |
| Antigravity | \`.agents/skills/ui-ux-pro-max/\` |

Examples below use \`.cursor/skills/ui-ux-pro-max/scripts/search.py\` (Cursor). Replace \`.cursor/\` with your tool's prefix.

---

`;

const TIERED_ENFORCEMENT = `**Tiered enforcement:** Full \`--design-system\` search for **new UI** (pages, components, layouts). For **fixes and reviews**, use targeted \`--domain ux\` or \`--stack\` searches. Trivial mechanical edits (className typo, import fix) skip Python search but still apply the pre-delivery checklist.

`;

function upstreamNotice() {
  return `# Upstream

| Field | Value |
|-------|-------|
| Repository | [${lock.repo}](${lock.sourceUrl}) |
| Ref | \`${lock.ref}\` |
| Commit | \`${lock.commit}\` |
| License | ${lock.license} |

Vendored by [class-ai-agent](https://github.com/khoantd/class-ai-agent). Refresh:

\`\`\`bash
npm run sync:ui-ux-pro-max-skill
\`\`\`

Copyright (c) NextLevelBuilder — see [upstream LICENSE](${lock.sourceUrl}/blob/${lock.ref}/LICENSE).
`;
}

function rmIfExists(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function cpDir(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function resolveCommitSha() {
  const refPath = lock.ref.startsWith('v') ? `refs/tags/${lock.ref}` : `refs/heads/${lock.ref}`;
  const result = spawnSync(
    'git',
    ['ls-remote', `https://github.com/${lock.repo}.git`, refPath],
    { encoding: 'utf8' },
  );
  if (result.status !== 0 || !result.stdout?.trim()) {
    console.warn('Could not resolve commit SHA; lock file commit left unchanged.');
    return lock.commit;
  }
  return result.stdout.trim().split(/\s+/)[0];
}

function downloadAndExtract() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-ux-pro-max-skill-'));
  const tarball = path.join(tmp, 'archive.tar.gz');
  const refPath = lock.ref.startsWith('v') ? `refs/tags/${lock.ref}` : `refs/heads/${lock.ref}`;
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

  return { tmp, repoRoot: path.join(extractDir, entries[0]) };
}

function buildClassAiAgentSkillMd() {
  const p = SCRIPT_PREFIX;
  return `---
name: ui-ux-pro-max
description: "Use for ANY UI/UX task. Triggers: design, build, create, implement, review, fix, improve UI; components, pages, layouts, styling, accessibility, design systems, landing pages, dashboards, forms, responsive layout."
---

# ui-ux-pro-max

Comprehensive design guide for web and mobile applications. Contains 67 styles, 161 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types across 17 technology stacks. Searchable database with priority-based recommendations.

## Prerequisites

Check if Python is installed:

\`\`\`bash
python3 --version || python --version
\`\`\`

If Python is not installed, install it based on user's OS:

**macOS:**
\`\`\`bash
brew install python3
\`\`\`

**Ubuntu/Debian:**
\`\`\`bash
sudo apt update && sudo apt install python3
\`\`\`

**Windows:**
\`\`\`powershell
winget install Python.Python.3.12
\`\`\`

---

${SKILL_PATH_BY_TOOL}## How to Use This Skill

When user requests UI/UX work (design, build, create, implement, review, fix, improve), follow this workflow:

${TIERED_ENFORCEMENT}### Step 1: Analyze User Requirements

Extract key information from user request:
- **Product type**: SaaS, e-commerce, portfolio, dashboard, landing page, etc.
- **Style keywords**: minimal, playful, professional, elegant, dark mode, etc.
- **Industry**: healthcare, fintech, gaming, education, etc.
- **Stack**: React, Vue, Next.js, or default to \`html-tailwind\`

### Step 2: Generate Design System (REQUIRED for new UI)

**For new pages, components, layouts, or design systems**, start with \`--design-system\`:

\`\`\`bash
python3 ${p} "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
\`\`\`

This command:
1. Searches 5 domains in parallel (product, style, color, landing, typography)
2. Applies reasoning rules from \`ui-reasoning.csv\` to select best matches
3. Returns complete design system: pattern, style, colors, typography, effects
4. Includes anti-patterns to avoid

**Example:**
\`\`\`bash
python3 ${p} "beauty spa wellness service" --design-system -p "Serenity Spa"
\`\`\`

### Step 2b: Persist Design System (Master + Overrides Pattern)

To save the design system for hierarchical retrieval across sessions, add \`--persist\`:

\`\`\`bash
python3 ${p} "<query>" --design-system --persist -p "Project Name"
\`\`\`

This creates:
- \`design-system/MASTER.md\` — Global Source of Truth with all design rules
- \`design-system/pages/\` — Folder for page-specific overrides

**With page-specific override:**
\`\`\`bash
python3 ${p} "<query>" --design-system --persist -p "Project Name" --page "dashboard"
\`\`\`

This also creates:
- \`design-system/pages/dashboard.md\` — Page-specific deviations from Master

**How hierarchical retrieval works:**
1. When building a specific page (e.g., "Checkout"), first check \`design-system/pages/checkout.md\`
2. If the page file exists, its rules **override** the Master file
3. If not, use \`design-system/MASTER.md\` exclusively

### Step 3: Supplement with Detailed Searches (as needed)

After getting the design system, use domain searches to get additional details:

\`\`\`bash
python3 ${p} "<keyword>" --domain <domain> [-n <max_results>]
\`\`\`

**When to use detailed searches:**

| Need | Domain | Example |
|------|--------|---------|
| More style options | \`style\` | \`--domain style "glassmorphism dark"\` |
| Chart recommendations | \`chart\` | \`--domain chart "real-time dashboard"\` |
| UX best practices | \`ux\` | \`--domain ux "animation accessibility"\` |
| Alternative fonts | \`typography\` | \`--domain typography "elegant luxury"\` |
| Landing structure | \`landing\` | \`--domain landing "hero social-proof"\` |

### Step 4: Stack Guidelines (Default: html-tailwind)

Get implementation-specific best practices. If user doesn't specify a stack, **default to \`html-tailwind\`**.

\`\`\`bash
python3 ${p} "<keyword>" --stack html-tailwind
\`\`\`

Available stacks: \`html-tailwind\`, \`react\`, \`nextjs\`, \`astro\`, \`vue\`, \`nuxtjs\`, \`nuxt-ui\`, \`svelte\`, \`swiftui\`, \`react-native\`, \`flutter\`, \`shadcn\`, \`jetpack-compose\`, \`angular\`, \`laravel\`, \`javafx\`, \`threejs\`

---

## Search Reference

### Available Domains

| Domain | Use For | Example Keywords |
|--------|---------|------------------|
| \`product\` | Product type recommendations | SaaS, e-commerce, portfolio, healthcare, beauty, service |
| \`style\` | UI styles, colors, effects | glassmorphism, minimalism, dark mode, brutalism |
| \`typography\` | Font pairings, Google Fonts | elegant, playful, professional, modern |
| \`color\` | Color palettes by product type | saas, ecommerce, healthcare, beauty, fintech, service |
| \`landing\` | Page structure, CTA strategies | hero, hero-centric, testimonial, pricing, social-proof |
| \`chart\` | Chart types, library recommendations | trend, comparison, timeline, funnel, pie |
| \`ux\` | Best practices, anti-patterns | animation, accessibility, z-index, loading |
| \`react\` | React/Next.js performance | waterfall, bundle, suspense, memo, rerender, cache |
| \`web\` | Web interface guidelines | aria, focus, keyboard, semantic, virtualize |
| \`prompt\` | AI prompts, CSS keywords | (style name) |

### Available Stacks

| Stack | Focus |
|-------|-------|
| \`html-tailwind\` | Tailwind utilities, responsive, a11y (DEFAULT) |
| \`react\` | State, hooks, performance, patterns |
| \`nextjs\` | SSR, routing, images, API routes |
| \`astro\` | Islands, content collections, view transitions |
| \`vue\` | Composition API, Pinia, Vue Router |
| \`nuxtjs\` | Nuxt modules, server routes, composables |
| \`nuxt-ui\` | Nuxt UI components, theming, forms |
| \`svelte\` | Runes, stores, SvelteKit |
| \`swiftui\` | Views, State, Navigation, Animation |
| \`react-native\` | Components, Navigation, Lists |
| \`flutter\` | Widgets, State, Layout, Theming |
| \`shadcn\` | shadcn/ui components, theming, forms, patterns |
| \`jetpack-compose\` | Composables, Modifiers, State Hoisting, Recomposition |
| \`angular\` | Standalone components, signals, routing, forms |
| \`laravel\` | Blade, Livewire, Inertia.js patterns |
| \`javafx\` | Enterprise desktop apps, AtlantaFX themes, FXML, CSS |
| \`threejs\` | 3D scenes, materials, lighting, performance |

---

## Example Workflow

**User request:** "Làm landing page cho dịch vụ chăm sóc da chuyên nghiệp"

### Step 1: Analyze Requirements
- Product type: Beauty/Spa service
- Style keywords: elegant, professional, soft
- Industry: Beauty/Wellness
- Stack: html-tailwind (default)

### Step 2: Generate Design System (REQUIRED)

\`\`\`bash
python3 ${p} "beauty spa wellness service elegant" --design-system -p "Serenity Spa"
\`\`\`

**Output:** Complete design system with pattern, style, colors, typography, effects, and anti-patterns.

### Step 3: Supplement with Detailed Searches (as needed)

\`\`\`bash
# Get UX guidelines for animation and accessibility
python3 ${p} "animation accessibility" --domain ux

# Get alternative typography options if needed
python3 ${p} "elegant luxury serif" --domain typography
\`\`\`

### Step 4: Stack Guidelines

\`\`\`bash
python3 ${p} "layout responsive form" --stack html-tailwind
\`\`\`

**Then:** Synthesize design system + detailed searches and implement the design.

---

## Output Formats

The \`--design-system\` flag supports two output formats:

\`\`\`bash
# ASCII box (default) - best for terminal display
python3 ${p} "fintech crypto" --design-system

# Markdown - best for documentation
python3 ${p} "fintech crypto" --design-system -f markdown
\`\`\`

---

## Tips for Better Results

1. **Be specific with keywords** - "healthcare SaaS dashboard" > "app"
2. **Search multiple times** - Different keywords reveal different insights
3. **Combine domains** - Style + Typography + Color = Complete design system
4. **Always check UX** - Search "animation", "z-index", "accessibility" for common issues
5. **Use stack flag** - Get implementation-specific best practices
6. **Iterate** - If first search doesn't match, try different keywords

---

## Common Rules for Professional UI

These are frequently overlooked issues that make UI look unprofessional:

### Icons & Visual Elements

| Rule | Do | Don't |
|------|----|----- |
| **No emoji icons** | Use SVG icons (Heroicons, Lucide, Simple Icons) | Use emojis like 🎨 🚀 ⚙️ as UI icons |
| **Stable hover states** | Use color/opacity transitions on hover | Use scale transforms that shift layout |
| **Correct brand logos** | Research official SVG from Simple Icons | Guess or use incorrect logo paths |
| **Consistent icon sizing** | Use fixed viewBox (24x24) with w-6 h-6 | Mix different icon sizes randomly |

### Interaction & Cursor

| Rule | Do | Don't |
|------|----|----- |
| **Cursor pointer** | Add \`cursor-pointer\` to all clickable/hoverable cards | Leave default cursor on interactive elements |
| **Hover feedback** | Provide visual feedback (color, shadow, border) | No indication element is interactive |
| **Smooth transitions** | Use \`transition-colors duration-200\` | Instant state changes or too slow (>500ms) |

### Light/Dark Mode Contrast

| Rule | Do | Don't |
|------|----|----- |
| **Glass card light mode** | Use \`bg-white/80\` or higher opacity | Use \`bg-white/10\` (too transparent) |
| **Text contrast light** | Use \`#0F172A\` (slate-900) for text | Use \`#94A3B8\` (slate-400) for body text |
| **Muted text light** | Use \`#475569\` (slate-600) minimum | Use gray-400 or lighter |
| **Border visibility** | Use \`border-gray-200\` in light mode | Use \`border-white/10\` (invisible) |

### Layout & Spacing

| Rule | Do | Don't |
|------|----|----- |
| **Floating navbar** | Add \`top-4 left-4 right-4\` spacing | Stick navbar to \`top-0 left-0 right-0\` |
| **Content padding** | Account for fixed navbar height | Let content hide behind fixed elements |
| **Consistent max-width** | Use same \`max-w-6xl\` or \`max-w-7xl\` | Mix different container widths |

---

## Pre-Delivery Checklist

Before delivering UI code, verify these items:

### Visual Quality
- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] Brand logos are correct (verified from Simple Icons)
- [ ] Hover states don't cause layout shift
- [ ] Use theme colors directly (bg-primary) not var() wrapper

### Interaction
- [ ] All clickable elements have \`cursor-pointer\`
- [ ] Hover states provide clear visual feedback
- [ ] Transitions are smooth (150-300ms)
- [ ] Focus states visible for keyboard navigation

### Light/Dark Mode
- [ ] Light mode text has sufficient contrast (4.5:1 minimum)
- [ ] Glass/transparent elements visible in light mode
- [ ] Borders visible in both modes
- [ ] Test both modes before delivery

### Layout
- [ ] Floating elements have proper spacing from edges
- [ ] No content hidden behind fixed navbars
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile

### Accessibility
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Color is not the only indicator
- [ ] \`prefers-reduced-motion\` respected
`;
}

function renderSkillMd() {
  return buildClassAiAgentSkillMd();
}

function installSkill(repoRoot, impactDemoBackup) {
  const upstreamSkill = path.join(repoRoot, 'src', 'ui-ux-pro-max');
  const dataSrc = path.join(upstreamSkill, 'data');
  const scriptsSrc = path.join(upstreamSkill, 'scripts');

  if (!fs.existsSync(dataSrc) || !fs.existsSync(scriptsSrc)) {
    console.error(`Missing upstream skill payload under ${upstreamSkill}`);
    process.exit(1);
  }

  fs.mkdirSync(SKILL_DEST, { recursive: true });

  rmIfExists(path.join(SKILL_DEST, 'data'));
  rmIfExists(path.join(SKILL_DEST, 'scripts'));

  cpDir(dataSrc, path.join(SKILL_DEST, 'data'));
  cpDir(scriptsSrc, path.join(SKILL_DEST, 'scripts'));

  fs.writeFileSync(path.join(SKILL_DEST, 'SKILL.md'), renderSkillMd());
  fs.writeFileSync(path.join(SKILL_DEST, 'UPSTREAM.md'), upstreamNotice());

  if (impactDemoBackup) {
    fs.writeFileSync(path.join(SKILL_DEST, 'IMPACT-DEMO.md'), impactDemoBackup);
  }

  console.log(`Installed: ${SKILL_DEST}`);
}

function appendThirdPartyNotices() {
  const noticesPath = path.join(ROOT, 'THIRD_PARTY_NOTICES.md');
  const sectionHeader = '## UI/UX Pro Max Skill';
  const section = [
    '',
    sectionHeader,
    '',
    `- **Source:** [${lock.repo}](${lock.sourceUrl}) @ \`${lock.ref}\` (\`${lock.commit}\`)`,
    `- **License:** ${lock.license} — [LICENSE](${lock.sourceUrl}/blob/${lock.ref}/LICENSE)`,
    `- **Skill:** \`ui-ux-pro-max\``,
    `- **Refresh:** \`npm run sync:ui-ux-pro-max-skill\``,
    '',
    'Copyright (c) NextLevelBuilder. Permission is hereby granted, free of charge, to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the MIT license terms in the upstream repository.',
    '',
  ].join('\n');

  let existing = '';
  if (fs.existsSync(noticesPath)) {
    existing = fs.readFileSync(noticesPath, 'utf8');
    if (existing.includes(sectionHeader)) {
      const before = existing.split(sectionHeader)[0].replace(/\n$/, '');
      fs.writeFileSync(noticesPath, before + section);
      console.log('Updated: THIRD_PARTY_NOTICES.md (replaced UI/UX Pro Max section)');
      return;
    }
  }

  fs.writeFileSync(noticesPath, existing + section);
  console.log('Updated: THIRD_PARTY_NOTICES.md (appended UI/UX Pro Max section)');
}

function writeLockFile() {
  fs.writeFileSync(LOCK_PATH, `${JSON.stringify(lock, null, 2)}\n`);
  console.log(`Updated: ${LOCK_PATH}`);
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
  const impactDemoPath = path.join(SKILL_DEST, 'IMPACT-DEMO.md');
  const impactDemoBackup = fs.existsSync(impactDemoPath)
    ? fs.readFileSync(impactDemoPath, 'utf8')
    : null;

  lock.commit = resolveCommitSha();
  const { tmp, repoRoot } = downloadAndExtract();

  try {
    installSkill(repoRoot, impactDemoBackup);
    appendThirdPartyNotices();
    writeLockFile();
  } finally {
    rmIfExists(tmp);
  }

  runSyncAll();
  console.log('\nDone. ui-ux-pro-max skill synced from', lock.ref);
}

main();
