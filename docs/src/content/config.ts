import { defineCollection, z } from 'astro:content';

const TOPICS = [
  'array', 'binary', 'binary_search', 'binary_search_tree',
  'binary_tree', 'dynamic_programming', 'graph', 'hash_table',
  'heap', 'linked_list', 'math', 'matrix', 'queue',
  'recursion', 'stack', 'string', 'trie',
] as const;

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

const CATEGORIES = ['java', 'algorithm', 'pattern', 'reference'] as const;

const problemsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    leetcodeNumber: z.number().optional(),
    leetcodeUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    difficulty: z.enum(DIFFICULTIES),
    topic: z.enum(TOPICS),
    patterns: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    timeComplexity: z.string().default(''),
    spaceComplexity: z.string().default(''),
    isPremium: z.boolean().default(false),
    hasProblemStatement: z.boolean().default(false),
    javaApis: z.array(z.string()).default([]),
    similarProblems: z.array(z.string()).default([]),
    enrichmentNeeded: z.boolean().default(false),
    lastUpdated: z.string().optional(),
  }),
});

const topicsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    topic: z.enum(TOPICS),
    description: z.string(),
    icon: z.string().optional(),
    problemCount: z.number().default(0),
    keyPatterns: z.array(z.string()).default([]),
  }),
});

const cheatsheetsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(CATEGORIES),
    tags: z.array(z.string()).default([]),
    lastUpdated: z.string().optional(),
  }),
});

export const collections = {
  problems: problemsCollection,
  topics: topicsCollection,
  cheatsheets: cheatsheetsCollection,
};
