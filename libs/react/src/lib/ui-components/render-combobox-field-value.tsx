import { FieldConfig, Row } from '@apps-next/core';
import { useView } from '../use-view';
import { FilterValue } from './render-filter-value';
import { Icon } from './render-icon';
import { getComponent } from './ui-components.helper';

export const DefaultComboboxFieldValue = (props: {
  row: Row;
  fieldName?: string;
  icon?: React.FC;
}) => {
  const { registeredViews } = useView();

  const view = Object.values(registeredViews).find(
    (v) => v?.tableName === props.fieldName
  );
  const icon = getComponent({
    componentType: 'icon',
    fieldName: props.fieldName ?? '',
  });

  const iconToUse = props.icon || icon || view?.icon;

  const color = view?.colorField?.field
    ? props.row?.getValue?.(view?.colorField.field.toString() ?? '')
    : null;

  return (
    <div className="flex gap-2 items-center w-full">
      {iconToUse ? <Icon icon={iconToUse} color={color} /> : null}
      <div className="text-sm">{props.row.label}</div>
    </div>
  );
};

export const ComboboxFieldValue = ({
  value,
  field,
  row,
}: {
  field?: FieldConfig | null;
  value: Row;
  row: Row | null;
}) => {
  const fieldName = field?.name;

  const componentType = 'comboboxListValue';
  let ComponentToRender: React.ComponentType<any> | undefined = undefined;

  if (fieldName) {
    ComponentToRender = getComponent({
      componentType,
      fieldName,
    });
  }

  if (!field) {
    return <FilterValue field={null} value={value} />;
  }

  const raw =
    field?.type === 'Boolean' && typeof value.raw === 'string'
      ? value.raw === 'true'
        ? true
        : false
      : value.raw;

  return (
    <>
      {ComponentToRender ? (
        <>
          <ComponentToRender data={raw} row={row?.raw ?? {}} />
        </>
      ) : (
        // <>{t(value.label as any)}</>
        <DefaultComboboxFieldValue
          row={value}
          fieldName={field?.name as string}
        />
      )}
    </>
  );
};
