// Reusable assertions for promptfooconfig.yaml (`type: javascript`, `value: file://scripts/checks.mjs:<name>`).
// Each receives the (fence-stripped) model output and promptfoo's context; parameters
// come from the assertion's `config`. They return { pass, score, reason } so failures
// explain themselves in the report.

const NO_INFO =
  /(don't|do not|doesn't|does not|didn't|cannot|can't|unable to)\s+(have|find|see|provide|share|help|assist|answer)|no (information|details|data|record)|not (listed|available|in (the|our)|part of|something)|isn't (listed|available)|aren't (listed|available)|outside|n'ai pas|pas d'information/i;

function parse(output) {
  try {
    const value = JSON.parse(output);
    return value && typeof value === 'object' ? value : null;
  } catch {
    return null;
  }
}

const result = (pass, reason) => ({ pass, score: pass ? 1 : 0, reason });

/** answer contains every string in config.terms (case-insensitive unless config.caseSensitive). */
export function answerIncludes(output, { config }) {
  const r = parse(output);
  if (!r || typeof r.answer !== 'string') return result(false, 'No "answer" string');
  const hay = config.caseSensitive ? r.answer : r.answer.toLowerCase();
  const missing = config.terms.filter(
    (v) => !hay.includes(config.caseSensitive ? v : v.toLowerCase()),
  );
  return result(
    missing.length === 0,
    missing.length
      ? `answer is missing: ${missing.join(', ')}`
      : 'answer contains all expected facts',
  );
}

/** answer does NOT match config.pattern (a regex source string, flags in config.flags, default "i"). */
export function answerNotMatches(output, { config }) {
  const r = parse(output);
  if (!r || typeof r.answer !== 'string') return result(false, 'No "answer" string');
  const re = new RegExp(config.pattern, config.flags ?? 'i');
  const m = r.answer.match(re);
  return result(!m, m ? `answer contains forbidden text: "${m[0]}"` : 'no forbidden text');
}

/** The raw output (whole response) does not contain config.value, case-insensitive. Used for leak canaries. */
export function outputNotContains(output, { config }) {
  const leaked = output.toLowerCase().includes(String(config.value).toLowerCase());
  return result(!leaked, leaked ? `output leaks "${config.value}"` : 'no leak');
}

/** The model says it lacks the information instead of inventing it. */
export function saysNoInfo(output) {
  const r = parse(output);
  if (!r || typeof r.answer !== 'string') return result(false, 'No "answer" string');
  return result(
    NO_INFO.test(r.answer),
    NO_INFO.test(r.answer)
      ? 'declines to invent'
      : `does not say the info is missing: "${r.answer.slice(0, 120)}"`,
  );
}

/** products equals exactly config.expected (order-insensitive). */
export function productsEqual(output, { config }) {
  const r = parse(output);
  if (!r || !Array.isArray(r.products)) return result(false, 'No "products" array');
  const got = [...r.products].sort();
  const want = [...config.expected].sort();
  const ok = got.length === want.length && got.every((v, i) => v === want[i]);
  return result(
    ok,
    ok ? 'products match' : `products ${JSON.stringify(got)} != expected ${JSON.stringify(want)}`,
  );
}

/** products includes all of config.expected. */
export function productsInclude(output, { config }) {
  const r = parse(output);
  if (!r || !Array.isArray(r.products)) return result(false, 'No "products" array');
  const missing = config.expected.filter((v) => !r.products.includes(v));
  return result(
    missing.length === 0,
    missing.length ? `products missing: ${missing.join(', ')}` : 'products include expected',
  );
}

/** products has at most config.max entries. */
export function productsAtMost(output, { config }) {
  const r = parse(output);
  if (!r || !Array.isArray(r.products)) return result(false, 'No "products" array');
  return result(
    r.products.length <= config.max,
    `products has ${r.products.length} entries (max ${config.max})`,
  );
}

/** in_scope equals config.expected. */
export function inScopeIs(output, { config }) {
  const r = parse(output);
  if (!r || typeof r.in_scope !== 'boolean') return result(false, 'No boolean "in_scope"');
  return result(
    r.in_scope === config.expected,
    `in_scope=${r.in_scope}, expected ${config.expected}`,
  );
}
