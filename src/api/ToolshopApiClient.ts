import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import type {
  Brand,
  Cart,
  Category,
  LoginResponse,
  Paginated,
  Product,
  ProductQuery,
  RegisterRequest,
  User,
} from './types';

/**
 * Thin, typed wrapper around Playwright's APIRequestContext.
 *
 * Two layers on purpose:
 *  - `raw*` methods return the APIResponse so negative tests can assert on
 *    status codes and error bodies.
 *  - the plain methods assert the happy-path status and return typed JSON.
 * The client never asserts business rules; that lives in the specs.
 */
export class ToolshopApiClient {
  private token: string | undefined;

  constructor(private readonly request: APIRequestContext) {}

  private headers(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  private async json<T>(response: APIResponse, expectedStatus: number): Promise<T> {
    expect(
      response.status(),
      `${response.url()} returned ${response.status()}: ${await response.text()}`,
    ).toBe(expectedStatus);
    return (await response.json()) as T;
  }

  // ---- auth -------------------------------------------------------------
  rawLogin(email: string, password: string): Promise<APIResponse> {
    return this.request.post('users/login', { data: { email, password } });
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const body = await this.json<LoginResponse>(await this.rawLogin(email, password), 200);
    this.token = body.access_token;
    return body;
  }

  useToken(token: string | undefined): this {
    this.token = token;
    return this;
  }

  rawRegister(user: Partial<RegisterRequest>): Promise<APIResponse> {
    return this.request.post('users/register', { data: user });
  }

  rawMe(): Promise<APIResponse> {
    return this.request.get('users/me', { headers: this.headers() });
  }

  async me(): Promise<User> {
    return this.json<User>(await this.rawMe(), 200);
  }

  // ---- catalogue --------------------------------------------------------
  async products(query: ProductQuery = {}): Promise<Paginated<Product>> {
    const params: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) params[key] = value as string | number;
    }
    return this.json<Paginated<Product>>(await this.request.get('products', { params }), 200);
  }

  rawProduct(id: string): Promise<APIResponse> {
    return this.request.get(`products/${encodeURIComponent(id)}`);
  }

  async product(id: string): Promise<Product> {
    return this.json<Product>(await this.rawProduct(id), 200);
  }

  async relatedProducts(id: string): Promise<Product[]> {
    return this.json<Product[]>(
      await this.request.get(`products/${encodeURIComponent(id)}/related`),
      200,
    );
  }

  async searchProducts(q: string): Promise<Paginated<Product>> {
    return this.json<Paginated<Product>>(
      await this.request.get('products/search', { params: { q } }),
      200,
    );
  }

  /** Looks a product up by exact name so tests never hard-code seeded IDs. */
  async findProductByName(name: string): Promise<Product> {
    const result = await this.searchProducts(name);
    const match = result.data.find((p) => p.name === name);
    if (!match) throw new Error(`Product "${name}" not found via /products/search`);
    return match;
  }

  async brands(): Promise<Brand[]> {
    return this.json<Brand[]>(await this.request.get('brands'), 200);
  }

  async categoryTree(): Promise<Category[]> {
    return this.json<Category[]>(await this.request.get('categories/tree'), 200);
  }

  // ---- cart -------------------------------------------------------------
  async createCart(): Promise<string> {
    const body = await this.json<{ id: string }>(await this.request.post('carts'), 201);
    return body.id;
  }

  rawAddToCart(cartId: string, productId: string, quantity: number): Promise<APIResponse> {
    return this.request.post(`carts/${cartId}`, {
      data: { product_id: productId, quantity },
    });
  }

  async addToCart(cartId: string, productId: string, quantity: number): Promise<void> {
    await this.json(await this.rawAddToCart(cartId, productId, quantity), 200);
  }

  async updateCartQuantity(cartId: string, productId: string, quantity: number): Promise<void> {
    const response = await this.request.put(`carts/${cartId}/product/quantity`, {
      data: { product_id: productId, quantity },
    });
    expect(response.ok(), `update quantity returned ${response.status()}`).toBeTruthy();
  }

  async cart(cartId: string): Promise<Cart> {
    return this.json<Cart>(await this.request.get(`carts/${cartId}`), 200);
  }

  async removeFromCart(cartId: string, productId: string): Promise<void> {
    const response = await this.request.delete(`carts/${cartId}/product/${productId}`);
    expect(response.status()).toBe(204);
  }

  async deleteCart(cartId: string): Promise<APIResponse> {
    return this.request.delete(`carts/${cartId}`);
  }
}
