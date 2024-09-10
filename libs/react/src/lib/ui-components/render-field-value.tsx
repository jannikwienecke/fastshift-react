import { ComponentType, FieldConfig, Row } from '@apps-next/core';
import { useAtomValue } from 'jotai';
import { clientConfigAtom } from '../stores';

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
  // TODO: FIX NAMING -> OR MERGE THEM clientConfigAtom and getViewConfigAtom
  const injectedViewConfig = useAtomValue(clientConfigAtom);

  const ComponentToRender =
    injectedViewConfig?.fields[fieldName]?.component?.[componentType];

  if (!row) return null;
  return (
    <div data-testid={`field-value-${fieldName}`}>
      {ComponentToRender ? (
        <ComponentToRender data={row.raw} />
      ) : // TODO BOOLEAN
      fieldType === 'Boolean' ? (
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
