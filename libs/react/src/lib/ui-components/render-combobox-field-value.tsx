import { clientConfigAtom, Row } from '@apps-next/core';
import { useAtomValue } from 'jotai';

export const ComboboxFieldValue = ({
  value,
  tableName,
}: {
  tableName: string;
  value: Row;
}) => {
  // TODO: FIX NAMING -> OR MERGE THEM clientConfigAtom and getViewConfigAtom
  const injectedViewConfig = useAtomValue(clientConfigAtom);
  const componentType = 'combobox';

  const ComponentToRender =
    injectedViewConfig?.fields[tableName]?.component?.[componentType];

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
