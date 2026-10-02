import { test, expect } from '../../src/fixtures';
import { defined } from '../../src/support/helpers';

test.describe('Products API', () => {
  test('product list is paginated consistently @smoke', async ({ api }) => {
    const page1 = await api.products({ page: 1 });
    const page2 = await api.products({ page: 2 });

    expect(page1.current_page).toBe(1);
    expect(page1.data).toHaveLength(page1.per_page);
    expect(page1.last_page).toBe(Math.ceil(page1.total / page1.per_page));
    expect(page2.from).toBe(page1.per_page + 1);
    // No product appears on two pages.
    const ids1 = new Set(page1.data.map((p) => p.id));
    expect(page2.data.filter((p) => ids1.has(p.id))).toEqual([]);
  });

  test('sort=price,asc returns prices in ascending order', async ({ api }) => {
    const { data } = await api.products({ sort: 'price,asc' });
    const prices = data.map((p) => p.price);

    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('by_category filter only returns products from that category', async ({ api }) => {
    const { data: all } = await api.products();
    const category = defined(all[0], 'first product').category;

    const { data, total } = await api.products({ by_category: category.id });

    expect(total).toBeGreaterThan(0);
    for (const product of data) expect(product.category.id).toBe(category.id);
  });

  test('by_brand filter only returns products from that brand', async ({ api }) => {
    const brand = defined((await api.brands())[0], 'first brand');

    const { data, total } = await api.products({ by_brand: brand.id });

    expect(total).toBeGreaterThan(0);
    for (const product of data) expect(product.brand.id).toBe(brand.id);
  });

  test('between=price,10,20 only returns products in that price range', async ({ api }) => {
    const { data, total } = await api.products({ between: 'price,10,20' });

    expect(total).toBeGreaterThan(0);
    for (const product of data) {
      expect(product.price).toBeGreaterThanOrEqual(10);
      expect(product.price).toBeLessThanOrEqual(20);
    }
  });

  test('related products share the category and exclude the product itself', async ({ api }) => {
    const product = await api.findProductByName('Combination Pliers');

    const related = await api.relatedProducts(product.id);

    expect(related.length).toBeGreaterThan(0);
    for (const item of related) {
      expect(item.id).not.toBe(product.id);
      expect(item.category.id).toBe(product.category.id);
    }
  });

  test('product detail matches the list entry', async ({ api }) => {
    const { data } = await api.products();
    const listed = defined(data[0], 'first product');

    const detail = await api.product(listed.id);

    expect(detail).toMatchObject({
      id: listed.id,
      name: listed.name,
      price: listed.price,
      category: { id: listed.category.id },
      brand: { id: listed.brand.id },
    });
  });

  test('unknown product id returns 404', async ({ api }) => {
    const response = await api.rawProduct('01AAAAAAAAAAAAAAAAAAAAAAAA');

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: 'Requested item not found' });
  });

  test('search returns only matching products', async ({ api }) => {
    const { data } = await api.searchProducts('pliers');

    expect(data.length).toBeGreaterThan(0);
    for (const product of data) expect(product.name.toLowerCase()).toContain('pliers');
  });
});

test.describe('Catalogue reference data API', () => {
  test('brands have id, name and slug', async ({ api }) => {
    const brands = await api.brands();

    expect(brands.length).toBeGreaterThan(0);
    for (const brand of brands) {
      expect(brand).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          slug: expect.stringMatching(/^[a-z0-9-]+$/),
        }),
      );
    }
  });

  test('category tree nests sub-categories under top-level parents', async ({ api }) => {
    const tree = await api.categoryTree();

    expect(tree.length).toBeGreaterThan(0);
    for (const parent of tree) {
      expect(parent.parent_id).toBeNull();
      for (const child of parent.sub_categories ?? []) expect(child.parent_id).toBe(parent.id);
    }
    expect(tree.some((c) => (c.sub_categories ?? []).length > 0)).toBe(true);
  });
});
