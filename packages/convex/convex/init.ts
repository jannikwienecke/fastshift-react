import * as server from './_generated/server';
import { faker } from '@faker-js/faker';
import { Id } from './_generated/dataModel';

const init = server.internalMutation({
  handler: async (ctx) => {
    console.log('init');

    // Only uncomment if you want to seed with new fake data
    // Test may rely on the data being seeded
    // faker.seed();

    (await ctx.db.query('tasks').collect())
      .flatMap((t) => t._id)
      .forEach((id) => ctx.db.delete(id));

    (await ctx.db.query('projects').collect())
      .flatMap((t) => t._id)
      .forEach((id) => ctx.db.delete(id));

    (await ctx.db.query('tags').collect())
      .flatMap((t) => t._id)
      .forEach((id) => ctx.db.delete(id));

    (await ctx.db.query('tasks_tags').collect())
      .flatMap((t) => t._id)
      .forEach((id) => ctx.db.delete(id));

    (await ctx.db.query('owner').collect())
      .flatMap((t) => t._id)
      .forEach((id) => ctx.db.delete(id));

    (await ctx.db.query('categories').collect())
      .flatMap((t) => t._id)
      .forEach((id) => ctx.db.delete(id));

    (await ctx.db.query('users').collect())
      .flatMap((t) => t._id)
      .forEach((id) => ctx.db.delete(id));

    const userId = await ctx.db.insert('users', {
      email: '_mailwienecke.jannik@gmail.com',
      password: 'admin',
    });

    const ownerId = await ctx.db.insert('owner', {
      userId: userId,
      firstname: 'Jannik',
      lastname: 'Wiencek',
      age: 32,
    });

    const categories: Id<'categories'>[] = [];
    for (let i = 0; i < 10; i++) {
      const categoryId = await ctx.db.insert('categories', {
        label: faker.vehicle.manufacturer(),
        color: faker.color.human(),
      });

      categories.push(categoryId);
    }

    const tags: Id<'tags'>[] = [];
    for (let i = 0; i < 10; i++) {
      const tagId = await ctx.db.insert('tags', {
        name: faker.hacker.verb(),
        color: faker.color.human(),
      });

      tags.push(tagId);
    }

    const projects: Id<'projects'>[] = [];
    for (let i = 0; i < 10; i++) {
      const projectId = await ctx.db.insert('projects', {
        label: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        categoryId: categories[0],
        ownerId: ownerId,
        dueDate: faker.date.future().getTime(),
      });

      projects.push(projectId);
    }

    const tasks: Id<'tasks'>[] = [];
    for (let i = 0; i < 50; i++) {
      const randomProject = projects[Math.floor(Math.random() * 9)];
      const taskId = await ctx.db.insert('tasks', {
        name: faker.person.fullName(),
        completed: faker.datatype.boolean(),
        projectId: randomProject,
        priority: 'low',
      });

      tasks.push(taskId);
    }

    for (let i = 0; i < 10; i++) {
      const tagId = tags[Math.floor(Math.random() * 9)];
      const taskId = tasks[Math.floor(Math.random() * 49)];
      await ctx.db.insert('tasks_tags', {
        tagId: tagId,
        taskId: taskId,
      });
    }
  },
});

export default init;
