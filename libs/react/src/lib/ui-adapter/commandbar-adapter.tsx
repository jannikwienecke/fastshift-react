import {
  CommandbarProps,
  CREATE_NEW_OPTION,
  MakeCommandbarPropsOption,
  makeRow,
  makeRowFromValue,
  NONE_OPTION,
  RecordType,
  Row,
} from '@apps-next/core';

import {
  CarIcon,
  CheckIcon,
  PencilIcon,
  PencilLineIcon,
  PlusIcon,
} from 'lucide-react';
import { store$ } from '../legend-store';
import {
  commandbarProps$,
  derivedCommandbarState$,
} from '../legend-store/legend.commandbar.derived';
import { getComponent } from '../ui-components/ui-components.helper';
import { Icon } from '../ui-components';
import {
  ComboboxFieldValue,
  DefaultComboboxFieldValue,
} from '../ui-components/render-combobox-field-value';
import { ComboboxNoneValue } from '../ui-components/render-combobox-none-value';
import { Checkbox, cn } from '@apps-next/ui';

export const makeCommandbarProps = <T extends RecordType>(
  options?: MakeCommandbarPropsOption<T>
): CommandbarProps => {
  commandbarProps$.set(options ?? {});

  const state = derivedCommandbarState$.get();

  return {
    ...state,
    renderItem(item, active, index) {
      const viewField = store$.commandbar.selectedViewField.get();
      const activeRow = store$.list.rowInFocus.row.get() as Row | null;
      if (viewField && viewField.type === 'String') {
        const IconOf = getComponent({
          fieldName: viewField?.name,
          componentType: 'icon',
        });

        return (
          <div className="flex flex-row gap-4 items-center">
            <div className=" text-foreground/50">
              {IconOf ? <Icon icon={IconOf} /> : <Icon icon={PencilLineIcon} />}
            </div>

            <div>
              {item.label + ' to '}
              <span className="text-foreground/70">
                "{store$.commandbar.query.get()}"
              </span>
            </div>
          </div>
        );
      } else if (viewField && viewField.type === 'Enum' && activeRow) {
        const rowValue = makeRowFromValue(item.id.toString(), viewField);
        const currentEnumValue = activeRow.getValue(viewField.name);
        const isSelected = currentEnumValue === item.id;

        return (
          <div className="flex flex-row items-center justify-between w-full">
            <ComboboxFieldValue
              field={viewField}
              value={rowValue}
              row={activeRow}
            />
            <div className="flex flex-row gap-2 items-center">
              {isSelected ? <CheckIcon className="text-foreground/80" /> : null}
              <div className="grid place-items-center text-[11px] h-6 border border-foreground/10 rounded-sm px-2">
                {index}
              </div>
            </div>
          </div>
        );
      } else if (
        viewField &&
        viewField.relation &&
        !viewField.relation.manyToManyRelation
      ) {
        const rowValue = item as Row;
        const idCurrentRow = activeRow?.getValue(viewField.name)?.id;
        const rowValueId = rowValue?.id ?? '';

        const isSelected =
          idCurrentRow === rowValueId ||
          (!idCurrentRow && rowValue.id === NONE_OPTION);

        const Component =
          rowValueId === NONE_OPTION ? ComboboxNoneValue : ComboboxFieldValue;

        const createNewOption = rowValue.id === CREATE_NEW_OPTION;

        return (
          <div className="flex flex-row items-center justify-between w-full">
            {createNewOption ? (
              <DefaultComboboxFieldValue
                fieldName={viewField.name}
                row={makeRow(
                  rowValue.id,
                  rowValue.label,
                  rowValue.id,
                  viewField
                )}
                icon={PlusIcon}
              />
            ) : (
              <Component field={viewField} value={rowValue} row={activeRow} />
            )}

            <div className="flex flex-row gap-2 items-center">
              {isSelected ? <CheckIcon className="text-foreground/80" /> : null}
              <div className="grid place-items-center text-[11px] h-6 border border-foreground/10 rounded-sm px-2">
                {index}
              </div>
            </div>
          </div>
        );
      } else if (viewField && viewField.relation) {
        const rowValue = item as Row;
        const idCurrentRow = activeRow?.getValue(viewField.name)?.id;
        const rowValueId = rowValue?.id ?? '';

        const isSelected =
          idCurrentRow === rowValueId ||
          (!idCurrentRow && rowValue.id === NONE_OPTION);

        const Component =
          rowValueId === NONE_OPTION ? ComboboxNoneValue : ComboboxFieldValue;

        const createNewOption = rowValue.id === CREATE_NEW_OPTION;

        return (
          <div className="flex flex-row items-center justify-between w-full">
            {createNewOption ? (
              <DefaultComboboxFieldValue
                fieldName={viewField.name}
                row={makeRow(
                  rowValue.id,
                  rowValue.label,
                  rowValue.id,
                  viewField
                )}
                icon={PlusIcon}
              />
            ) : (
              <div className="flex flex-row gap-2 items-center">
                <Checkbox className={cn(active ? 'visible' : 'invisible')} />
                <Component field={viewField} value={rowValue} row={activeRow} />
              </div>
            )}

            <div className="flex flex-row gap-2 items-center">
              {isSelected ? <CheckIcon className="text-foreground/80" /> : null}
              <div className="grid place-items-center text-[11px] h-6 border border-foreground/10 rounded-sm px-2">
                {index}
              </div>
            </div>
          </div>
        );
      }

      try {
        const field = store$.viewConfigManager.getFieldBy(item.id.toString());

        const row = makeRow(item.id.toString(), item.label, item, field);
        const Component = getComponent({
          fieldName: field?.name,
          componentType: 'commandbarFieldItem',
        });

        if (!Component) {
          const IconOf = getComponent({
            fieldName: field?.name,
            componentType: 'icon',
          });

          return (
            <div className="flex flex-row gap-4 items-center">
              <div className=" text-foreground/50">
                {IconOf ? (
                  <Icon icon={IconOf} />
                ) : (
                  <Icon icon={PencilLineIcon} />
                )}
              </div>

              <div>{row.label}</div>
            </div>
          );
        }

        return (
          <Component
            value={row}
            componentType={'commandbarFieldItem'}
            field={field}
          />
        );
      } catch (e) {
        console.error('Error rendering commandbar item', e);
        return (
          <div className="flex flex-row gap-2 items-center">{item.label}</div>
        );
      }
    },
  };
};
