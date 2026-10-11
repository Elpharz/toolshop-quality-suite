// Refreshes the product-facts snapshot the eval prompt is grounded in.
// Source: the public Toolshop REST API. Run: npm run context:refresh
// The snapshot is committed on purpose: evals must be reproducible, so the
// model always sees the same facts the expected answers were written against.
import { writeFile } from 'node:fs/promises';

const API = process.env.API_URL ?? 'https://api.practicesoftwaretesting.com';
const NAMES = [
  'Combination Pliers',
  'Long Nose Pliers',
  'Slip Joint Pliers',
  'Thor Hammer',
  'Claw Hammer',
  'Sledgehammer',
  'Wood Saw',
  'Phillips Screwdriver',
  'Safety Goggles',
  'Cordless Drill 12V',
];

const products = [];
for (const name of NAMES) {
  const res = await fetch(`${API}/products/search?q=${encodeURIComponent(name)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const body = await res.json();
  const p = body.data.find((x) => x.name === name);
  if (!p) throw new Error(`${name}: not found`);
  products.push({
    name: p.name,
    price_usd: p.price,
    brand: p.brand.name,
    category: p.category.name,
    in_stock: p.in_stock,
    co2_rating: p.co2_rating,
    eco_friendly: p.is_eco_friendly,
  });
}

const snapshot = {
  source: `${API}/products/search`,
  fetched_at: new Date().toISOString(),
  products,
};
await writeFile(
  new URL('../context/products.json', import.meta.url),
  JSON.stringify(snapshot, null, 2) + '\n',
);

const lines = [
  '| name | price (USD) | brand | category | in stock | CO2 rating | eco-friendly |',
  '| --- | --- | --- | --- | --- | --- | --- |',
  ...products.map(
    (p) =>
      `| ${p.name} | ${p.price_usd.toFixed(2)} | ${p.brand} | ${p.category} | ${p.in_stock ? 'yes' : 'no'} | ${p.co2_rating} | ${p.eco_friendly ? 'yes' : 'no'} |`,
  ),
];
await writeFile(new URL('../context/product-facts.md', import.meta.url), lines.join('\n') + '\n');
console.log(`Wrote ${products.length} products (fetched ${snapshot.fetched_at})`);
