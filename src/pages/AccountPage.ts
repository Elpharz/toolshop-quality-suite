import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Customer dashboard ("/account"). */
export class AccountPage extends BasePage {
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('page-title');
  }

  async goto(): Promise<void> {
    await this.page.goto('/account');
  }
}
