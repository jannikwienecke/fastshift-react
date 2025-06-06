import { Id, MakeServerFn } from '@apps-next/shared';
import { v } from 'convex/values';

export const copyTaskArgs = { taskId: v.id('tasks') };

export type CopyTaskArgs = { taskId: Id<'tasks'> };
export type CopyTaskReturn = {
  newTaskId: Id<'tasks'>;
};

export const copyTaskFn: MakeServerFn<CopyTaskArgs, CopyTaskReturn> = async (
  ctx,
  args
) => {
  const task = await ctx.db.get(args.taskId);

  if (!task) throw new Error(`Task with ID ${args.taskId} not found`);
  const { _id, _creationTime, ...taskData } = task;

  const newTaskId = await ctx.db.insert('tasks', {
    ...taskData,
    name: taskData.name + ' (Copy)',
  });

  return {
    success: {
      message: 'ok',
      status: 200 as const,
      data: { newTaskId },
    },
  };
};
