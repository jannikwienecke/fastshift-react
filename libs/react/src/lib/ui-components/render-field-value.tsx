import {
  clientConfigAtom,
  ComponentType,
  DataRow,
  Row,
  useStoreValue,
} from '@apps-next/core';
import { useAtomValue } from 'jotai';
import { useQueryData } from '../use-query-data';

export const FieldValue = ({
  fieldName,
  componentType,
  row,
}: {
  fieldName: string;
  componentType: ComponentType;
  row: Row | undefined;
}) => {
  const queryData = useQueryData();

  const { list } = useStoreValue();

  const table = list?.focusedRelationField?.field?.relation?.tableName;

  const queryDataTable = queryData.relationalDataModel?.[table as string];

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
