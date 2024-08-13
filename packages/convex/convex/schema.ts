import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const _schema = defineSchema({
  tasks: defineTable({ name: v.string(), completed: v.boolean() }),
  projects: defineTable({ text: v.string() }),
});

export default _schema;

export const schema = _schema;
