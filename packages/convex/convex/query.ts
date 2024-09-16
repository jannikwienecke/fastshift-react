import {
  makeViewLoaderHandler,
  makeViewMutationHandler,
} from '@apps-next/convex-adapter-app';
import * as server from './_generated/server';

import { asyncMap } from 'convex-helpers';
import { views } from '../src/index';
import { Id } from './_generated/dataModel';
import { getManyVia } from 'convex-helpers/server/relationships';
import { ID } from '@apps-next/core';

export const viewLoader = server.query({
  handler: makeViewLoaderHandler(views),
});

export const viewMutation = server.mutation({
  handler: makeViewMutationHandler(views),
});

export const deleteMutation = server.mutation({
  handler: async (ctx, args) => {
    // ctx.db.patch('' as Id<'tasks'>, {projectId: '123'})

    console.log('deleteMutation');

    const projectIds = ['123', '456'];
    const tagIds = ['123', '456'];
    const tasks = await ctx.db
      .query('tasks')
      .filter((q) =>
        q.and(
          q.or(
            ...projectIds.map((projectId) =>
              q.eq(q.field('projectId'), projectId)
            )
          )
        )
      )
      .collect();

    const taskIds = [] as Id<'tasks'>[];

    // ctx.db.query("tasks").withSearchIndex('name_search', (q) => q.search('name', '123')).

    // const tasks = ctx.db
    //   .query('tasks')
    //   .filter((q) =>
    //     q.or(...taskIds.map((taskId) => q.eq(q.field('_id'), taskId)))
    //   )
    //   .collect();

    const res = ctx.db
      .query('tasks')
      //   .withSearchIndex('name_search', (q) => q.search('name', '123'))

      //  filter by completed
      .filter((q) => q.eq(q.field('completed'), true));

    // asyncMap([] as ID<"tasks">[], async (taskId) => {
    //   const task = await ctx.db.query('tasks').withIndex('by_id', (q) => q.eq(q.field('_id'), taskId)).first();
    //   return task;
    // });

    // const taskIds: Id<'tasks'>[] = [];
    // const taskTags = await ctx.db
    // .query("tasks_tags")
    // .withIndex("taskId", (q) =>
    //   q.eq("taskId", taskIds)
    // )
    // .collect();

    const tags = await ctx.db
      .query('tags')
      .filter((q) =>
        q.or(...tagIds.map((tagId) => q.eq(q.field('_id'), tagId)))
      )
      .collect();

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
    console.log('deleteMutation');
    // ctx.db.
    // ctx.db
    //   .query('tags')
    //   .

    // ctx.db.query("categories").

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
