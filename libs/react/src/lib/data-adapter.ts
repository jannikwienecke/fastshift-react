import { RecordType, RegisteredViews } from '@apps-next/core';
import { useView } from '..';

type DataProps = {
  table: string;
};

export const useData = (options: DataProps) => {
  const { registeredViews, viewConfigManager } = useView();
};

export const _ = (
  registeredViews: RegisteredViews,
  table: DataProps['table']
) => {
  const viewConfig = registeredViews[table];
  const label = viewConfig?.displayField.field as string;
  console.log({ label, table, viewConfig });

  const withLabels = (
    data: RecordType[]
  ): (RecordType & {
    id: string;
    label: string;
  })[] => {
    return data.map((value) => ({
      ...value,
      id: value.id,
      label: value[label],
    }));
  };

  return { withLabels };
};
