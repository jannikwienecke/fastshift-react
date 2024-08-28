import { clientConfigAtom, ComponentType, DataRow } from '@apps-next/core';
import { useAtomValue } from 'jotai';

export const FieldValue = ({
  fieldName,
  componentType,
  row,
}: {
  fieldName: string;
  componentType: ComponentType;
  row: DataRow;
}) => {
  // TODO: FIX NAMING -> OR MERGE THEM clientConfigAtom and getViewConfigAtom
  const injectedViewConfig = useAtomValue(clientConfigAtom);

  const ComponentToRender =
    injectedViewConfig?.fields[fieldName]?.component?.[componentType];

  return (
    <>
      {ComponentToRender ? (
        <>
          <ComponentToRender data={row} />
        </>
      ) : (
        <>{row.getItemLabel(fieldName)}</>
      )}
    </>
  );
};
