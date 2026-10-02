#!/usr/bin/env node
// Turns a promptfoo JSON result file into a short, honest summary:
// counts, pass rate with a 95% Wilson confidence interval, per-category and
// per-check breakdowns, and the failing cases with reasons.
//
// Usage: node scripts/summary.mjs results/gemini.json [--label "Gemini run"]
//          [--expect 1|0] [--min 0.8]
//   --expect R  exit 1 unless the pass rate is exactly R (used for the mock controls)
//   --min R     exit 1 if the pass rate is below R (optional quality gate for real runs;
//               also read from EVAL_MIN_PASS_RATE)
// Writes Markdown to stdout, to results/summary-<file>.md and, in GitHub Actions,
// to the job summary.
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

const args = process.argv.slice(2);
const file = args[0];
if (!file) {
  console.error('usage: summary.mjs <promptfoo-results.json> [--label L] [--expect R] [--min R]');
  process.exit(2);
}
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i > -1 ? args[i + 1] : undefined;
};
const label = opt('label') ?? basename(file, '.json');

/** 95% Wilson score interval for k successes out of n trials. */
export function wilson(k, n, z = 1.96) {
  if (n === 0) return [0, 0];
  const p = k / n;
  const denom = 1 + (z * z) / n;
  const centre = (p + (z * z) / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, centre - half), Math.min(1, centre + half)];
}

const pct = (x) => `${(x * 100).toFixed(1)}%`;
const data = JSON.parse(readFileSync(file, 'utf8'));
const rows = data.results.results;
const provider = rows[0]?.provider?.label || rows[0]?.provider?.id || 'unknown';

let passed = 0;
let errors = 0;
const byCategory = new Map();
const byMetric = new Map();
const failures = [];

for (const r of rows) {
  const md = r.testCase?.metadata ?? {};
  const cat = md.category ?? 'uncategorised';
  const isError = !r.success && (r.failureReason === 2 || (r.error && !r.gradingResult));
  if (r.success) passed++;
  if (isError) errors++;
  const c = byCategory.get(cat) ?? { pass: 0, n: 0 };
  c.n++;
  if (r.success) c.pass++;
  byCategory.set(cat, c);
  for (const comp of r.gradingResult?.componentResults ?? []) {
    const metric = comp.assertion?.metric;
    if (!metric) continue;
    const m = byMetric.get(metric) ?? { pass: 0, n: 0 };
    m.n++;
    if (comp.pass) m.pass++;
    byMetric.set(metric, m);
  }
  if (!r.success) {
    const reasons = (r.gradingResult?.componentResults ?? [])
      .filter((c) => !c.pass)
      .map((c) => c.reason)
      .join('; ');
    failures.push(
      `| ${md.id ?? '?'} | ${cat} | ${(isError ? `ERROR: ${r.error}` : reasons).replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 160)} |`,
    );
  }
}

failures.sort();
const n = rows.length;
const rate = n ? passed / n : 0;
const [lo, hi] = wilson(passed, n);
const lines = [
  `### LLM eval summary: ${label}`,
  '',
  `- Provider: \`${provider}\``,
  `- Samples: **${n}** (cases × repeats) · passed **${passed}** · failed **${n - passed - errors}** · errors **${errors}**`,
  `- Pass rate: **${pct(rate)}** (95% Wilson CI ${pct(lo)}–${pct(hi)})`,
  '',
  '| Category | Passed | Pass rate | 95% CI |',
  '| --- | ---: | ---: | ---: |',
  ...[...byCategory.entries()].map(([cat, c]) => {
    const [l, h] = wilson(c.pass, c.n);
    return `| ${cat} | ${c.pass}/${c.n} | ${pct(c.pass / c.n)} | ${pct(l)}–${pct(h)} |`;
  }),
  '',
  '| Check run on every case | Passed |',
  '| --- | ---: |',
  ...[...byMetric.entries()].map(([m, c]) => `| ${m} | ${c.pass}/${c.n} |`),
  '',
  failures.length
    ? '| Failed case | Category | Reason |\n| --- | --- | --- |\n' + failures.join('\n')
    : '_No failures._',
  '',
  '_The interval treats samples as independent; repeats of the same case are correlated, so read the interval as approximate. Small n means wide intervals._',
  '',
];
const md = lines.join('\n');
console.log(md);
writeFileSync(file.replace(/[^/]+\.json$/, `summary-${basename(file, '.json')}.md`), md);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n');

const expect = opt('expect');
const min = opt('min') ?? (process.env.EVAL_MIN_PASS_RATE || undefined);
if (expect !== undefined && Math.abs(rate - Number(expect)) > 1e-9) {
  console.error(`Expected pass rate ${expect}, got ${rate}`);
  process.exit(1);
}
if (min !== undefined && rate < Number(min)) {
  console.error(`Pass rate ${rate} is below the minimum ${min}`);
  process.exit(1);
}
