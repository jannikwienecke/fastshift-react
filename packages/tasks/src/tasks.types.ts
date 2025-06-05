import { DataType, MakeUserStoreCommand } from '@apps-next/core';
import { IProjects, ITags, ITasks, ITodos } from '@apps-next/shared';

export type TaskViewDataType = DataType<
  'tasks',
  {
    projects: IProjects;
    tags?: ITags[];
    tasks?: ITasks[];
    todos?: ITodos[];
  }
>;

export type MakeTaskCommand = MakeUserStoreCommand<TaskViewDataType>;
