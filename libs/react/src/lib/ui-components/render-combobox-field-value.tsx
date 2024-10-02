import { FieldConfig, Row } from '@apps-next/core';
import { getComponent } from './ui-components.helper';

export const ComboboxFieldValue = ({
  value,
  field,
}: {
  field: FieldConfig;
  value: Row;
}) => {
  const fieldName = field.name;

  const componentType = 'combobox';

  const ComponentToRender = getComponent({
    componentType,
    fieldName,
  });

  const raw =
    field.type === 'Boolean' && typeof value.raw === 'string'
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
