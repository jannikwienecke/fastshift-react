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

  return (
    <>
      {ComponentToRender ? (
        <>
          <ComponentToRender data={value.raw} />
        </>
      ) : (
        <>{value.label}</>
      )}
    </>
  );
};
