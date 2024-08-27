import { createServerViewConfig } from '@apps-next/core';
import {
  prismaViewLoader,
  QueryPrefetchProvider,
} from '@apps-next/query-adapter';
import { prisma } from '../../../db';
import { globalConfig } from '../../layout';
import { CategoriesClient } from './categories-client';

export const dynamic = 'force-dynamic';

export const viewConfig = createServerViewConfig(
  'category',
  {
    displayField: { field: 'label' },
    icon: 'FaLayerGroup',
    iconColor: '#4299e1',
    ui: {
      list: {
        showIcon: true,

        fieldsLeft: ['label'],
        fieldsRight: ['color'],
      },
    },
  },
  globalConfig.config
);

export default function FastAppCategoriesPage() {
  return (
    <QueryPrefetchProvider
      viewConfig={viewConfig}
      viewLoader={(props) => prismaViewLoader(prisma, props)}
    >
      <CategoriesClient viewConfig={viewConfig} />
    </QueryPrefetchProvider>
  );
}
