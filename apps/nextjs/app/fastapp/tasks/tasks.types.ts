import { DataType } from '@apps-next/react';
import { Project, Tag } from '@prisma/client';

export type TaskViewDataType = DataType<
  'task',
  {
    project?: Project;
    tag: Tag[];
  }
>;
