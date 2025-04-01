import {
  BaseViewConfigManager,
  ComboxboxItem,
  CommandformProps,
  getFieldLabel,
  MakeCommandformPropsOption,
  Row,
  ViewConfigType,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { getComponent } from '../ui-components/ui-components.helper';
import { store$ } from './legend.store';
import { getFormState } from './legend.commandform.helper';
import { comboboxStore$ } from './legend.store.derived.combobox';
import { makeComboboxProps } from '../ui-adapter';

export const commandformProps$ = observable<
  Partial<MakeCommandformPropsOption>
>({});

export const derivedCommandformState$ = observable(() => {
  const view = store$.commandform.view.get();

  if (!view) return {} as CommandformProps;

  if (!store$.commandform.open.get()) {
    return {} as CommandformProps;
  }

  const viewConfigManager = new BaseViewConfigManager(
    view as ViewConfigType,
    {}
  );

  const formState = getFormState();
  const newRow = store$.commandform.row.get();

  const complexFields = viewConfigManager
    .getViewFieldList()
    .filter((f) => f.hideFromForm !== true)
    .filter((field) => field.relation || field.enum || field.type === 'Date')
    .map((field) => {
      const icon = getComponent({
        fieldName: field.name,
        componentType: 'icon',
      });

      const value = newRow
        ? (newRow?.getValue?.(field.name) as Row | Row[])
        : undefined;

      const label = Array.isArray(value)
        ? ''
        : value?.id
        ? value.label
        : getFieldLabel(field, true);

      return {
        id: field.name,
        label,
        icon: icon ? icon : undefined,
        field,
      } satisfies ComboxboxItem;
    });

  const primitiveFields = viewConfigManager
    .getViewFieldList()
    .filter((f) => f.hideFromForm !== true)
    .filter((field) => !field.relation && !field.enum && field.type !== 'Date')
    .map((field) => {
      const icon = getComponent({
        fieldName: field.name,
        componentType: 'icon',
      });

      const value = newRow
        ? (newRow?.getValue?.(field.name) as string | number)
        : undefined;

      const label = getFieldLabel(field, true) ?? '';

      return {
        id: field.name,
        label,
        icon: icon ? icon : undefined,
        field,
        value: value,
      } satisfies ComboxboxItem;
    });

  return {
    ...store$.commandform.get(),

    formState,
    complexFields,
    primitiveFields,
    modal: !comboboxStore$.open.get(),

    onClose: () => {
      if (store$.commandform.rect.get()) {
        return;
      }

      store$.commandformClose();
    },
    onClick: (field, rect: DOMRect) => {
      if (field.field) {
        store$.commandform.rect.set(rect);
        store$.commandform.field.set(field.field);
      }
    },
    onInputChange(field, value) {
      store$.commandformChangeInput(field, value);
    },
    onCheckedChange: (field, value) => {
      store$.commandformChangeInput(field, value);
    },
    onSubmit: () => store$.commandformSubmit(),
  } satisfies Omit<CommandformProps, 'render'>;
});
