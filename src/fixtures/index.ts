import { test as base, expect, Page, request as playwrightRequest } from '@playwright/test';
import { ToolshopApiClient } from '../api/ToolshopApiClient';
import { env } from '../config/env';
import { AccountPage, CartPage, HomePage, LoginPage, ProductPage } from '../pages';

interface Fixtures {
  api: ToolshopApiClient;
  customerToken: string;
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  loginPage: LoginPage;
  accountPage: AccountPage;
  /** A browser page already signed in as the demo customer (token injected, no UI login). */
  customerPage: Page;
}

export const test = base.extend<Fixtures>({
  // A dedicated API context so UI specs can also call the API for setup and
  // cross-checks, independent of the page's baseURL.
  api: async ({}, use) => {
    const context = await playwrightRequest.newContext({
      baseURL: `${env.apiUrl.replace(/\/$/, '')}/`,
      extraHTTPHeaders: { Accept: 'application/json' },
    });
    await use(new ToolshopApiClient(context));
    await context.dispose();
  },

  customerToken: async ({ api }, use) => {
    const { access_token } = await api.login(env.customer.email, env.customer.password);
    await use(access_token);
  },

  homePage: async ({ page }, use) => use(new HomePage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  accountPage: async ({ page }, use) => use(new AccountPage(page)),

  customerPage: async ({ page, customerToken }, use) => {
    // The Angular app keeps the JWT in localStorage under "auth-token".
    await page.addInitScript((token) => {
      window.localStorage.setItem('auth-token', token);
    }, customerToken);
    await use(page);
  },
});

export { expect };
