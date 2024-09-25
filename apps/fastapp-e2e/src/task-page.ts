import { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class TaskPage {
  readonly page: Page;
  readonly filterButton: Locator;
  readonly comboboxPopover: Locator;
  readonly filterList: Locator;
  readonly datePicker: Locator;
  constructor(page: Page) {
    this.page = page;
    this.filterButton = page.getByTestId('filter-button');
    this.comboboxPopover = page.getByTestId('combobox-popover');
    this.filterList = page.getByTestId('filter-list');
    this.datePicker = page.getByTestId('date-picker');
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

  async removeFilter(label: string | RegExp) {
    await this.page.getByTestId(`remove-filter-${label}`).click();
  }

  async closePopover() {
    // eslint-disable-next-line playwright/no-force-option
    await this.page.getByText('tasks').first().click({ force: true });
  }

  async openFilter(label: string | RegExp) {
    await this.filterButton.click();
    await this.comboboxPopover.getByText(label).click();
  }

  async filterAndSelect(search: string, label: RegExp) {
    const input = this.page.getByPlaceholder(/filter/i);
    await input.fill(search);
    await this.comboboxPopover.getByText(label).click();
  }

  async filterBySpecificDate(date: string) {
    await this.openFilter(/dueDate/i);
    await this.filterAndSelect('select', /select specific date/i);

    await expect(this.datePicker.getByText('Su')).toBeVisible();
    await expect(this.datePicker.getByText('Mo')).toBeVisible();
    await expect(this.datePicker.getByText('Tu')).toBeVisible();

    const today = new Date();
    const day = today.getDate();
    await this.datePicker.getByText(day.toString()).click();
    await this.expectToSeeFilter(/dueDate/i, 'is', day.toString());
  }

  async expectToSeeFilter(
    label: string | RegExp,
    operator: string | RegExp,
    value: string | RegExp
  ) {
    const filterItem = this.filterList.getByText(label).locator('../..');
    await expect(filterItem.getByText(operator)).toBeVisible();
    await expect(filterItem.getByText(value)).toBeVisible();
  }
}
