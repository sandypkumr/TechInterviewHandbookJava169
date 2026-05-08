/**
 * Build the full MDX file content for a single problem.
 *
 * @param {object} meta    Row from readSpreadsheet()
 * @param {object|null} parsed  Result from parseJavaFile()
 * @returns {string}  Complete MDX content (frontmatter + body)
 */
export function buildMDX(meta, parsed) {
  const frontmatter = buildFrontmatter(meta, parsed);
  const body        = buildBody(meta, parsed);
  return `---\n${frontmatter}---\n\n${body}\n`;
}

// ─── Frontmatter ─────────────────────────────────────────────────────────────

function buildFrontmatter(meta, parsed) {
  const {
    title, difficulty, topic, leetcodeUrl, githubUrl,
  } = meta;

  const hasProblemStatement = parsed?.hasProblemStatement  ?? false;
  const timeComplexity      = parsed?.timeComplexity       ?? '';
  const spaceComplexity     = parsed?.spaceComplexity      ?? '';
  const javaApis            = parsed?.javaApis             ?? [];
  const patterns            = parsed?.patterns             ?? [];

  const enrichmentNeeded =
    !hasProblemStatement || !timeComplexity || !spaceComplexity || patterns.length === 0;

  const lines = [
    `title: ${qs(title)}`,
    `difficulty: ${qs(difficulty)}`,
    `topic: ${qs(topic)}`,
    `leetcodeUrl: ${qs(leetcodeUrl)}`,
    `githubUrl: ${qs(githubUrl)}`,
    `patterns: ${ja(patterns)}`,
    `tags: []`,
    `timeComplexity: ${qs(timeComplexity)}`,
    `spaceComplexity: ${qs(spaceComplexity)}`,
    `isPremium: false`,
    `hasProblemStatement: ${hasProblemStatement}`,
    `javaApis: ${ja(javaApis)}`,
    `similarProblems: []`,
    `enrichmentNeeded: ${enrichmentNeeded}`,
  ];

  return lines.join('\n') + '\n';
}

// ─── Body ────────────────────────────────────────────────────────────────────

function buildBody(meta, parsed) {
  const sections = [];

  // Problem description (from Javadoc)
  if (parsed?.javadoc) {
    sections.push(formatJavadoc(parsed.javadoc));
    sections.push('');
  } else {
    sections.push(`> 📝 **No problem description found in source.** Visit [LeetCode](${meta.leetcodeUrl}) for the problem statement.`);
    sections.push('');
  }

  // Metadata pills
  const pills = [];
  if (parsed?.timeComplexity)  pills.push(`**Time:** \`${parsed.timeComplexity}\``);
  if (parsed?.spaceComplexity) pills.push(`**Space:** \`${parsed.spaceComplexity}\``);
  if (parsed?.patterns?.length) {
    pills.push(`**Patterns:** ${parsed.patterns.map(p => `\`${p}\``).join(', ')}`);
  }
  if (pills.length) {
    sections.push(pills.join(' &nbsp;·&nbsp; '));
    sections.push('');
  }

  // Java solution code block
  if (parsed?.source) {
    sections.push('## Java Solution');
    sections.push('');
    sections.push('```java');
    sections.push(parsed.source.trimEnd());
    sections.push('```');
  }

  return sections.join('\n');
}

// ─── Javadoc → Markdown ──────────────────────────────────────────────────────

/** Escape characters that are special in MDX but literal in Javadoc prose. */
function escapeMDX(text) {
  return text
    .replace(/\{/g, '\\{')   // { → \{  (MDX JS expression)
    .replace(/\}/g, '\\}')   // } → \}
    .replace(/</g,  '&lt;')  // < → &lt; (JSX tag opener)
    .replace(/>/g,  '&gt;'); // > → &gt; (safe too)
}

function formatJavadoc(javadoc) {
  const lines = javadoc.split('\n');
  const out   = [];

  for (const line of lines) {
    const t = escapeMDX(line.trimEnd());

    if (/^Example\s*\d*\s*:/i.test(t)) {
      out.push(`\n**${t}**`);
    } else if (/^(Note|Constraints?|Follow.?up|Hint|Input|Output)\s*:/i.test(t)) {
      out.push(`\n**${t}**`);
    } else if (/^\d+\.\s/.test(t)) {
      out.push(t);  // numbered list item — preserve as-is
    } else {
      out.push(t);
    }
  }

  return out.join('\n').trim();
}

// ─── YAML helpers ────────────────────────────────────────────────────────────

/** Quoted string for YAML */
function qs(value) {
  const v = String(value ?? '');
  return JSON.stringify(v);
}

/** JSON array for YAML */
function ja(arr) {
  return JSON.stringify(Array.isArray(arr) ? arr : []);
}
