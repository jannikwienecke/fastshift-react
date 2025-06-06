import { createConfigFromConvexSchema } from '@apps-next/convex-adapter-app';
import schema from './schema';

export * from './default-detail-view';
export * from './default-list-view';
export * from './render-components';
export * from './views';
export * from './model-types';
export * from './internationalization';
export * from './shared.utils';

export const config = createConfigFromConvexSchema(schema);

declare module '@apps-next/core' {
  interface Register {
    config: typeof config;
  }
}
