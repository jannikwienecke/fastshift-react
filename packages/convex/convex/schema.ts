import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { Doc, TableNames } from './_generated/dataModel';
import { table } from 'console';

const tableMetaFields = {
  updatedAt_: v.optional(v.number()),
  updatedBy_: v.optional(v.id('users')),
  createdBy_: v.optional(v.id('users')),
  deleted_: v.optional(v.boolean()),
  deletedAt_: v.optional(v.number()),
};

const _schema = defineSchema({
  users: defineTable({
    ...tableMetaFields,
    email: v.string(),
    password: v.string(),
  }),

  history: defineTable({
    // Referenz auf das geänderte Dokument (z.B. "teams")
    tableName: v.union(
      v.literal('users'),
      v.literal('tasks'),
      v.literal('projects'),
      v.literal('todos'),
      v.literal('tags'),
      v.literal('categories'),
      v.literal('views'),
      v.literal('owner'),
      v.literal('tasks_tags')
    ),

    entityId: v.string(),
    // Typ der Änderung
    changeType: v.union(
      v.literal('insert'),
      v.literal('update'),
      v.literal('delete')
    ),
    // Detail des Änderungen-Patches (beliebiges JSON-Objekt)
    change: v.object({
      // hier nach Bedarf Felder definieren, z.B.:
      field: v.optional(v.string()),
      oldValue: v.optional(v.any()),
      newValue: v.optional(v.any()),
      isManyToMany: v.optional(v.boolean()),
      manyToManyOf: v.optional(v.string()),
    }),
    ownerId: v.id('owner'),
    timestamp: v.number(),
  })
    // Schnelle Abfragen nach Entity
    .index('by_entity', ['entityId'])
    .index('by_owner', ['ownerId'])
    .index('by_table', ['tableName'])
    .index('by_timestamp', ['timestamp'])
    .index('by_changeType', ['changeType']),

  views: defineTable({
    ...tableMetaFields,
    baseView: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    displayOptions: v.optional(v.string()),
    filters: v.optional(v.string()),
    parentModel: v.optional(v.string()),
    rowId: v.optional(v.string()),
    rowLabelFieldName: v.optional(v.string()),
    starred: v.optional(v.boolean()),
    emoji: v.optional(
      v.object({
        emoji: v.string(),
        label: v.string(),
      })
    ),
  })
    .index('baseView', ['baseView'])
    .index('name', ['name'])
    .index('slug', ['slug'])
    .index('starred', ['starred'])
    .index('parentModel', ['parentModel'])
    .index('rowId', ['rowId']),

  owner: defineTable({
    ...tableMetaFields,
    userId: v.id('users'),
    history: v.optional(v.array(v.id('history'))),
    firstname: v.string(),
    lastname: v.string(),
    name: v.optional(v.string()),
    age: v.number(),
  })
    .searchIndex('name', {
      searchField: 'name',
    })
    .index('userId', ['userId']),

  tasks: defineTable({
    ...tableMetaFields,
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
    .index('deleted', ['deleted_'])
    .searchIndex('name_search', {
      searchField: 'name',
    })
    .index('priority', ['priority'])

    .searchIndex('description_search', {
      searchField: 'description',
    }),

  tags: defineTable({
    ...tableMetaFields,
    name: v.string(),
    color: v.string(),
    tasks: v.optional(v.array(v.id('tasks'))),
  }).searchIndex('name', {
    searchField: 'name',
  }),

  tasks_tags: defineTable({
    taskId: v.id('tasks'),
    tagId: v.id('tags'),
  })
    .index('taskId', ['taskId'])
    .index('tagId', ['tagId']),

  projects: defineTable({
    ...tableMetaFields,
    label: v.string(),
    ownerId: v.id('owner'),
    dueDate: v.number(),
    description: v.string(),
    categoryId: v.id('categories'),
    tasks: v.optional(v.array(v.id('tasks'))),
  })
    .searchIndex('label', {
      searchField: 'label',
    })
    .index('deleted', ['deleted_']),

  categories: defineTable({
    ...tableMetaFields,
    label: v.string(),
    color: v.string(),
  }).searchIndex('label', {
    searchField: 'label',
  }),

  todos: defineTable({
    ...tableMetaFields,

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
