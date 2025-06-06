import { views } from '@apps-next/convex';
import { ViewRegistry } from '@apps-next/core';

import { register as rTasks } from '@apps-next/tasks';
import { register as rProjects } from '@apps-next/projects';
import { register as rHistory } from '@apps-next/history';
import { register as rUsers } from '@apps-next/users';

const registerViewFnList = [rTasks, rProjects, rHistory, rUsers];

const registerAppViews = (viewRegistry: ViewRegistry) => {
  registerViewFnList.forEach((registerViewFn) => {
    registerViewFn(views, viewRegistry);
  });
};

export default registerAppViews;
