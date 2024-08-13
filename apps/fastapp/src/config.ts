// TODO: Generate this config from the schema
//

import { Config } from '@apps-next/react';
import { z } from 'zod';

export const config = new Config({
  // projects: {
  //   document: {
  //     id: 'String',
  //     name: 'String',
  //   },
  // },
  // tasks: {
  //   document: {
  //     id: 'String',
  //     name: 'String',
  //     // project: 'String',
  //     completed: z.boolean(),
  //   },
  // },

  projects: {
    schema: z.object({
      id: z.string(),
      text: z.string(),
    }),
  },
  tasks: {
    schema: z.object({
      id: z.string(),
      name: z.string(),
      completed: z.boolean(),
      ss: z.date(),
    }),
  },
});

export const projectsBaseView = config.createBaseView('projects', {
  labelKey: 'text',
});

export const taskBaseView = config.createBaseView('tasks', {
  labelKey: 'name',
  viewName: 'myTasks',
});

// const data = taskBaseView.useQuery({});
// const x = data?.data?.[0].completed;
