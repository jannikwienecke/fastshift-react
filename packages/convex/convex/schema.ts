import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const _schema = defineSchema({
  tasks: defineTable({ name: v.string(), completed: v.boolean() }).searchIndex(
    'name_search',
    {
      searchField: 'name',
    }
  ),
  projects: defineTable({ text: v.string() }).searchIndex('text', {
    searchField: 'text',
  }),
});

export default _schema;

export const schema = _schema;
