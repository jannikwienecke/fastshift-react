import { RecordType } from '@apps-next/core';
import { ListProps } from '@apps-next/ui';
import { useAtomValue } from 'jotai';
import { debouncedQueryAtom } from '../ui-components/query-input';
import { useQuery } from '../use-query';
import { useViewConfig } from '../use-view-config';

type ListGetProps<T extends RecordType> = {
  descriptionKey?: keyof T;
};

export const useList = <T extends RecordType>() => {
  const { viewConfigManager } = useViewConfig();
  const query = useAtomValue(debouncedQueryAtom);

  const { data } = useQuery<T[]>({ viewConfigManager, query });

  const fieldLabel = viewConfigManager.getDisplayFieldLabel();

  return <Props extends ListGetProps<T>>(options?: Props): ListProps<T> => {
    const { descriptionKey } = options || {};
    return {
      items:
        data?.map((item) => ({
          ...item,
          name: item[fieldLabel] as string,
          description:
            descriptionKey && typeof item[descriptionKey] === 'string'
              ? item[descriptionKey]
              : undefined,
        })) ?? [],
    };
  };
};
