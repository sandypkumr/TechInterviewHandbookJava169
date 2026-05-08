/**
 * fetch-leetcode.mjs
 * Fetches problem descriptions from LeetCode's public GraphQL API,
 * converts HTML → Markdown, and saves to overrides/descriptions.json.
 *
 * Run locally (never in CI — LeetCode blocks automated runners):
 *   node fetch-leetcode.mjs              # fetch all missing
 *   node fetch-leetcode.mjs --force      # re-fetch even if already present
 *   node fetch-leetcode.mjs --dry-run    # preview only, no writes
 *   node fetch-leetcode.mjs --limit=10   # process at most N problems
 */

import fs   from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname    = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR  = path.join(__dirname, '../docs/src/content/problems');
const DESC_FILE    = path.join(__dirname, 'overrides/descriptions.json');
const GQL_URL      = 'https://leetcode.com/graphql';
const DELAY_MS     = 2000;
const PLACEHOLDER  = 'No problem description found in source.';

const FORCE    = process.argv.includes('--force');
const DRY_RUN  = process.argv.includes('--dry-run');
const limitArg = process.argv.find(a => a.startsWith('--limit='));
const LIMIT    = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

// ── HTML → Markdown ──────────────────────────────────────────────────────────

function decodeEntities(s) {
  return s
    .replace(/&lt;/g,    '<').replace(/&gt;/g,    '>')
    .replace(/&amp;/g,   '&').replace(/&nbsp;/g,  ' ')
    .replace(/&#39;/g,   "'").replace(/&quot;/g,   '"')
    .replace(/&le;/g,   '≤').replace(/&ge;/g,    '≥')
    .replace(/&#8203;/g, '').replace(/\u200b/g,   '');
}

function stripTags(s) { return s.replace(/<[^>]+>/g, ''); }

function htmlToMarkdown(html) {
  if (!html) return '';
  let s = html;

  // Tables → skip (rare, complex)
  s = s.replace(/<table[\s\S]*?<\/table>/gi, '');

  // <pre> → fenced code block
  s = s.replace(/<pre>([\s\S]*?)<\/pre>/gi, (_, inner) => {
    const text = decodeEntities(
      inner
        .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '$1')
        .replace(/<[^>]+>/g, '')
    ).trim();
    return `\n\`\`\`\n${text}\n\`\`\`\n`;
  });

  // <code> → backtick span (handle <sup> inside)
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, inner) => {
    const text = decodeEntities(
      inner
        .replace(/<sup>([\s\S]*?)<\/sup>/gi, '^$1')
        .replace(/<[^>]+>/g, '')
    );
    return '`' + text + '`';
  });

  // Bold / italic
  s = s.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  s = s.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi,           '**$1**');
  s = s.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi,         '_$1_');
  s = s.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi,           '_$1_');

  // Superscript / subscript
  s = s.replace(/<sup>([\s\S]*?)<\/sup>/gi, '^$1');
  s = s.replace(/<sub>([\s\S]*?)<\/sub>/gi, '$1');

  // List items
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, inner) =>
    '\n- ' + stripTags(inner).trim()
  );
  s = s.replace(/<\/?[uo]l[^>]*>/gi, '\n');

  // Headings
  s = s.replace(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi,
    (_, t) => '\n### ' + stripTags(t).trim() + '\n');

  // Paragraphs / breaks
  s = s.replace(/<\/p>/gi, '\n\n');
  s = s.replace(/<p[^>]*>/gi, '');
  s = s.replace(/<br\s*\/?>/gi, '\n');

  // Strip remaining tags
  s = stripTags(s);

  // Decode remaining HTML entities
  s = decodeEntities(s);

  // MDX escaping — only in prose (not inside code blocks/spans)
  const segments = s.split(/(```[\s\S]*?```|`[^`\n]+`)/g);
  s = segments.map((seg, i) => {
    if (i % 2 === 1) return seg; // inside code — leave untouched
    return seg
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/</g, '&lt;');   // bare < in prose is invalid JSX
  }).join('');

  // Tidy whitespace
  s = s
    .replace(/[ \t]+$/gm, '')   // trailing spaces
    .replace(/\n{3,}/g, '\n\n') // max two blank lines
    .trim();

  return s;
}

// ── LeetCode GraphQL ─────────────────────────────────────────────────────────

async function fetchContent(slug) {
  const body = JSON.stringify({
    query: `query($s:String!){question(titleSlug:$s){content isPaidOnly}}`,
    variables: { s: slug },
  });
  try {
    const res = await fetch(GQL_URL, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer':      `https://leetcode.com/problems/${slug}/`,
        'User-Agent':   'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
                        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      body,
    });
    if (!res.ok) { console.error(`  HTTP ${res.status}`); return null; }
    const json = await res.json();
    const q = json?.data?.question;
    if (!q) return null;
    if (q.isPaidOnly) return '[PREMIUM]';
    return q.content ?? null;
  } catch (e) {
    console.error(`  Fetch error: ${e.message}`);
    return null;
  }
}

