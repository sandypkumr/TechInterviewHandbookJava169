/**
 * Phase 4 — Metadata Enrichment
 *
 * Reads scripts/overrides/metadata.yml and merges each entry's
 * timeComplexity, spaceComplexity, patterns, and tags into the
 * corresponding MDX frontmatter in docs/src/content/problems/.
 *
 * Usage:
 *   node enrich-metadata.mjs           # dry-run (preview changes)
 *   node enrich-metadata.mjs --write   # apply changes
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT   = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(REPO_ROOT, 'docs/src/content/problems');
const OVERRIDES   = path.join(__dirname, 'overrides/metadata.yml');
const WRITE_MODE  = process.argv.includes('--write');

// ─── Minimal YAML parser (handles the simple key: value / list format used) ──

function parseYaml(text) {
  const result  = {};
  let   current = null;  // current top-level key
  let   inList  = false;

  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/#.*$/, '').trimEnd(); // strip inline comments

    // Skip pure comment / blank lines
    if (!line.trim() || line.trim().startsWith('#')) continue;

    // Top-level key (no leading spaces, ends with colon)
    if (/^[a-zA-Z0-9][\w-]*:$/.test(line.trim())) {
      current = line.trim().slice(0, -1);
      result[current] = {};
      inList = false;
      continue;
    }

    // Nested key under a top-level entry (2-space indent)
    const nested = line.match(/^  ([\w]+):\s*(.*)?$/);
    if (nested && current) {
      const key = nested[1];
      const val = nested[2]?.trim() ?? '';

      if (val === '' || val === '[]') {
        // Could be start of a block list or empty list
        result[current][key] = [];
        inList = (val === '');
        if (inList) result[current].__listKey = key;
      } else if (val.startsWith('[') && val.endsWith(']')) {
        // Inline list: ["a","b"]  or  [a, b]
        result[current][key] = parseInlineList(val);
        inList = false;
      } else {
        // Scalar (possibly quoted)
        result[current][key] = unquote(val);
        inList = false;
      }
      continue;
    }

    // Block list item (4-space indent, starts with -)
    const listItem = line.match(/^    - (.+)$/);
    if (listItem && current && inList) {
      const lk = result[current].__listKey;
      if (lk) result[current][lk].push(unquote(listItem[1].trim()));
      continue;
    }
  }

  // Clean up internal helper keys
  for (const k of Object.keys(result)) delete result[k].__listKey;
  return result;
}

function parseInlineList(val) {
  return val
    .slice(1, -1)
    .split(',')
    .map(s => unquote(s.trim()))
    .filter(Boolean);
}

function unquote(s) {
  if ((s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

// ─── Frontmatter patcher ─────────────────────────────────────────────────────

/**
 * Replace specific frontmatter keys in an MDX string.
 * Only replaces lines for keys that exist in `patches`.
 */
function patchFrontmatter(mdx, patches) {
  const fmMatch = mdx.match(/^(---\n)([\s\S]*?)(\n---)/);
  if (!fmMatch) return { content: mdx, changed: false };

  let fm      = fmMatch[2];
  let changed = false;

  for (const [key, value] of Object.entries(patches)) {
    const yamlValue = toYamlValue(value);
    const re = new RegExp(`^(${key}:).*$`, 'm');
    if (re.test(fm)) {
      const newFm = fm.replace(re, `$1 ${yamlValue}`);
      if (newFm !== fm) { fm = newFm; changed = true; }
    }
  }

  // Recalculate enrichmentNeeded
  const hasTime    = !/^timeComplexity:\s*""/.test(fm) && !/^timeComplexity:\s*$/.test(fm);
  const hasSpace   = !/^spaceComplexity:\s*""/.test(fm) && !/^spaceComplexity:\s*$/.test(fm);
  const hasDesc    = /^hasProblemStatement:\s*true/.test(fm);
  const hasPattern = !/^patterns:\s*\[\]/.test(fm);
  const needed     = !hasTime || !hasSpace || !hasDesc || !hasPattern;
  const enrichRe   = /^(enrichmentNeeded:).*$/m;
  if (enrichRe.test(fm)) {
    const newFm = fm.replace(enrichRe, `$1 ${needed}`);
    if (newFm !== fm) { fm = newFm; changed = true; }
  }

  return { content: `${fmMatch[1]}${fm}${fmMatch[3]}${mdx.slice(fmMatch[0].length)}`, changed };
}

function toYamlValue(value) {
  if (Array.isArray(value)) return JSON.stringify(value);
  return JSON.stringify(String(value));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  DSA Learning Portal — Metadata Enrichment');
  console.log(`  Mode: ${WRITE_MODE ? '✍  WRITE' : '👁  DRY-RUN (pass --write to apply)'}`);
  console.log('══════════════════════════════════════════════════════\n');

  const raw       = fs.readFileSync(OVERRIDES, 'utf-8');
  const overrides = parseYaml(raw);
  const slugs     = Object.keys(overrides);
  console.log(`  Loaded ${slugs.length} overrides from metadata.yml\n`);

  let matched = 0, updated = 0, notFound = 0;

  for (const [slug, patches] of Object.entries(overrides)) {
    // Find MDX file by slug (search all topic subdirs)
    const mdxPath = findMdxBySlug(slug);

    if (!mdxPath) {
      notFound++;
      console.log(`  ⚠ Not found: ${slug}`);
      continue;
    }

    matched++;
    const original = fs.readFileSync(mdxPath, 'utf-8');
    const { content, changed } = patchFrontmatter(original, patches);

    if (!changed) continue;

    updated++;
    const rel = path.relative(REPO_ROOT, mdxPath);

    if (WRITE_MODE) {
      fs.writeFileSync(mdxPath, content, 'utf-8');
      console.log(`  ✓ ${rel}`);
    } else {
      console.log(`  ~ ${rel}  (would update)`);
    }
  }

  console.log(`\n  Matched: ${matched}  │  Updated: ${updated}  │  Not found: ${notFound}\n`);
  if (!WRITE_MODE && updated > 0) {
    console.log('  Run with --write to apply changes.\n');
  }
}

function findMdxBySlug(slug) {
  // Walk all topic subdirs of CONTENT_DIR looking for {slug}.mdx
  if (!fs.existsSync(CONTENT_DIR)) return null;
  for (const topicDir of fs.readdirSync(CONTENT_DIR)) {
    const candidate = path.join(CONTENT_DIR, topicDir, `${slug}.mdx`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
