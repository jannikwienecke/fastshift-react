import {
  ContextMenuFieldItem,
  ContextMenuUiOptions,
  MakeContextMenuPropsOptions,
  makeRowFromValue,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { store$ } from './legend.store';

export const contextMenuProps = observable<
  Partial<MakeContextMenuPropsOptions>
>({});

export const derviedContextMenuOptions = observable(() => {
  const contextmenuState = store$.contextMenuState.get();
  console.log('DERIVED CONTEXT MENU', contextmenuState);
  const viewConfigManager = store$.viewConfigManager.get();
  const relationalValues = store$.relationalDataModel;

  const fieldsToRender = viewConfigManager
    .getViewFieldList()
    .filter((f) => f.relation || f.enum)
    .map((f) => {
      const enumOptions = f.enum
        ? f.enum.values.map((v) => makeRowFromValue(v.name, f))
        : null;

      const relationalValuesForField = relationalValues[f.name]?.get();

      return {
        ...f,
        options: enumOptions
          ? enumOptions
          : relationalValuesForField?.rows ?? [],
      } as ContextMenuFieldItem;
    });

  return {
    ...contextmenuState,
    isOpen: !!contextmenuState.rect,
    onClose: () => store$.contextMenuClose(),
    fields: fieldsToRender,
  } satisfies ContextMenuUiOptions;
});
