import {
  CommandformProps,
  getFieldLabel,
  MakeCommandformPropsOption,
  makeDayMonthString,
  makeRowFromField,
  makeRowFromValue,
  RecordType,
  Row,
} from '@apps-next/core';

import { CommandFormBadge } from '@apps-next/ui';
import { store$ } from '../legend-store';
import { commandbarProps$ } from '../legend-store/legend.commandbar.derived';
import { derivedCommandformState$ } from '../legend-store/legend.commandform.derived';
import {
  ComboboxFieldValue,
  DefaultComboboxFieldValue,
} from '../ui-components/render-combobox-field-value';

export const makeCommandformProps = <T extends RecordType>(
  options?: MakeCommandformPropsOption<T>
): CommandformProps => {
  commandbarProps$.set(options ?? {});

  const state = derivedCommandformState$.get();

  return {
    ...state,
    render: ({ field, id, label }) => {
      const view = store$.commandform.view.get();
      if (!view || !field) return null;

      const newRow = store$.commandform.row.get();
      const hasField = !!newRow?.raw?.[field.name];

      const value =
        newRow && hasField ? newRow?.getValue?.(field.name) : undefined;

      if (!field) return null;

      if (hasField && value && !Array.isArray(value) && newRow) {
        const nonRelationalValue = field.enum
          ? makeRowFromValue(value, field)
          : field.type === 'Date' && typeof value === 'number'
          ? makeRowFromValue(makeDayMonthString(new Date(value)), field)
          : field.type === 'Date'
          ? makeRowFromValue(value, field)
          : null;

        return (
          <CommandFormBadge active>
            <ComboboxFieldValue
              row={newRow as Row}
              field={field}
              value={nonRelationalValue ?? value}
            />
          </CommandFormBadge>
        );
      }

      if (hasField && value && Array.isArray(value) && value.length && newRow) {
        const value = newRow?.raw?.[field.name];

        return (
          <CommandFormBadge active>
            {value.length > 1 ? (
              <>
                <DefaultComboboxFieldValue
                  fieldName={field.name}
                  row={makeRowFromValue(
                    `${value.length} ${getFieldLabel(field)}`,
                    field
                  )}
                />
              </>
            ) : (
              // TODO Render own ocmponent like commandform-selected-item
              <ComboboxFieldValue
                row={newRow as Row}
                field={field}
                value={value[0] as Row}
              />
            )}
          </CommandFormBadge>
        );
      }

      return (
        <CommandFormBadge>
          <DefaultComboboxFieldValue
            row={makeRowFromField(field)}
            fieldName={field.name}
          />
        </CommandFormBadge>
      );
    },
  };
};
