import {
  ContextMenuFieldItem,
  ContextMenuUiOptions,
  MakeContextMenuPropsOptions,
  makeRowFromValue,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { store$ } from './legend.store';
import { getComponent } from '../ui-components/ui-components.helper';

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
    // .filter((f) => f.relation || f.enum)
    .sort((a, b) => {
      const hasEnumOrRelationalA = a.enum || a.relation;
      const hasEnumOrRelationalB = b.enum || b.relation;

      if (hasEnumOrRelationalA && !hasEnumOrRelationalB) {
        return -1;
      }

      return 0;
    })
    .map((f) => {
      //   console.log(store$.viewsget());
      const views = store$.views.get();
      const view = Object.values(views).find((v) => v?.tableName === f.name);
      const iconForComponent = getComponent({
        componentType: 'icon',
        fieldName: f.name,
      });

      const Icon = iconForComponent ?? view?.icon;

      const enumOptions = f.enum
        ? f.enum.values.map((v) => makeRowFromValue(v.name, f))
        : null;

      const relationalValuesForField = relationalValues[f.name]?.get();

      return {
        ...f,
        Icon,
        options: enumOptions
          ? enumOptions
          : relationalValuesForField?.rows ?? null,
      } as ContextMenuFieldItem;
    });

  return {
    ...contextmenuState,
    isOpen: !!contextmenuState.rect,
    onClose: () => store$.contextMenuClose(),
    fields: fieldsToRender,
  } satisfies Omit<ContextMenuUiOptions, 'renderOption'>;
});
