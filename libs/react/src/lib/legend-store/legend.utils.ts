import { makeData, Row } from '@apps-next/core';
import { store$ } from './legend.store';

export const copyRow = (row: Row): Row => {
  return makeData(
    store$.views.get(),
    store$.viewConfigManager.getViewName()
  )([{ ...row.raw }]).rows?.[0] as Row;
};
