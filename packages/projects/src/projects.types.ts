import { DataType } from '@apps-next/core';
import { ICategories, IOwner, IProjects, ITasks } from '@apps-next/shared';

export type ProjectViewDataType = DataType<
  'projects',
  {
    categories: ICategories;
    owner: IOwner;
    tasks?: (ITasks & { projects?: IProjects })[];
  }
>;
