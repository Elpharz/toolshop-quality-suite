import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Customer dashboard ("/account"). */
export class AccountPage extends BasePage {
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    // User-facing locator: the page's only level-1 heading. If anything other than the
    // dashboard is rendered (e.g. a Cloudflare challenge page, which has its own <h1>),
    // the toHaveText('My account') assertion fails with the heading that was actually shown.
    this.title = page.getByRole('heading', { level: 1 });
  }

  async goto(): Promise<void> {
    await this.page.goto('/account');
  }
}
