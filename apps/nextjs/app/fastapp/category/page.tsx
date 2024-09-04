import {
  prismaViewLoader,
  QueryPrefetchProvider,
} from '@apps-next/query-adapter';
import { prisma } from '../../../db';
import { CategoriesClient } from './categories-client';
import { viewConfig } from './categories.config';

export const dynamic = 'force-dynamic';

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
