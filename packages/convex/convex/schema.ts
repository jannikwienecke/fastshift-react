import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { Doc, TableNames } from './_generated/dataModel';

const _schema = defineSchema({
  todos: defineTable({
    name: v.string(),
  }),

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
    description: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    tags: v.optional(v.array(v.id('tags'))),
    projectId: v.optional(v.id('projects')),
    // priority: v.number(),
    priority: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5)
    ),
    deleted: v.optional(v.boolean()),
    dueDate: v.optional(v.number()),
  })
    .index('projectId', ['projectId'])
    .index('dueDate', ['dueDate'])
    .index('name', ['name'])
    .index('deleted', ['deleted'])
    .searchIndex('name_search', {
      searchField: 'name',
    })
    // .index('description', ['description'])
    // .index('subtitle', ['subtitle'])
    .index('priority', ['priority'])

    .searchIndex('description_search', {
      searchField: 'description',
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
  })
    .index('taskId', ['taskId'])
    .index('tagId', ['tagId']),

  projects: defineTable({
    label: v.string(),
    ownerId: v.id('owner'),
    dueDate: v.number(),
    description: v.string(),
    deleted: v.optional(v.boolean()),
    categoryId: v.id('categories'),
    tasks: v.optional(v.array(v.id('tasks'))),
  })
    .searchIndex('label', {
      searchField: 'label',
    })
    .index('deleted', ['deleted']),

  categories: defineTable({
    label: v.string(),
    color: v.string(),
  }).searchIndex('label', {
    searchField: 'label',
  }),
});

export default _schema;

export const schema = _schema;

export type MyDoc<T extends TableNames> = Doc<T> & {
  id: string;
};

export type Categories = MyDoc<'categories'>;
export type Users = MyDoc<'users'>;
export type Owner = MyDoc<'owner'> & {
  users?: Users;
};
export type Tags = MyDoc<'tags'>;
export type Tasks = MyDoc<'tasks'>;
export type Projects = MyDoc<'projects'>;
