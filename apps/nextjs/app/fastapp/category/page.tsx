import { ServerViewProvider } from '../server-view-provider';
import { CategoriesClient } from './categories-client';
import { viewConfig } from './categories.config';

export const dynamic = 'force-dynamic';

export default async function FastAppCategoriesPage() {
  return (
    <ServerViewProvider viewConfig={viewConfig}>
      <CategoriesClient />
    </ServerViewProvider>
  );
}
