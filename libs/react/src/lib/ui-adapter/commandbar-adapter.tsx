import {
  CommandbarProps,
  CREATE_NEW_OPTION,
  DELETE_OPTION,
  MakeCommandbarPropsOption,
  makeDayMonthString,
  makeRow,
  makeRowFromValue,
  NONE_OPTION,
  RecordType,
  Row,
  ViewConfigType,
} from '@apps-next/core';

import { Checkbox, cn } from '@apps-next/ui';
import {
  CalendarOffIcon,
  CheckIcon,
  PencilLineIcon,
  PlusIcon,
} from 'lucide-react';
import {
  comboboxStore$,
  getView,
  getViewConfigManager,
  store$,
} from '../legend-store';
import {
  commandbarProps$,
  derivedCommandbarState$,
} from '../legend-store/legend.commandbar.derived';
import { Icon } from '../ui-components';
import {
  ComboboxFieldValue,
  DefaultComboboxFieldValue,
} from '../ui-components/render-combobox-field-value';
import { ComboboxNoneValue } from '../ui-components/render-combobox-none-value';
import { getComponent } from '../ui-components/ui-components.helper';

export const makeCommandbarProps = <T extends RecordType>(
  options?: MakeCommandbarPropsOption<T>
): CommandbarProps => {
  commandbarProps$.set(options ?? {});
  comboboxStore$.get();

  const state = derivedCommandbarState$.get();

  return {
    ...state,
    renderItem(item, active, index, activeRow) {
      if (item.render) {
        return item.render(active, index);
      }

      const viewField = store$.commandbar.selectedViewField.get();
      let viewOfField: ViewConfigType | undefined;
      try {
        viewOfField = getView(item.id.toString());
      } catch (e) {
        //
      }

      if (!activeRow) return null;

      if (viewField && viewField.type === 'String') {
        const IconOf =
          getComponent({
            fieldName: viewField?.name,
            componentType: 'icon',
          }) || viewOfField?.icon;

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
      } else if (viewField && viewField.type === 'Date') {
        if (!activeRow) return null;
        const currentRowValue = activeRow.getValue?.(viewField.name);

        return (
          <div className="flex flex-row gap-2 items-center">
            <DefaultComboboxFieldValue
              row={item as Row}
              fieldName={viewField.name}
              icon={
                item.id === DELETE_OPTION
                  ? () => <CalendarOffIcon className="text-red-300" />
                  : undefined
              }
            />

            {item.id === DELETE_OPTION && currentRowValue ? (
              <div className="text-foreground/70 whitespace-nowrap">
                {makeDayMonthString(new Date(currentRowValue))}
              </div>
            ) : null}
          </div>
        );
      } else if (viewField && viewField.type === 'Enum' && activeRow) {
        const rowValue = makeRowFromValue(item.id.toString(), viewField);
        const currentEnumValue = activeRow.getValue?.(viewField.name);
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
        // const currentValue = getValue(activeRow, viewField.name) as
        //   | Row[]
        //   | undefined;

        const values = comboboxStore$.values.get();
        const selected = comboboxStore$.selected.get();

        const rowValue = values?.find((v) => v.id === item.id) ?? (item as Row);

        const rowValueId = rowValue?.id ?? '';

        const Component =
          rowValueId === NONE_OPTION ? ComboboxNoneValue : ComboboxFieldValue;

        const createNewOption = rowValue.id === CREATE_NEW_OPTION;

        const isChecked = !!selected?.find((s) => s.id === rowValueId);

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
                <Checkbox
                  checked={isChecked}
                  className={cn(active || isChecked ? 'visible' : 'invisible')}
                />
                <Component field={viewField} value={rowValue} row={activeRow} />
              </div>
            )}

            <div className="flex flex-row gap-2 items-center">
              <div className="grid place-items-center text-[11px] h-6 border border-foreground/10 rounded-sm px-2">
                {index}
              </div>
            </div>
          </div>
        );
      }

      try {
        const viewConfigManager = getViewConfigManager();
        const field = viewConfigManager.getFieldBy(item.id.toString());
        const row = makeRow(item.id.toString(), item.label, item, field);

        const Component = getComponent({
          fieldName: field?.name,
          componentType: 'commandbarFieldItem',
        });

        if (!Component) {
          const IconOf =
            getComponent({
              fieldName: field?.name,
              componentType: 'icon',
            }) ?? viewOfField?.icon;

          const label = item.label ?? '';

          return (
            <div className="flex flex-row gap-4 items-center">
              <div className=" text-foreground/50">
                {IconOf ? (
                  <Icon icon={IconOf} />
                ) : (
                  <Icon icon={PencilLineIcon} />
                )}
              </div>

              <div>{label}</div>
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
        if (item)
          return (
            <div className="flex flex-row gap-4 items-center">
              <div className=" text-foreground/50">
                {item.icon ? <Icon icon={item.icon} /> : <div />}
              </div>

              <div>{item.label}</div>
            </div>
          );

        return null;
      }
    },
  };
};
