import { ComponentType, FieldConfig, Row } from '@apps-next/core';
import { getComponent } from './ui-components.helper';

export const FieldValue = ({
  field,
  componentType,
  row,
}: {
  field: FieldConfig;
  componentType: ComponentType;
  row: Row | undefined;
}) => {
  const fieldName = field.name;
  const fieldType = field.type;

  const ComponentToRender = getComponent({
    fieldName,
    componentType,
  });

  if (!row) return null;
  return (
    <div data-testid={`field-value-${fieldName}`}>
      {ComponentToRender ? (
        <ComponentToRender data={row.raw} />
      ) : fieldType === 'Boolean' ? (
        <>
          <input
            type="checkbox"
            checked={row?.getValue(fieldName)}
            onChange={() => null}
          />
        </>
      ) : (
        <>{row?.getValueLabel(fieldName)}</>
      )}
    </div>
  );
};
