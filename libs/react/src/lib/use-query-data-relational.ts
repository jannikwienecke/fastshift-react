import { useQueryData } from './use-query-data';

export const useQueryDataOf = (tableName: string | undefined) => {
  const { relationalDataModel } = useQueryData();

  return relationalDataModel?.[tableName ?? ''] ?? [];
};
