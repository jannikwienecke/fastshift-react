import { CommandformProps, MakeCommandformPropsOption } from '@apps-next/core';
import { observable } from '@legendapp/state';
import {
  getComplexFormFields,
  getErrorListFromFormState,
  getFormState,
} from './legend.form.helper';
import { store$ } from './legend.store';
import { commandformHelper } from './legend.commandform.helper';

export const commandformProps$ = observable<
  Partial<MakeCommandformPropsOption>
>({});

export const derivedCommandformState$ = observable(() => {
  const helper = commandformHelper();

  if (!helper) return {} as CommandformProps;

  if (!store$.commandform.open.get()) {
    return {} as CommandformProps;
  }

  const formState = getFormState();

  return {
    ...(store$.commandform.get() ?? {}),

    formState,
    errors: getErrorListFromFormState(),
    primitiveFields: helper.getPrimitiveFormFields(),
    complexFields: helper.getComplexFormFields(),
    type: store$.commandform.type.get() ?? 'create',
    viewName: store$.commandform.view.viewName.get() ?? '',
    tableName: store$.commandform.view.tableName.get() ?? '',
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
