import { test, expect } from '../../src/fixtures';

test.describe('Cart API', () => {
  let cartId: string | undefined;

  test.afterEach(async ({ api }) => {
    if (cartId) await api.deleteCart(cartId);
    cartId = undefined;
  });

  test('cart lifecycle: create, add, update quantity, remove @smoke', async ({ api }) => {
    const product = await api.findProductByName('Combination Pliers');
    cartId = await api.createCart();

    await api.addToCart(cartId, product.id, 2);
    let cart = await api.cart(cartId);
    expect(cart.cart_items).toHaveLength(1);
    expect(cart.cart_items[0]).toMatchObject({ product_id: product.id, quantity: 2 });

    await api.updateCartQuantity(cartId, product.id, 5);
    cart = await api.cart(cartId);
    expect(cart.cart_items[0]?.quantity).toBe(5);

    await api.removeFromCart(cartId, product.id);
    cart = await api.cart(cartId);
    expect(cart.cart_items).toEqual([]);
  });

  test('adding a non-existent product is rejected with 422', async ({ api }) => {
    cartId = await api.createCart();

    const response = await api.rawAddToCart(cartId, 'not-a-product', 1);

    expect(response.status()).toBe(422);
    const body = (await response.json()) as { errors: Record<string, string[]> };
    expect(body.errors.product_id?.[0]).toMatch(/invalid/i);
  });
});
