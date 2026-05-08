import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPREADSHEET_PATH = path.resolve(__dirname, '../../DSASpreadSheetJava.xlsx');
const SHEET_NAME = 'TIHB169Java';

// Spreadsheet Topic label → content-collection topic slug + src directory name
const TOPIC_META = {
  'Array':                { slug: 'array',               dir: 'array'               },
  'Binary':               { slug: 'binary',              dir: 'binary'              },
  'Binary Search':        { slug: 'binary_search',       dir: 'binary_search'       },
  'Binary Search Tree':   { slug: 'binary_search_tree',  dir: 'binary_search_tree'  },
  'Binary Tree':          { slug: 'binary_tree',         dir: 'binary_tree'         },
  'Dynamic Programming':  { slug: 'dynamic_programming', dir: 'dynamic_programming' },
  'Graph':                { slug: 'graph',               dir: 'graph'               },
  'Hash Table':           { slug: 'hash_table',          dir: 'hash_table'          },
  'Heap':                 { slug: 'heap',                dir: 'heap'                },
  'Linked List':          { slug: 'linked_list',         dir: 'linked_list'         },
  'Math':                 { slug: 'math',                dir: 'math'                },
  'Matrix':               { slug: 'matrix',              dir: 'matrix'              },
  'Queue':                { slug: 'queue',               dir: 'queue'               },
  'Recursion':            { slug: 'recursion',           dir: 'recursion'           },
  'Stack':                { slug: 'stack',               dir: 'stack'               },
  'String':               { slug: 'string',              dir: 'string'              },
  'Trie':                 { slug: 'trie',                dir: 'trie'                },
};

/**
 * Read the spreadsheet and return an array of structured problem metadata.
 *
 * @returns {Array<{
 *   seqNo: number,
 *   topicSeqNo: number,
 *   topic: string,        // content-collection slug (e.g. "array")
 *   topicDir: string,     // src/ directory name (e.g. "array")
 *   difficulty: 'Easy'|'Medium'|'Hard',
 *   title: string,
 *   leetcodeUrl: string,
 *   githubUrl: string,
 *   className: string,    // Java class name without .java extension
 *   status: string,
 * }>}
 */
export function readSpreadsheet() {
  const wb = XLSX.readFile(SPREADSHEET_PATH, { cellHyperlinks: true });
  const ws = wb.Sheets[SHEET_NAME];

  if (!ws) {
    throw new Error(
      `Sheet "${SHEET_NAME}" not found in spreadsheet.\nAvailable sheets: ${wb.SheetNames.join(', ')}`
    );
  }

  const range = XLSX.utils.decode_range(ws['!ref']);
  const problems = [];

  // Row 0 is the header row; data starts at row 1
  for (let row = 1; row <= range.e.r; row++) {
    const seqNo    = cellValue(ws, row, 0); // A — S.No.
    const topic    = cellValue(ws, row, 1); // B — Topic
    const topicSeq = cellValue(ws, row, 2); // C — Topic S.No.
    const diff     = cellValue(ws, row, 3); // D — Difficuly (sic)

    const problemCell  = ws[XLSX.utils.encode_cell({ r: row, c: 4 })]; // E — Problem
    const statusCell   = ws[XLSX.utils.encode_cell({ r: row, c: 5 })]; // F — Sandeep Status
    const commentCell  = ws[XLSX.utils.encode_cell({ r: row, c: 6 })]; // G — Sandeep Comments

    // Skip blank rows
    if (!seqNo || !topic) continue;

    const title       = String(problemCell?.v  ?? '').trim();
    const leetcodeUrl = String(problemCell?.l?.Target ?? fallbackLeetcodeUrl(title));
    const className   = String(commentCell?.v  ?? '').trim();
    const githubUrl   = String(commentCell?.l?.Target ?? fallbackGithubUrl(topic, className));
    const status      = String(statusCell?.v   ?? '').trim();

    const topicMeta = TOPIC_META[topic] ?? {
      slug: topic.toLowerCase().replace(/\s+/g, '_'),
      dir:  topic.toLowerCase().replace(/\s+/g, '_'),
    };

    problems.push({
      seqNo:      Number(seqNo),
      topicSeqNo: Number(topicSeq ?? 0),
      topic:      topicMeta.slug,
      topicDir:   topicMeta.dir,
      difficulty: normalizeDifficulty(String(diff ?? '')),
      title,
      leetcodeUrl,
      githubUrl,
      className,
      status,
    });
  }

  return problems;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function cellValue(ws, row, col) {
  return ws[XLSX.utils.encode_cell({ r: row, c: col })]?.v ?? null;
}

function normalizeDifficulty(raw) {
  const s = raw.trim().toLowerCase();
  if (s === 'easy')   return 'Easy';
  if (s === 'hard')   return 'Hard';
  return 'Medium';
}

/** Fallback: derive LeetCode URL from problem title slug. */
function fallbackLeetcodeUrl(title) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `https://leetcode.com/problems/${slug}/`;
}

/** Fallback: construct GitHub URL from known repo structure. */
function fallbackGithubUrl(topicLabel, className) {
  const meta = TOPIC_META[topicLabel];
  if (!meta || !className) return '';
  const file = className.endsWith('.java') ? className : `${className}.java`;
  return `https://github.com/sandypkumr/TechInterviewHandbookJava169/blob/master/src/${meta.dir}/${file}`;
}
