import { paginationOptsValidator } from 'convex/server';
import * as server from './_generated/server';
import { Aggregate } from '@convex-dev/aggregate';
import { Id } from './_generated/dataModel';

export const test = server.mutation({
  async handler(ctx, args) {
    // [CONVEX M(query:viewMutation)] [LOG] {
    //   tableFieldName: 'projectId',
    //   fieldNameRelationTable: 'tasks',
    //   manyToManyTable: 'tasks',
    //   newIds: [ 'jh78cgz4xwtkxrthtm485df5f17c3999' ]
    // }

    // ctx.db.query("tasks").withIndex('by_id', q => q.eq('_id'))

    await ctx.db.patch('jh78cgz4xwtkxrthtm485df5f17c3999' as Id<'tasks'>, {
      tasks: ['jh78cgz4xwtkxrthtm485df5f17c3999' as Id<'tasks'>],
    });
  },
});

export const todos = server.query({
  args: { paginationOpts: paginationOptsValidator },
  async handler(ctx, args) {
    const result = await ctx.db
      .query('todos')
      .order('asc')
      .paginate(args.paginationOpts);

    const resultTasks = await ctx.db
      .query('tasks')
      .withIndex('deleted', (q) => q.eq('deleted', false));

    // const res = await ctx.db.query('tasks').withIndex("by_id")

    // await ctx.db.query('tasks').withIndex('tasks', q => q.eq('tasks', ''))

    return result;
  },
});
