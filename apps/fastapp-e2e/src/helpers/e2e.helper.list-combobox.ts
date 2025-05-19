import { Locator } from '@playwright/test';
import { PartialFixtures } from '../fixtures';
import { expect } from '@playwright/test';

export const listCombobox = ({ mainPage: taskPage }: PartialFixtures) => {
  const openListCombobox = async (listItem: Locator, name: string) => {
    await listItem.getByText(name).first().click({ force: true });

    await taskPage.comboboxPopover.waitFor({ state: 'visible' });
  };

  const openListComboboxWithTestId = async (
    listItem: Locator,
    testId: string
  ) => {
    await listItem.getByTestId(testId).first().click({ force: true });

    await taskPage.comboboxPopover.waitFor({ state: 'visible' });

    await expect(taskPage.comboboxPopover.getByTestId(testId)).toBeVisible();
  };

  const searchInCombobox = async (
    model: string,
    value: string,
    hiddenValue?: string
  ) => {
    const input = taskPage.comboboxPopover.getByPlaceholder(`Change ${model}`);

    await input.fill(value);

    await expect(
      taskPage.comboboxPopover.getByText(value).first()
    ).toBeVisible();
    if (hiddenValue) {
      await expect(
        taskPage.comboboxPopover.getByText(hiddenValue)
      ).toBeHidden();
    }
  };

  const pickOptionInCombobox = async (value: string) => {
    await taskPage.comboboxPopover.getByText(value).first().click();
    await expect(taskPage.comboboxPopover).toBeHidden();
  };

  const selectInCombobox = async (value: string) => {
    const item = taskPage.comboboxPopover.getByText(value);
    await item.locator('../../../..').getByRole('checkbox').first().click();
  };

  const isVisible = async (value: string) => {
    const item = taskPage.comboboxPopover.getByText(value);
    await expect(item).toBeVisible();
  };

  const isHidden = async (value: string) => {
    const item = taskPage.comboboxPopover.getByText(value);
    await expect(item).toBeHidden();
  };

  const isClosed = async () => {
    await expect(taskPage.comboboxPopover).toBeHidden();
  };

  return {
    openListCombobox,
    openListComboboxWithTestId,
    searchInCombobox,
    pickOptionInCombobox,
    selectInCombobox,
    isVisible,
    isHidden,
    isClosed,
  };
};
