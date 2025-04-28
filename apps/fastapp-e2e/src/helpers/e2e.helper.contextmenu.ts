import { expect } from '@playwright/test';
import { PartialFixtures } from '../fixtures';

export async function openContextMenu(item: any, contextmenu: any) {
  await item.locator('div').first().click({ force: true, button: 'right' });
  await expect(contextmenu).toBeVisible();
}

export async function openContextMenu2(
  { helper, mainPage }: PartialFixtures,
  listItemIndex: number
) {
  const listItem = await helper.list.getListItem(listItemIndex);

  await listItem.locator
    .locator('div')
    .first()
    .click({ force: true, button: 'right' });

  await expect(mainPage.contextmenu).toBeVisible();
}
