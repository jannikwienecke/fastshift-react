import { DataType, MakeUserStoreCommand, Row } from '@apps-next/core';
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

export type TaskCommandHandler = (
  args: Omit<
    Parameters<NonNullable<ReturnType<MakeTaskCommand>['handler']>>[0] & {
      rows?: Row<TaskViewDataType>[];
    },
    'row'
  >
) => Promise<unknown> | void;
