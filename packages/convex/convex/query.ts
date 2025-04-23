import {
  makeViewLoaderHandler,
  makeViewMutationHandler,
} from '@apps-next/convex-adapter-app';
import * as server from './_generated/server';

import { _log, UserViewData } from '@apps-next/core';
import { asyncMap } from 'convex-helpers';
import { v } from 'convex/values';
import { views } from '../src/index';
import { Id } from './_generated/dataModel';

export const viewLoader = server.query({
  handler: makeViewLoaderHandler(views),
});

export const viewMutation = server.mutation({
  handler: makeViewMutationHandler(views),
});

export const testQuery = server.mutation({
  async handler(ctx, args_0) {
    try {
      // const res = await ctx.db
      //   .query('tasks_tags')
      //   .withIndex('taskId', (q) => q.eq('taskId', 'daa' as Id<'tasks'>))
      //   .collect();
      // // console.log(res[0].)

      const res = await ctx.db.patch(
        'jh71s0zc8vdtxrtppctrjkjdg97c24qs' as Id<'tasks'>,
        {
          tasks: ['jh78cgz4xwtkxrthtm485df5f17c3999' as Id<'tasks'>],
        }
      );
    } catch (error) {
      console.error('testQuery error', { error });
    }
  },
});

export const getUserViews = server.query({
  handler: async (ctx, args) => {
    return await ctx.db.query('views').collect();
  },
});

export const userViewData = server.query({
  args: { viewName: v.union(v.string(), v.null()) },

  handler: async (ctx, args) => {
    if (!args.viewName) return null;

    const viewName = args.viewName as string;
    const view = await ctx.db
      .query('views')
      .withIndex('name', (q) => q.eq('name', viewName.toLowerCase()))
      .first();

    _log.debug('userViewData', { view });

    if (!view) return null;

    return {
      ...view,
      name: view.name,
      displayOptions: view.displayOptions ?? null,
      filters: view.filters ?? null,
    } satisfies UserViewData;
  },
});

// const zMutation = zCustomMutation(server.mutation, NoOp);

// export const createUserViewData = zMutation({
//   args: {
//     viewName: z.string().min(2),
//     displayOptions: z.string().min(1).optional(),
//     filters: z.string().min(1).optional(),
//   },
//   handler: async (ctx, args) => {
//     const view = await ctx.db
//       .query('views')
//       .withIndex('name', (q) => q.eq('name', args.viewName))
//       .first();

//     if (view) {
//       return { message: 'View already exists' };
//     }

//     await ctx.db.insert('views', {
//       baseView: '',
//       name: args.viewName,
//       displayOptions: args.displayOptions ?? '',
//       filters: args.filters ?? '',
//     });

//     return
//   },
// });

export const displayOptions = server.query({
  handler: async (ctx) => {
    const all = await ctx.db.query('tasks').withIndex('priority').collect();

    const tasks = await ctx.db.query('tasks').collect();

    const start = new Date().getTime();
    const end = start + 1000 * 60 * 60 * 24;

    const filter = tasks.filter(
      (t) => t.dueDate && t.dueDate >= start && t.dueDate <= end
    );

    // await ctx.db
    //   .query('tasks')
    //   .withSearchIndex('name_search', (q) => q.search('name', 'a'))
    //   .paginate();

    // // ctx.db.query('tasks_tags').withIndex('taskId', (q) => q.eq('taskId', '123')).order('asc')
    // const tasks = await ctx.db
    //   .query('tasks')
    //   // .withIndex('description', q => q.eq('description', '123'))
    //   // .withSearchIndex('name_search', (q) => q.search('name', '123'))

    //   .filter((q) =>
    //     q.and(
    //       q.or(
    //         ...projectIds.map((projectId) =>
    //           q.eq(q.field('projectId'), projectId)
    //         )
    //       )
    //     )
    //   )
    //   .collect();

    // const taskIds = [] as Id<'tasks'>[];

    // // ctx.db.query('tasks').filter((q) => q.neq(q.field('priority'), 'medium'))
    // // ctx.db
    // //   .query('tasks')
    // //   .paginate({ cursor: '', numItems: 1 })
    // //   .filter((q) =>
    // //     q.or(
    // //       ...['low', 'medium'].map((priority) =>
    // //         q.eq(q.field('priority'), priority)
    // //       )
    // //     )
    // //   );

    // // ctx.db.query("tasks").withSearchIndex('name_search', (q) => q.search('name', '123')).

    // // const tasks = ctx.db
    // //   .query('tasks')
    // //   .filter((q) =>
    // //     q.or(...taskIds.map((taskId) => q.eq(q.field('_id'), taskId)))
    // //   )
    // //   .collect();

    // const res = ctx.db
    //   .query('tasks')
    //   //   .withSearchIndex('name_search', (q) => q.search('name', '123'))

    //   //  filter by completed
    //   .filter((q) => q.eq(q.field('completed'), true));

    // // asyncMap([] as ID<"tasks">[], async (taskId) => {
    // //   const task = await ctx.db.query('tasks').withIndex('by_id', (q) => q.eq(q.field('_id'), taskId)).first();
    // //   return task;
    // // });

    // // const taskIds: Id<'tasks'>[] = [];
    // // const taskTags = await ctx.db
    // // .query("tasks_tags")
    // // .withIndex("taskId", (q) =>
    // //   q.eq("taskId", taskIds)
    // // )
    // // .collect();

    // const tags = await ctx.db
    //   .query('tags')
    //   .filter((q) =>
    //     q.or(...tagIds.map((tagId) => q.eq(q.field('_id'), tagId)))
    //   )
    //   .collect();

    // const taskTags = await ctx.db
    //   .query('tasks_tags')
    //   .withIndex('taskId', (q) => q.in('taskId', '123'))
    //   .collect();

    // tasks.filter((task) => task.tags?.includes('123'));

    // const tasks = await ctx.db
    //   .query('tasks')
    //   .filter((q) => q.field('projectId').oneOf(projectIds))
    //   .collect();
  },
});

export const deleteMutesttation = server.query({
  handler: async (ctx, args) => {
    const posts = await asyncMap(
      // one-to-many
      ctx.db.query('projects').take(10),
      async (post) => {
        // one-to-many

        const category = await ctx.db
          .query('categories')
          .withIndex('by_id', (q) => q.eq('_id', post.categoryId))
          .first();

        const author = await ctx.db
          .query('owner')
          .withIndex('by_id', (q) => q.eq('_id', post.ownerId))
          .first();

        return { ...post, category, author };
      }
    );

    // const res = ctx.db.query('projects').take();
    // ctx.db.query('ca')
    return {};
  },
});
