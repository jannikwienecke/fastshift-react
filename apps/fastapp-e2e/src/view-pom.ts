import { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class MainViewPage {
  readonly page: Page;
  readonly filterButton: Locator;
  readonly comboboxPopover: Locator;
  readonly filterList: Locator;
  readonly datePicker: Locator;
  readonly contextmenu: Locator;
  readonly displayOptions: Locator;
  readonly displayOptionsButton: Locator;
  readonly commandbar: Locator;
  readonly commandform: Locator;
  readonly detailHeader: Locator;
  readonly sidebar: Locator;
  readonly detailTabs: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filterButton = page.getByTestId('filter-button');
    this.comboboxPopover = page.getByTestId('combobox-popover');
    this.filterList = page.getByTestId('filter-list');
    this.datePicker = page.getByTestId('date-picker');
    this.contextmenu = page.getByTestId('contextmenu');
    this.displayOptions = page.getByTestId('display-options');
    this.displayOptionsButton = page.getByTestId('display-options-button');
    this.commandbar = page.getByTestId('commandbar');
    this.commandform = page.getByTestId('commandform');
    this.detailHeader = page.getByTestId('detail-page-header');
    this.sidebar = page.getByTestId('sidebar');
    this.detailTabs = page.getByTestId('detail-tabs');
  }

  async goto() {
    await this.page.goto('/fastApp/tasks', { timeout: 5000 });
  }

  async gotoPage(name: string) {
    await this.page.goto(`/fastApp/${name}`, { timeout: 5000 });
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
    await this.openFilter(/due Date/i);
    await this.filterAndSelect('select', /select specific date/i);

    await expect(this.datePicker.getByText('Su')).toBeVisible();
    await expect(this.datePicker.getByText('Mo')).toBeVisible();
    await expect(this.datePicker.getByText('Tu')).toBeVisible();

    const today = new Date();
    const day = today.getDate();
    // get by inner text "1"
    await this.datePicker.getByText(day.toString()).first().click();
    // await this.expectToSeeFilter(/dueDate/i, 'is' );
    await expect(this.filterList.getByText(/due Date/i)).toBeVisible();
    await expect(this.filterList.getByText(/is/i)).toBeVisible();
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
