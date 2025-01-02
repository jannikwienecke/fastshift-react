import { paginationOptsValidator } from 'convex/server';
import * as server from './_generated/server';

export const generateTodos = server.mutation({
  async handler(ctx, args) {
    for (let i = 0; i < 1000; i++) {
      await ctx.db.insert('todos', {
        name: `Todo ${i + 1}`,
      });
    }
  },
});

export const todos = server.query({
  args: { paginationOpts: paginationOptsValidator },
  async handler(ctx, args) {
    const result = await ctx.db
      .query('todos')
      .order('asc')
      .paginate(args.paginationOpts);

    return result;
  },
});
