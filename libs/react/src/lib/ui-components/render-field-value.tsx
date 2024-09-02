import { clientConfigAtom, ComponentType, Row } from '@apps-next/core';
import { useAtomValue } from 'jotai';

export const FieldValue = ({
  fieldName,
  componentType,
  row,
}: {
  fieldName: string;
  componentType: ComponentType;
  row: Row | undefined;
}) => {
  // TODO: FIX NAMING -> OR MERGE THEM clientConfigAtom and getViewConfigAtom
  const injectedViewConfig = useAtomValue(clientConfigAtom);

  const ComponentToRender =
    injectedViewConfig?.fields[fieldName]?.component?.[componentType];

  if (!row) return null;
  return (
    <>
      {ComponentToRender ? (
        <ComponentToRender data={row} />
      ) : (
        <>{row?.getValueLabel(fieldName)}</>
      )}
    </>
  );
};
