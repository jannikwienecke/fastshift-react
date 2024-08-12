import { mutation, query } from './_generated/server';

export const create = query({
  handler: async (ctx) => {
    return await ctx.db.query('tasks').collect();
  },
});
