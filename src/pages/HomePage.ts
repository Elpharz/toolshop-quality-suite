import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { ProductSort } from '../api/types';

/** Product overview / landing page ("/"). */
export class HomePage extends BasePage {
  readonly productCards: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly searchInput: Locator;
  readonly searchSubmit: Locator;
  readonly searchCaption: Locator;
  readonly searchCompleted: Locator;
  readonly sortSelect: Locator;
  readonly sortingCompleted: Locator;

  constructor(page: Page) {
    super(page);
    this.productCards = page.locator('a[data-test^="product-"]');
    this.productNames = page.getByTestId('product-name');
    this.productPrices = page.getByTestId('product-price');
    this.searchInput = page.getByTestId('search-query');
    this.searchSubmit = page.getByTestId('search-submit');
    this.searchCaption = page.getByTestId('search-caption');
    this.searchCompleted = page.getByTestId('search_completed');
    this.sortSelect = page.getByTestId('sort');
    this.sortingCompleted = page.getByTestId('sorting_completed');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.productNames.first().waitFor();
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchSubmit.click();
    await this.searchCompleted.waitFor();
  }

  /**
   * Sorting re-renders the grid after an API call. The app renders a
   * `sorting_completed` marker when the new list is in place, so wait for
   * that instead of a fixed timeout.
   */
  async sortBy(sort: ProductSort): Promise<void> {
    await this.sortSelect.selectOption(sort);
    await this.sortingCompleted.waitFor();
    await this.productNames.first().waitFor();
  }

  async openProduct(name: string): Promise<void> {
    await this.productNames.filter({ hasText: name }).first().click();
  }

  /** Prices as numbers, e.g. "$14.15" -> 14.15. */
  async visiblePrices(): Promise<number[]> {
    const texts = await this.productPrices.allTextContents();
    return texts.map((t) => Number(t.replace(/[^0-9.]/g, '')));
  }

  async visibleNames(): Promise<string[]> {
    return (await this.productNames.allTextContents()).map((t) => t.trim());
  }
}
