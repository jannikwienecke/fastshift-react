import { makeViews } from '@apps-next/convex-adapter-app';
import {
  ownerConfig,
  projectsConfig,
  tagsConfig,
  tasksConfig,
  tasksTags,
  todosConfig,
  usersConfig,
} from './server.config.all';
import { historyConfig } from './server.history';
import { config } from './server.config';

export * from '../convex/_generated/api';
export * from '../convex/schema';

export * from './server.config.all';
export * from './server.history';

export * from './server.config';

export const views = makeViews(config.config, [
  tasksConfig,
  usersConfig,
  projectsConfig,
  todosConfig,
  tagsConfig,
  ownerConfig,
  tasksTags,
  historyConfig,
]);
