import { makeViews } from '@apps-next/convex-adapter-app';
import { historyConfig } from '@apps-next/history';
import { projectsConfig } from '@apps-next/projects';
import {
  ownerConfig,
  tagsConfig,
  tasksTagsConfig,
  todosConfig,
} from '@apps-next/shared';
import { tasksConfig } from '@apps-next/tasks';
import { usersConfig } from '@apps-next/users';
import { config } from './server.config';

export * from '../convex/_generated/api';
export * from '../convex/schema';

export * from './server.config';

export const views = makeViews(config.config, [
  tasksConfig,
  projectsConfig,
  historyConfig,
  usersConfig,
  todosConfig,
  tagsConfig,
  ownerConfig,
  tasksTagsConfig,
]);
