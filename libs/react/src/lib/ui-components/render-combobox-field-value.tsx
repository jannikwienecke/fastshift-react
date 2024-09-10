import { FieldConfig, Row } from '@apps-next/core';
import { useAtomValue } from 'jotai';
import { clientConfigAtom } from '../stores';

export const ComboboxFieldValue = ({
  value,
  field,
}: {
  field: FieldConfig;
  value: Row;
}) => {
  const fieldName = field.name;

  // TODO: FIX NAMING -> OR MERGE THEM clientConfigAtom and getViewConfigAtom
  const injectedViewConfig = useAtomValue(clientConfigAtom);
  const componentType = 'combobox';

  const ComponentToRender =
    injectedViewConfig?.fields[fieldName]?.component?.[componentType];

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
