import { Locator, Page } from '@playwright/test';

export class TaskPage {
  readonly page: Page;
  readonly filterButton: Locator;
  readonly comboboxPopover: Locator;
  readonly filterList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filterButton = page.getByTestId('filter-button');
    this.comboboxPopover = page.getByTestId('combobox-popover');
    this.filterList = page.getByTestId('filter-list');
  }

  async goto() {
    await this.page.goto('/fastApp/tasks', { timeout: 5000 });
  }

  async getListItem(index: number) {
    return this.page.getByTestId('list-item').nth(index);
  }

  //   async getListItem(index: number) {
  //     return this.page.getByTestId('list-item').nth(index);
  //   }

  //   async openFilter() {
  //     await this.filterButton.click();
  //   }

  //   async selectFilterOption(option: string) {
  //     await this.comboboxPopover.getByText(option).click();
  //   }

  //   async changeFilterCondition(currentCondition: string, newCondition: string) {
  //     await this.filterList.getByText(currentCondition).click();
  //     await this.comboboxPopover.getByText(newCondition).click();
  //   }

  //   async closePopover() {
  //     await this.page.getByText('tasks').first().click({ force: true });
  //   }

  //   async expectTextVisible(text: string | RegExp) {
  //     await expect(this.page.getByText(text)).toBeVisible();
  //   }

  //   async expectTextHidden(text: string | RegExp) {
  //     await expect(this.page.getByText(text)).toBeHidden();
  //   }

  //   async expectTextCount(text: string | RegExp, count: number) {
  //     await expect(this.page.getByText(text)).toHaveCount(count);
  //   }
}
