/**
 * Phase 3 — Content Generation Pipeline
 *
 * Usage:
 *   node generate-content.mjs           # generate all (skip up-to-date files)
 *   node generate-content.mjs --force   # regenerate everything
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { readSpreadsheet }  from './lib/read-spreadsheet.mjs';
import { parseJavaFile }    from './lib/parse-java.mjs';
import { buildMDX }         from './lib/mdx-builder.mjs';
import { toSlug }           from './lib/slug.mjs';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT  = path.resolve(__dirname, '..');
const SRC_DIR    = path.join(REPO_ROOT, 'src');
const CONTENT_DIR = path.join(REPO_ROOT, 'docs/src/content/problems');

const FORCE = process.argv.includes('--force');

// ─── Column widths for pretty logging ───────────────────────────────────────
const COL_DIFF  = 6;
const COL_TOPIC = 22;
const COL_TITLE = 52;

function pad(str, len) { return String(str).padEnd(len).slice(0, len); }

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n════════════════════════════════════════════════════');
  console.log('  DSA Learning Portal — Content Generation Pipeline ');
  console.log('════════════════════════════════════════════════════\n');

  console.log('📖 Reading spreadsheet...');
  let problems;
  try {
    problems = readSpreadsheet();
  } catch (err) {
    console.error(`❌ Failed to read spreadsheet: ${err.message}`);
    process.exit(1);
  }
  console.log(`   ✓ ${problems.length} problems found.\n`);

  const stats = { generated: 0, skipped: 0, missing: [], errors: [] };

  // Group log output by topic for readability
  let lastTopic = '';

  for (const problem of problems) {
    const { title, topic, topicDir, difficulty, className, leetcodeUrl, githubUrl } = problem;

    // ── Determine Java source path ──────────────────────────────────────────
    // Prefer path derived from GitHub URL (most reliable)
    let javaPath = deriveLocalPath(githubUrl);
    // Fallback: construct from topicDir + className
    if (!javaPath) {
      const file = className.endsWith('.java') ? className : `${className}.java`;
      javaPath = path.join(SRC_DIR, topicDir, file);
    }

    // ── Parse Java file ─────────────────────────────────────────────────────
    const parsed = parseJavaFile(javaPath);
    if (!parsed) {
      stats.missing.push({ title, topic, topicDir, className, javaPath });
      continue;
    }

    // ── Build output path ────────────────────────────────────────────────────
    const slug    = toSlug(title);
    const outDir  = path.join(CONTENT_DIR, topic);
    const outPath = path.join(outDir, `${slug}.mdx`);

    // ── Skip-if-up-to-date ───────────────────────────────────────────────────
    if (!FORCE && fs.existsSync(outPath)) {
      const javaMtime = fs.statSync(javaPath).mtimeMs;
      const mdxMtime  = fs.statSync(outPath).mtimeMs;
      if (mdxMtime > javaMtime) {
        stats.skipped++;
        continue;
      }
    }

    // ── Write MDX ────────────────────────────────────────────────────────────
    try {
      fs.mkdirSync(outDir, { recursive: true });
      const mdx = buildMDX(problem, parsed);
      fs.writeFileSync(outPath, mdx, 'utf-8');
      stats.generated++;

      // Print topic header once
      if (topic !== lastTopic) {
        console.log(`\n  ── ${topic.replace(/_/g, ' ').toUpperCase()} ──`);
        lastTopic = topic;
      }

      const icon = parsed.hasProblemStatement ? '📝' : '  ';
      const tc   = parsed.timeComplexity  ? parsed.timeComplexity.padEnd(8)  : '?'.padEnd(8);
      const sc   = parsed.spaceComplexity ? parsed.spaceComplexity.padEnd(8) : '?'.padEnd(8);
      console.log(
        `  ${icon} ${pad(difficulty, COL_DIFF)} │ ${pad(title, COL_TITLE)} │ T:${tc} S:${sc}`
      );
    } catch (err) {
      stats.errors.push({ title, err: err.message });
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n\n════════════════════════════════════════════════════');
  console.log(` Generated: ${stats.generated}  │  Skipped (up-to-date): ${stats.skipped}  │  Missing Java: ${stats.missing.length}  │  Errors: ${stats.errors.length}`);
  console.log('════════════════════════════════════════════════════\n');

  if (stats.missing.length > 0) {
    console.log('⚠  Missing Java files (no MDX generated):');
    for (const m of stats.missing) {
      console.log(`   [${m.topic}] ${m.title} — expected: ${path.relative(REPO_ROOT, m.javaPath)}`);
    }
    console.log('');
  }

  if (stats.errors.length > 0) {
    console.log('❌ Errors:');
    for (const e of stats.errors) console.log(`   ${e.title}: ${e.err}`);
    console.log('');
  }

  console.log('Run "node validate-content.mjs" for a full completeness report.\n');

  if (stats.errors.length > 0) process.exit(1);
}

// ─── Helper: derive local path from GitHub URL ───────────────────────────────
// "https://github.com/sandypkumr/TechInterviewHandbookJava169/blob/master/src/array/TwoSum.java"
// → "{REPO_ROOT}/src/array/TwoSum.java"
function deriveLocalPath(githubUrl) {
  if (!githubUrl) return null;
  const match = githubUrl.match(/\/blob\/master\/(.+)$/);
  if (!match) return null;
  return path.join(REPO_ROOT, match[1]);
}

main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
