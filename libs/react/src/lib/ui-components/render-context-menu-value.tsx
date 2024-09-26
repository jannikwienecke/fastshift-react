import { FieldConfig, Row } from '@apps-next/core';
import { useAtomValue } from 'jotai';
import { clientConfigAtom } from '../stores';

export const ContextMenuValue = ({
  field,
  row,
}: {
  field: FieldConfig;
  row: Row | undefined;
}) => {
  const fieldName = field.name;
  const injectedViewConfig = useAtomValue(clientConfigAtom);

  const ComponentToRender =
    injectedViewConfig?.fields[fieldName]?.component?.['contextMenu'];

  if (!row) return null;
  return (
    <div data-testid={`field-value-${fieldName}`}>
      {ComponentToRender ? (
        <ComponentToRender data={row.raw} />
      ) : (
        <>{row?.label}</>
      )}
    </div>
  );
};
