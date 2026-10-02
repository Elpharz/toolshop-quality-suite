// Structural anti-hallucination check applied to every case:
// every name in "products" must exist in the product-facts snapshot.
import { readFileSync } from 'node:fs';

const KNOWN = new Set(
  JSON.parse(
    readFileSync(new URL('../context/products.json', import.meta.url), 'utf8'),
  ).products.map((p) => p.name),
);

/** @param {string} output */
export default function assertKnownProducts(output) {
  let parsed;
  try {
    parsed = JSON.parse(output);
  } catch {
    return { pass: false, score: 0, reason: 'Output is not JSON, cannot check product names' };
  }
  const products = Array.isArray(parsed.products) ? parsed.products : [];
  const unknown = products.filter((name) => !KNOWN.has(name));
  return unknown.length === 0
    ? { pass: true, score: 1, reason: 'All referenced products exist in the facts' }
    : { pass: false, score: 0, reason: `Invented or misspelled product(s): ${unknown.join(', ')}` };
}
