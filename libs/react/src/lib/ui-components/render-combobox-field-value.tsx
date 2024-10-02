import { FieldConfig, Row } from '@apps-next/core';
import { getComponent } from './ui-components.helper';
import { FilterValue } from './render-filter-value';

export const ComboboxFieldValue = ({
  value,
  field,
}: {
  field?: FieldConfig | null;
  value: Row;
}) => {
  const fieldName = field?.name;

  const componentType = 'combobox';
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
          <ComponentToRender data={raw} />
        </>
      ) : (
        <>{value.label}</>
      )}
    </>
  );
};
