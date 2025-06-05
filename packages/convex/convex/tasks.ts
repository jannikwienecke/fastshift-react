import { v } from 'convex/values';
import { mutation } from './query';
import { Tasks } from './schema';

const defaultArgs = {
  userId: v.id('users'),
  viewName: v.string(),
};

export const copyTask = mutation({
  args: {
    taskId: v.id('tasks'),
  },
  handler: async (ctx, args) => {
    console.debug('copyTask mutation called with args:', args);

    const user = await ctx.db.query('users').first();

    const data = await ctx.db.get(args.taskId);

    const { _id, _creationTime, ...task } = data as Tasks;

    if (!task) {
      throw new Error('Task not found');
    }

    if (!user) {
      throw new Error('User not found');
    }

    const tasksWithThisName = await ctx.db
      .query('tasks')
      .withSearchIndex('name_search', (q) => q.search('name', task.name))
      .collect();

    const copies = tasksWithThisName.filter((t) =>
      t.name.includes(task.name + ' (Copy')
    ).length;

    try {
      const newTask = await ctx.db.insert('tasks', {
        ...task,
        name: `${task.name} (Copy ${copies > 0 ? copies + 1 : ''})`,
        createdBy_: user._id,
      });

      return { data: newTask, error: null };
    } catch (error) {
      console.debug('Error copying task:', error);
      return {
        data: null,
        error: {
          message: 'Failed to copy task',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  },
});
