import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { Doc } from './_generated/dataModel';

const _schema = defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(),
  }),

  owner: defineTable({
    userId: v.id('users'),
    firstname: v.string(),
    lastname: v.string(),
    age: v.number(),
  }),

  tasks: defineTable({
    name: v.string(),
    completed: v.boolean(),
    tags: v.optional(v.array(v.id('tags'))),
    projectId: v.id('projects'),
    priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high')),
  }).searchIndex('name_search', {
    searchField: 'name',
  }),

  tags: defineTable({ name: v.string(), color: v.string() }).searchIndex(
    'name',
    {
      searchField: 'name',
    }
  ),

  tasks_tags: defineTable({
    taskId: v.id('tasks'),
    tagId: v.id('tags'),
  }),

  projects: defineTable({
    label: v.string(),
    ownerId: v.id('owner'),
    dueDate: v.number(),
    description: v.string(),
    categoryId: v.id('categories'),
  }).searchIndex('label', {
    searchField: 'label',
  }),

  categories: defineTable({
    label: v.string(),
    color: v.string(),
  }).searchIndex('label', {
    searchField: 'label',
  }),
});

export default _schema;

export const schema = _schema;

export type Categories = Doc<'categories'>;
export type Users = Doc<'users'>;
export type Owner = Doc<'owner'> & {
  users?: Users;
};
