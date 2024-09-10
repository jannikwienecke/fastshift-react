import { schema } from '@apps-next/convex';
import { createConfigFromConvexSchema } from '@apps-next/convex-adapter-app';

export const config = createConfigFromConvexSchema(schema);

// console.log('schema', schema.tables);
// console.log('config', config);

declare module '@apps-next/core' {
  interface Register {
    config: typeof config;
  }
}
