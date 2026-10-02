import { test, expect } from '../../src/fixtures';
import { env } from '../../src/config/env';

test.describe('Sign-in UI', () => {
  test('customer can sign in and lands on My account @smoke', async ({
    page,
    loginPage,
    accountPage,
  }) => {
    await loginPage.goto();

    await loginPage.login(env.customer.email, env.customer.password);

    await expect(page).toHaveURL(/\/account$/);
    await expect(accountPage.title).toHaveText('My account');
    await expect(accountPage.navUserMenu).toHaveText(env.customer.fullName);
  });

  test('wrong password shows an error and stays on the login page', async ({ page, loginPage }) => {
    await loginPage.goto();

    await loginPage.login(env.customer.email, 'definitely-wrong-password');

    await expect(loginPage.error).toHaveText('Invalid email or password');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('API-issued token signs the browser in without the login form', async ({
    customerPage,
    accountPage,
  }) => {
    await customerPage.goto('/account');

    await expect(accountPage.title).toHaveText('My account');
    await expect(accountPage.navUserMenu).toHaveText(env.customer.fullName);
  });
});
