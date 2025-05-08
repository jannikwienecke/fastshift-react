import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { Doc, TableNames } from './_generated/dataModel';

const _schema = defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(),
  }),

  views: defineTable({
    baseView: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    displayOptions: v.optional(v.string()),
    filters: v.optional(v.string()),
    parentModel: v.optional(v.string()),
    starred: v.optional(v.boolean()),
  })
    .index('baseView', ['baseView'])
    .index('name', ['name'])
    .index('slug', ['slug'])
    .index('starred', ['starred']),

  owner: defineTable({
    userId: v.id('users'),
    firstname: v.string(),
    lastname: v.string(),
    name: v.optional(v.string()),
    age: v.number(),
  }).searchIndex('name', {
    searchField: 'name',
  }),

  tasks: defineTable({
    name: v.string(),
    completed: v.boolean(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.id('tags'))),
    projectId: v.optional(v.id('projects')),
    email: v.optional(v.string()),
    telefon: v.optional(v.string()),
    priority: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5)
    ),

    deleted: v.optional(v.boolean()),
    dueDate: v.optional(v.number()),
    tasks: v.optional(v.union(v.array(v.id('tasks')), v.null())),
    todos: v.optional(v.array(v.id('todos'))),
  })
    .index('projectId', ['projectId'])
    .index('dueDate', ['dueDate'])
    .index('name', ['name'])
    .index('completed', ['completed'])
    .index('tasks', ['tasks'])
    .index('todos', ['todos'])
    .index('deleted', ['deleted'])
    .searchIndex('name_search', {
      searchField: 'name',
    })
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

  todos: defineTable({
    name: v.string(),
    completed: v.boolean(),
    taskId: v.optional(v.id('tasks')),
  })
    .index('taskId', ['taskId'])
    .index('completed', ['completed'])
    .searchIndex('name', {
      searchField: 'name',
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
export type Todos = MyDoc<'todos'>;
export type Projects = MyDoc<'projects'>;
