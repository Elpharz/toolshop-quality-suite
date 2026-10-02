import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Step 1 of checkout ("/checkout"): the cart overview. */
export class CartPage extends BasePage {
  readonly lineTitles: Locator;
  readonly lineQuantities: Locator;
  readonly linePrices: Locator;
  readonly lineTotals: Locator;
  readonly cartTotal: Locator;
  readonly proceedToSignIn: Locator;

  constructor(page: Page) {
    super(page);
    this.lineTitles = page.getByTestId('product-title');
    this.lineQuantities = page.getByTestId('product-quantity');
    this.linePrices = page.getByTestId('product-price');
    this.lineTotals = page.getByTestId('line-price');
    this.cartTotal = page.getByTestId('cart-total');
    this.proceedToSignIn = page.getByTestId('proceed-1');
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout');
  }

  static money(text: string | null): number {
    return Number((text ?? '').replace(/[^0-9.]/g, ''));
  }
}
