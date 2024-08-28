import {
  prismaViewLoader,
  QueryPrefetchProvider,
} from '@apps-next/query-adapter';
import { prisma } from '../../../db';
import { ProjectsClient } from './projects-client';
import { viewConfig } from './projects.config';

export const dynamic = 'force-dynamic';

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
