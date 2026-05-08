/**
 * Phase 3 — Content Validation Reporter
 *
 * Usage: node validate-content.mjs [--json]
 *
 * Reads all generated MDX files and reports:
 *  - Missing MDX (Java exists but no MDX generated)
 *  - No problem description (hasProblemStatement: false)
 *  - Missing time or space complexity
 *  - No patterns detected
 *  - Needs enrichment (enrichmentNeeded: true)
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { readSpreadsheet } from './lib/read-spreadsheet.mjs';
import { toSlug }          from './lib/slug.mjs';

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT   = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(REPO_ROOT, 'docs/src/content/problems');
const AS_JSON     = process.argv.includes('--json');

// ─── Frontmatter extractor (lightweight — avoids a full YAML parser dep) ─────

function readFrontmatter(mdxPath) {
  const raw = fs.readFileSync(mdxPath, 'utf-8');
  const m   = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};

  const fm = {};
  for (const line of m[1].split('\n')) {
    const eq = line.indexOf(':');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    fm[key] = val;
  }
  return fm;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const problems = readSpreadsheet();

  const report = {
    total:             problems.length,
    generated:         0,
    missing:           [],
    noDescription:     [],
    noTimeComplexity:  [],
    noSpaceComplexity: [],
    noPatterns:        [],
    enrichmentNeeded:  [],
    byTopic:           {},
  };

  for (const problem of problems) {
    const { title, topic, difficulty } = problem;
    const slug    = toSlug(title);
    const mdxPath = path.join(CONTENT_DIR, topic, `${slug}.mdx`);

    // Init topic bucket
    if (!report.byTopic[topic]) {
      report.byTopic[topic] = { total: 0, generated: 0, needsEnrichment: 0 };
    }
    report.byTopic[topic].total++;

    if (!fs.existsSync(mdxPath)) {
      report.missing.push({ title, topic, difficulty });
      continue;
    }

    report.generated++;
    report.byTopic[topic].generated++;

    const fm = readFrontmatter(mdxPath);

    if (fm.hasProblemStatement === 'false') {
      report.noDescription.push({ title, topic, difficulty });
    }
    if (!fm.timeComplexity || fm.timeComplexity === '""' || fm.timeComplexity === "''") {
      report.noTimeComplexity.push({ title, topic, difficulty });
    }
    if (!fm.spaceComplexity || fm.spaceComplexity === '""' || fm.spaceComplexity === "''") {
      report.noSpaceComplexity.push({ title, topic, difficulty });
    }
    if (fm.patterns === '[]') {
      report.noPatterns.push({ title, topic, difficulty });
    }
    if (fm.enrichmentNeeded === 'true') {
      report.enrichmentNeeded.push({ title, topic, difficulty });
      report.byTopic[topic].needsEnrichment++;
    }
  }

  // ── Output ─────────────────────────────────────────────────────────────────

  if (AS_JSON) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const W = 56;
  const hr = '═'.repeat(W);
  console.log(`\n${hr}`);
  console.log(' DSA Learning Portal — Content Validation Report');
  console.log(`${hr}\n`);

  console.log(`  Total problems    : ${report.total}`);
  console.log(`  MDX generated     : ${report.generated}  (${pct(report.generated, report.total)})`);
  console.log(`  Missing MDX       : ${report.missing.length}`);
  console.log(`  No description    : ${report.noDescription.length}`);
  console.log(`  No time complexity: ${report.noTimeComplexity.length}`);
  console.log(`  No space complexity:${report.noSpaceComplexity.length}`);
  console.log(`  No patterns       : ${report.noPatterns.length}`);
  console.log(`  Needs enrichment  : ${report.enrichmentNeeded.length}  (${pct(report.enrichmentNeeded.length, report.total)})`);

  // Per-topic table
  console.log(`\n  ${'Topic'.padEnd(24)} ${'Gen'.padStart(4)} / ${'Total'.padEnd(5)}  ${'Enrichment'.padStart(10)}`);
  console.log(`  ${'─'.repeat(52)}`);
  for (const [topic, b] of Object.entries(report.byTopic)) {
    const label  = topic.replace(/_/g, ' ').padEnd(24);
    const gen    = String(b.generated).padStart(4);
    const tot    = String(b.total).padEnd(5);
    const enrich = b.needsEnrichment > 0
      ? `⚠ ${b.needsEnrichment} need enrichment`.padStart(10)
      : '✓'.padStart(10);
    console.log(`  ${label} ${gen} / ${tot}  ${enrich}`);
  }

  // Detail lists (only if there are issues)
  printList('\n⚠  Missing MDX files:', report.missing);
  printList('\n📝 No problem description (needs manual enrichment):', report.noDescription, 30);
  printList('\n⏱  No time complexity detected:', report.noTimeComplexity, 30);
  printList('\n🧩 No patterns detected:', report.noPatterns, 30);

  const score = report.generated - report.enrichmentNeeded.length;
  console.log(`\n  Completeness score: ${score} / ${report.total} problems fully enriched.\n`);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(n, total) { return total ? `${Math.round(n / total * 100)}%` : '0%'; }

function printList(header, items, limit = Infinity) {
  if (!items.length) return;
  console.log(header);
  const show = items.slice(0, limit);
  for (const p of show) {
    console.log(`   [${p.topic.replace(/_/g, '-')}] ${p.title}  (${p.difficulty})`);
  }
  if (items.length > limit) {
    console.log(`   … and ${items.length - limit} more`);
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
