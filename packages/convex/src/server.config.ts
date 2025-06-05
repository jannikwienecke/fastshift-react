import { createConfigFromConvexSchema } from '@apps-next/convex-adapter-app';
import schema from '../convex/schema';

export const config = createConfigFromConvexSchema(schema);

declare module '@apps-next/core' {
  interface Register {
    config: typeof config;
    viewNames: ['convex'];
  }
}
