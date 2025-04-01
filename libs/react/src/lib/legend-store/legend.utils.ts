import { makeData, Row } from '@apps-next/core';
import { store$ } from './legend.store';
import { observable } from '@legendapp/state';

export const copyRow = (row: Row): Row => {
  return makeData(
    store$.views.get(),
    store$.viewConfigManager.getViewName()
  )([{ ...row.raw }]).rows?.[0] as Row;
};

export const hasOpenDialog$ = observable(() => {
  const commandbarIsOpen = store$.commandbar.open.get();
  const commandformIsOpen = store$.commandform.open.get();
  const contextmenuIsOpen = store$.contextMenuState.rect.get() !== null;
  const filterIsOpen = store$.filter.open.get();
  const displayOptionsIsOpen = store$.displayOptions.isOpen.get();

  return (
    commandbarIsOpen ||
    commandformIsOpen ||
    contextmenuIsOpen ||
    filterIsOpen ||
    displayOptionsIsOpen
  );
});
