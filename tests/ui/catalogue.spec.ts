import { test, expect } from '../../src/fixtures';
import { isSortedAscending } from '../../src/support/helpers';

test.describe('Catalogue UI', () => {
  test('home page lists a full page of products @smoke', async ({ homePage, api }) => {
    const { per_page } = await api.products();

    await homePage.goto();

    await expect(homePage.productCards).toHaveCount(per_page);
  });

  test('search shows only matching products and a caption', async ({ homePage }) => {
    await homePage.goto();

    await homePage.search('pliers');

    await expect(homePage.searchCaption).toContainText('pliers');
    const names = await homePage.visibleNames();
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) expect(name.toLowerCase()).toContain('pliers');
  });

  test('sorting by price low to high orders the grid ascending', async ({ homePage }) => {
    await homePage.goto();

    await homePage.sortBy('price,asc');

    // Poll: the grid can re-render once more after the marker appears.
    await expect
      .poll(async () => {
        const prices = await homePage.visiblePrices();
        return prices.length > 1 && isSortedAscending(prices);
      })
      .toBe(true);
  });

  test('product page shows the same name and price as the API', async ({ productPage, api }) => {
    const product = await api.findProductByName('Thor Hammer');

    await productPage.goto(product.id);

    await expect(productPage.name).toHaveText(product.name);
    await expect(productPage.unitPrice).toHaveText(product.price.toFixed(2));
    await expect(productPage.addToCartButton).toBeEnabled();
  });
});
