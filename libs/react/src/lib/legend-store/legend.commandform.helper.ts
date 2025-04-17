import { Row, ViewConfigType } from '@apps-next/core';
import { formHelper } from './legend.form.helper';
import { store$ } from './legend.store';

export const commandformHelper = () => {
  const view = store$.commandform.view.get() as ViewConfigType | undefined;
  const row = store$.commandform.row.get() as Row;

  if (!view) return null;

  const helper = formHelper(view, row);

  return {
    ...helper,
    getPrimitiveFormFields: () => {
      const primitiveFields = helper.getPrimitiveFormFields();
      if (!helper.displayField) return primitiveFields;

      return [helper.displayField, ...primitiveFields];
    },
  };
};
