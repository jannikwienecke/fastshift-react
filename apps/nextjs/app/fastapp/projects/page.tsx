import { createServerViewConfig } from '@apps-next/core';
import {
  prismaViewLoader,
  QueryPrefetchProvider,
} from '@apps-next/query-adapter';
import { prisma } from '../../../db';
import { globalConfig } from '../../layout';
import { ProjectsClient } from './projects-client';

export const dynamic = 'force-dynamic';

export const viewConfig = createServerViewConfig(
  'project',
  {
    displayField: { field: 'label' },
  },
  globalConfig.config
);

export default function FastAppTasksPage() {
  return (
    <QueryPrefetchProvider
      viewConfig={viewConfig}
      viewLoader={(props) => prismaViewLoader(prisma, props)}
    >
      <ProjectsClient viewConfig={viewConfig} />
    </QueryPrefetchProvider>
  );
}