// ── MDX file helpers ─────────────────────────────────────────────────────────

function extractSlug(raw) {
  const m = raw.match(/leetcodeUrl:\s*["']?https?:\/\/leetcode\.com\/problems\/([^\/\s"']+)/);
  return m ? m[1] : null;
}

async function walkMdx(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory())         out.push(...await walkMdx(p));
    else if (e.name.endsWith('.mdx')) out.push(p);
  }
  return out;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n══════════════════════════════════════════════');
  console.log('  LeetCode Description Fetcher');
  if (DRY_RUN) console.log('  [DRY RUN — no files written]');
  console.log('══════════════════════════════════════════════\n');

  // Load existing descriptions
  let existing = {};
  try {
    existing = JSON.parse(await fs.readFile(DESC_FILE, 'utf8'));
    console.log(`Loaded ${Object.keys(existing).length} existing descriptions.\n`);
  } catch {
    console.log('No existing descriptions.json — starting fresh.\n');
  }

  const files = await walkMdx(CONTENT_DIR);
  let fetched = 0, skipped = 0, premium = 0, failed = 0, count = 0;

  for (const file of files) {
    if (count >= LIMIT) break;

    const raw = await fs.readFile(file, 'utf8');
    if (!raw.includes(PLACEHOLDER)) { skipped++; continue; }

    const slug = extractSlug(raw);
    if (!slug) {
      console.log(`[skip] no slug in ${path.basename(file)}`);
      skipped++;
      continue;
    }

    if (!FORCE && existing[slug]) {
      skipped++;
      continue;
    }

    count++;
    process.stdout.write(`[${String(count).padStart(3)}] ${slug.padEnd(55)} `);

    await new Promise(r => setTimeout(r, DELAY_MS));

    const html = await fetchContent(slug);

    if (html === '[PREMIUM]') {
      console.log('PREMIUM (skipped)');
      existing[slug] = '[PREMIUM]';
      premium++;
    } else if (!html) {
      console.log('FAILED');
      failed++;
    } else {
      const md = htmlToMarkdown(html);
      if (!md) {
        console.log('EMPTY');
        failed++;
      } else {
        console.log(`OK  (${md.length} chars)`);
        existing[slug] = md;
        fetched++;
      }
    }
  }

  // Save
  if (!DRY_RUN && (fetched > 0 || premium > 0)) {
    await fs.mkdir(path.dirname(DESC_FILE), { recursive: true });
    await fs.writeFile(DESC_FILE, JSON.stringify(existing, null, 2), 'utf8');
    console.log(`\nSaved → ${path.relative(process.cwd(), DESC_FILE)}`);
  }

  console.log(
    `\n✓ Fetched: ${fetched}  Premium: ${premium}  Failed: ${failed}  Already present/no-placeholder: ${skipped}`
  );
  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
