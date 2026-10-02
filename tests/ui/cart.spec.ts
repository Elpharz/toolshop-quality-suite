import { test, expect } from '../../src/fixtures';
import { CartPage } from '../../src/pages';

test.describe('Cart UI', () => {
  test('adding a product updates the cart badge and shows a toast @smoke', async ({
    homePage,
    productPage,
  }) => {
    await homePage.goto();
    await homePage.openProduct('Combination Pliers');

    await productPage.addToCart();

    await expect(productPage.toast.first()).toContainText('Product added to shopping cart');
    await expect(productPage.cartQuantity).toHaveText('1');
  });

  test('cart shows the chosen quantity and a correct total', async ({
    productPage,
    cartPage,
    api,
  }) => {
    const product = await api.findProductByName('Combination Pliers');
    await productPage.goto(product.id);
    await productPage.setQuantity(3);
    await productPage.addToCart();
    await expect(productPage.cartQuantity).toHaveText('3');

    await productPage.openCart();

    await expect(cartPage.lineTitles).toHaveCount(1);
    await expect(cartPage.lineTitles.first()).toHaveText(product.name);
    await expect(cartPage.lineQuantities.first()).toHaveValue('3');
    const total = CartPage.money(await cartPage.cartTotal.textContent());
    expect(total).toBeCloseTo(product.price * 3, 2);
  });
});
