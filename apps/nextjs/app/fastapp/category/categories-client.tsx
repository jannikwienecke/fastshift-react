'use client';

import { setClientViewConfig, ViewConfigType } from '@apps-next/core';
import { DataType, makeHooks } from '@apps-next/react';
import { List } from '@apps-next/ui';
import { ColorComponent } from './categories.components';

type CategoryViewDataType = DataType<'category'>;

setClientViewConfig<CategoryViewDataType>('category', {
  fields: {
    color: {
      component: {
        list: ColorComponent,
      },
    },
  },
});

export const CategoriesClient = ({
  viewConfig,
}: {
  viewConfig: ViewConfigType<'category'>;
}) => {
  const { useList } = makeHooks(viewConfig);

  const getListProps = useList();
  return (
    <div className="flex grow mx-2 flex-col gap-2 h-[calc(100vh-10rem)] border-[1px] border-gray-100">
      <List.Default {...getListProps()} />
    </div>
  );
};
