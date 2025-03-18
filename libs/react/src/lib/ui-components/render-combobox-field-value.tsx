import { FieldConfig, Row, useTranslation } from '@apps-next/core';
import { getComponent } from './ui-components.helper';
import { FilterValue } from './render-filter-value';

export const ComboboxFieldValue = ({
  value,
  field,
  row,
}: {
  field?: FieldConfig | null;
  value: Row;
  row: Row | null;
}) => {
  const { t } = useTranslation();

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
        <>{t(value.label as any)}</>
      )}
    </>
  );
};
