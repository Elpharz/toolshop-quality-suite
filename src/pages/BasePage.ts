import { Locator, Page } from '@playwright/test';

/**
 * Shared header/navigation elements. Page objects expose locators and
 * user-level actions only; assertions stay in the specs.
 */
export abstract class BasePage {
  readonly cartQuantity: Locator;
  readonly navCart: Locator;
  readonly navSignIn: Locator;
  readonly navUserMenu: Locator;
  readonly toast: Locator;

  constructor(protected readonly page: Page) {
    this.cartQuantity = page.getByTestId('cart-quantity');
    this.navCart = page.getByTestId('nav-cart');
    this.navSignIn = page.getByTestId('nav-sign-in');
    this.navUserMenu = page.getByTestId('nav-menu');
    this.toast = page.getByRole('alert');
  }

  async openCart(): Promise<void> {
    await this.navCart.click();
  }
}
