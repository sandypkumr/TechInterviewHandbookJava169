/**
 * enrich-descriptions.mjs
 * Patches "No problem description" placeholder in MDX files with
 * Markdown descriptions stored in overrides/descriptions.json.
 *
 * Usage:
 *   node enrich-descriptions.mjs          # dry-run
 *   node enrich-descriptions.mjs --write  # apply changes
 */

import fs   from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, '../docs/src/content/problems');
const DESC_FILE   = path.join(__dirname, 'overrides/descriptions.json');
const PLACEHOLDER_RE = /> 📝 \*\*No problem description found[^\n]*/;
const WRITE = process.argv.includes('--write');

function extractSlug(raw) {
  const m = raw.match(/leetcodeUrl:\s*["']?https?:\/\/leetcode\.com\/problems\/([^\/\s"']+)/);
  return m ? m[1] : null;
}

async function walkMdx(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory())              out.push(...await walkMdx(p));
    else if (e.name.endsWith('.mdx')) out.push(p);
  }
  return out;
}

async function main() {
  console.log('\n══════════════════════════════════════════════');
  console.log('  Description Enrichment' + (WRITE ? '' : ' [DRY RUN — pass --write to apply]'));
  console.log('══════════════════════════════════════════════\n');

  let descriptions;
  try {
    descriptions = JSON.parse(await fs.readFile(DESC_FILE, 'utf8'));
  } catch {
    console.error('Cannot read ' + DESC_FILE);
    console.error('Run "node fetch-leetcode.mjs" first.');
    process.exit(1);
  }
  console.log('Loaded ' + Object.keys(descriptions).length + ' descriptions.\n');

  const files = await walkMdx(CONTENT_DIR);
  let patched = 0, skipped = 0, missing = 0, premium = 0;

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    if (!PLACEHOLDER_RE.test(raw)) { skipped++; continue; }

    const slug = extractSlug(raw);
    if (!slug) { missing++; continue; }

    const md = descriptions[slug];
    if (!md) {
      console.log('[no-desc] ' + slug);
      missing++;
      continue;
    }
    if (md === '[PREMIUM]') {
      premium++;
      continue;
    }

    const updated = raw.replace(PLACEHOLDER_RE, md);
    if (WRITE) {
      await fs.writeFile(file, updated, 'utf8');
    }
    console.log('[patch]   ' + slug);
    patched++;
  }

  console.log('\n══════════════════════════════════════════════');
  console.log(' Patched: ' + patched + '  Premium (kept placeholder): ' + premium +
              '  Not in JSON yet: ' + missing + '  Already had description: ' + skipped);
  if (!WRITE && patched > 0) {
    console.log('\n Run with --write to apply the patches.');
  }
  console.log('══════════════════════════════════════════════\n');
}

main().catch(err => { console.error(err); process.exit(1); });
