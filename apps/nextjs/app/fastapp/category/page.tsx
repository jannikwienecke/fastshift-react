import { dehydrate } from '@tanstack/react-query';
import { ClientViewProvider } from '../client-view-provider';
import { prefetchView } from '../prefetch';
import { CategoriesClient } from './categories-client';
import { viewConfig } from './categories.config';

export const dynamic = 'force-dynamic';

export default async function FastAppCategoriesPage() {
  const queryClient = await prefetchView(viewConfig);

  return (
    <ClientViewProvider
      queryClientState={dehydrate(queryClient)}
      viewConfig={viewConfig}
    >
      <CategoriesClient />
    </ClientViewProvider>
  );
}
