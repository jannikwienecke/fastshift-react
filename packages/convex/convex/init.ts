import * as server from './_generated/server';
import { Id } from './_generated/dataModel';
import { _log } from '@apps-next/core';

const init = server.mutation({
  handler: async (ctx) => {
    _log.info('🌱 Seeding Convex database.....');

    // Clear existing data
    const tables = [
      'tasks_tags',
      'tasks',
      'projects',
      'tags',
      'owner',
      'users',
      'categories',
      'todos',
      'views',
    ];
    for (const table of tables) {
      const ids = await ctx.db.query(table as any).collect();
      for (const { _id } of ids) {
        await ctx.db.delete(_id);
      }
    }

    // Create users and owners
    const userData = [
      {
        email: 'john.doe@example.com',
        password: 'password123',
        firstname: 'John',
        lastname: 'Doe',
        age: 35,
      },
      {
        email: 'jane.smith@example.com',
        password: 'securepass',
        firstname: 'Jane',
        lastname: 'Smith',
        age: 28,
      },
      {
        email: 'mike.johnson@example.com',
        password: 'mikepass',
        firstname: 'Mike',
        lastname: 'Johnson',
        age: 42,
      },
      {
        email: 'emily.brown@example.com',
        password: 'emilypass',
        firstname: 'Emily',
        lastname: 'Brown',
        age: 31,
      },
      {
        email: 'david.wilson@example.com',
        password: 'davidpass',
        firstname: 'David',
        lastname: 'Wilson',
        age: 39,
      },
    ];

    const owners: Id<'owner'>[] = [];
    for (const data of userData) {
      const userId = await ctx.db.insert('users', {
        email: data.email,
        password: data.password,
      });
      const ownerId = await ctx.db.insert('owner', {
        userId,
        firstname: data.firstname,
        lastname: data.lastname,
        age: data.age,
        name: `${data.firstname} ${data.lastname}`,
      });
      owners.push(ownerId);
    }

    // Create categories
    const categories = [
      { label: 'Work', color: 'blue' },
      { label: 'Personal', color: 'green' },
      { label: 'Health', color: 'red' },
      { label: 'Finance', color: 'yellow' },
      { label: 'Education', color: 'purple' },
    ];

    const createdCategories: Id<'categories'>[] = [];
    for (const category of categories) {
      const categoryId = await ctx.db.insert('categories', category);
      createdCategories.push(categoryId);
    }

    // Create tags
    const tags = [
      { name: 'Urgent', color: 'red' },
      { name: 'Important', color: 'orange' },
      { name: 'Long-term', color: 'blue' },
      { name: 'Quick', color: 'green' },
      { name: 'Collaborative', color: 'purple' },
      { name: 'Creative', color: 'pink' },
      { name: 'Technical', color: 'cyan' },
      { name: 'Research', color: 'indigo' },
      { name: 'Planning', color: 'teal' },
      { name: 'Review', color: 'gray' },
    ];

    const createdTags: Id<'tags'>[] = [];
    for (const tag of tags) {
      const tagId = await ctx.db.insert('tags', tag);
      createdTags.push(tagId);
    }

    const projectData = [
      {
        label: 'Website Redesign',
        description: 'Redesign company website for better user experience',
        categoryId: createdCategories[0],
        ownerId: owners[0],
        dueDate: new Date('2024-12-31').getTime(),
      },
      {
        label: 'Fitness Plan',
        description: 'Create a personal fitness plan for weight loss',
        categoryId: createdCategories[2],
        ownerId: owners[1],
        dueDate: new Date('2024-09-30').getTime(),
      },
      {
        label: 'Budget Analysis',
        description: 'Analyze monthly budget to reduce expenses',
        categoryId: createdCategories[3],
        ownerId: owners[2],
        dueDate: new Date('2024-10-15').getTime(),
      },
      {
        label: 'Learn Spanish',
        description: 'Complete Spanish language course for business',
        categoryId: createdCategories[4],
        ownerId: owners[3],
        dueDate: new Date('2024-11-30').getTime(),
      },
      {
        label: 'Home Renovation',
        description: 'Renovate kitchen and bathroom for modern look',
        categoryId: createdCategories[1],
        ownerId: owners[4],
        dueDate: new Date('2024-12-15').getTime(),
      },
      {
        label: 'Product Launch',
        description: 'Plan and execute new product launch campaign',
        categoryId: createdCategories[0],
        ownerId: owners[0],
        dueDate: new Date('2024-08-15').getTime(),
      },
      {
        label: 'Garden Makeover',
        description: 'Redesign backyard garden with native plants',
        categoryId: createdCategories[1],
        ownerId: owners[1],
        dueDate: new Date('2024-07-20').getTime(),
      },
      {
        label: 'Marathon Training',
        description: 'Prepare for upcoming city marathon',
        categoryId: createdCategories[2],
        ownerId: owners[2],
        dueDate: new Date('2024-10-25').getTime(),
      },
      {
        label: 'Mobile App Development',
        description: 'Develop a new mobile app for task management',
        categoryId: createdCategories[0],
        ownerId: owners[3],
        dueDate: new Date('2024-11-30').getTime(),
      },
      {
        label: 'Investment Portfolio',
        description: 'Diversify and optimize investment portfolio',
        categoryId: createdCategories[3],
        ownerId: owners[4],
        dueDate: new Date('2024-09-10').getTime(),
      },
      {
        label: 'Charity Fundraiser',
        description: 'Organize annual charity fundraising event',
        categoryId: createdCategories[1],
        ownerId: owners[0],
        dueDate: new Date('2024-12-05').getTime(),
      },
      {
        label: 'Write Novel',
        description: 'Complete first draft of mystery novel',
        categoryId: createdCategories[4],
        ownerId: owners[1],
        dueDate: new Date('2024-03-20').getTime(),
      },
      {
        label: 'Eco-Friendly Home',
        description: 'Implement sustainable practices at home',
        categoryId: createdCategories[1],
        ownerId: owners[2],
        dueDate: new Date('2024-11-25').getTime(),
      },
      {
        label: 'European Vacation',
        description: 'Plan and book European family vacation',
        categoryId: createdCategories[1],
        ownerId: owners[3],
        dueDate: new Date('2024-08-30').getTime(),
      },
      {
        label: 'Retirement Planning',
        description: 'Create comprehensive retirement savings plan',
        categoryId: createdCategories[3],
        ownerId: owners[4],
        dueDate: new Date('2024-10-10').getTime(),
      },
      {
        label: 'Career Development',
        description: 'Enhance skills for career advancement',
        categoryId: createdCategories[4],
        ownerId: owners[0],
        dueDate: new Date('2024-12-15').getTime(),
      },
      {
        label: 'Healthy Cooking',
        description: 'Learn and implement healthy cooking techniques',
        categoryId: createdCategories[2],
        ownerId: owners[1],
        dueDate: new Date('2024-09-20').getTime(),
      },
      {
        label: 'Home Office Setup',
        description: 'Create ergonomic and productive home office',
        categoryId: createdCategories[1],
        ownerId: owners[2],
        dueDate: new Date('2024-07-25').getTime(),
      },
      {
        label: 'Digital Declutter',
        description: 'Organize and streamline digital files and accounts',
        categoryId: createdCategories[1],
        ownerId: owners[3],
        dueDate: new Date('2024-08-30').getTime(),
      },
      {
        label: 'Learn Photography',
        description: 'Master DSLR camera and photo editing techniques',
        categoryId: createdCategories[4],
        ownerId: owners[4],
        dueDate: new Date('2024-11-10').getTime(),
      },
    ];

    const projects: Id<'projects'>[] = [];
    for (const project of projectData) {
      if (project && project.ownerId && project.categoryId) {
        const projectId = await ctx.db.insert('projects', {
          ownerId: project.ownerId,
          categoryId: project.categoryId,
          label: project.label,
          description: project.description,
          dueDate: project.dueDate,
          deleted: false,
        });
        projects.push(projectId);
      }
    }

    const tommorow = new Date().getTime() + 1000 * 60 * 60 * 24;
    const today = new Date().getTime();
    const yesterday = today - 1000 * 60 * 60 * 24;
    const in2Weeks = today + 1000 * 60 * 60 * 24 * 14;
    const in4Weeks = today + 1000 * 60 * 60 * 24 * 28;
    const ago5Weeks = today - 1000 * 60 * 60 * 24 * 35;

    // Create tasks
    const taskData = [
      {
        name: 'Design mockups',
        completed: false,
        projectId: projects[0],
        priority: 1,
        description: 'Design mockups for the website redesign',
        dueDate: tommorow,
        email: 'wienecke.jannik@gmail.com',
        telfon: '01713290545',
      },
      {
        name: 'Develop frontend',
        completed: false,
        projectId: projects[0],
        priority: 2,
        dueDate: today,
        description: 'Develop frontend for the website redesign',
      },
      {
        name: 'Implement responsive design',
        completed: false,
        projectId: projects[0],
        priority: 3,
        dueDate: today,
        description: 'Implement responsive design for the website redesign',
      },

      {
        name: 'Create workout schedule',
        completed: true,
        projectId: projects[1],
        priority: 4,
        dueDate: yesterday,
        description: 'Create a workout schedule for weight loss',
      },
      {
        name: 'Research healthy recipes',
        completed: false,
        projectId: projects[1],
        priority: 5,
        dueDate: yesterday,
        description: 'Research healthy recipes for weight loss',
      },
      {
        name: 'Buy workout equipment',
        completed: false,
        projectId: projects[1],
        priority: 1,
        description: 'Buy workout equipment for weight loss',
      },

      {
        name: 'Track monthly expenses',
        completed: false,
        projectId: projects[2],
        priority: 1,
        dueDate: in2Weeks,
        description: 'Track monthly expenses to reduce expenses',
      },
      {
        name: 'Create savings plan',
        completed: false,
        projectId: projects[2],
        priority: 2,
        dueDate: in4Weeks,
        description: 'Create savings plan to reduce expenses',
      },
      {
        name: 'Review investment options',
        completed: false,
        projectId: projects[2],
        dueDate: ago5Weeks,
        priority: 1,
      },

      {
        name: 'Study Spanish vocabulary',
        completed: false,
        projectId: projects[3],
        dueDate: ago5Weeks,
        priority: 2,
      },
      {
        name: 'Practice speaking Spanish',
        completed: false,
        projectId: projects[3],
        priority: 1,
      },
      {
        name: 'Watch Spanish movies',
        completed: false,
        projectId: projects[3],
        priority: 1,
      },

      {
        name: 'Choose kitchen cabinets',
        completed: false,
        projectId: projects[4],
        priority: 2,
      },
      {
        name: 'Hire renovation contractor',
        completed: false,
        projectId: projects[4],
        priority: 1,
      },
      {
        name: 'Select bathroom tiles',
        completed: false,
        projectId: projects[4],
        priority: 1,
      },

      {
        name: 'Define product features',
        completed: false,
        projectId: projects[5],
        priority: 1,
      },
      {
        name: 'Create marketing timeline',
        completed: false,
        projectId: projects[5],
        priority: 2,
      },
      {
        name: 'Assign launch team roles',
        completed: false,
        projectId: projects[5],
        priority: 1,
      },

      {
        name: 'Research native plants',
        completed: false,
        projectId: projects[6],
        priority: 2,
      },
      {
        name: 'Create garden layout',
        completed: false,
        projectId: projects[6],
        priority: 1,
      },
      {
        name: 'Purchase gardening supplies',
        completed: false,
        projectId: projects[6],
        priority: 1,
      },

      {
        name: 'Create training schedule',
        completed: false,
        projectId: projects[7],
        priority: 1,
      },
      {
        name: 'Buy running shoes',
        completed: false,
        projectId: projects[7],
        priority: 2,
      },
      {
        name: 'Plan nutrition strategy',
        completed: false,
        projectId: projects[7],
        priority: 1,
      },

      {
        name: 'Design app wireframes',
        completed: false,
        projectId: projects[8],
        priority: 1,
      },
      {
        name: 'Develop app prototype',
        completed: false,
        projectId: projects[8],
        priority: 2,
      },
      {
        name: 'Conduct user testing',
        completed: false,
        projectId: projects[8],
        priority: 1,
      },

      {
        name: 'Research market trends',
        completed: false,
        projectId: projects[9],
        priority: 1,
      },
      {
        name: 'Consult financial advisor',
        completed: false,
        projectId: projects[9],
        priority: 2,
      },
      {
        name: 'Rebalance portfolio',
        completed: false,
        projectId: projects[9],
        priority: 1,
      },

      {
        name: 'Set fundraising goal',
        completed: false,
        projectId: projects[10],
        priority: 1,
      },
      {
        name: 'Contact potential sponsors',
        completed: false,
        projectId: projects[10],
        priority: 2,
      },
      {
        name: 'Plan event logistics',
        completed: false,
        projectId: projects[10],
        priority: 1,
      },

      {
        name: 'Outline novel chapters',
        completed: false,
        projectId: projects[11],
        priority: 1,
      },
      {
        name: 'Develop character profiles',
        completed: false,
        projectId: projects[11],
        priority: 2,
      },
      {
        name: 'Research mystery elements',
        completed: false,
        projectId: projects[11],
        priority: 1,
      },

      {
        name: 'Install solar panels',
        completed: false,
        projectId: projects[12],
        priority: 1,
      },
      {
        name: 'Set up composting system',
        completed: false,
        projectId: projects[12],
        priority: 2,
      },
      {
        name: 'Replace with energy-efficient appliances',
        completed: false,
        projectId: projects[12],
        priority: 1,
      },

      {
        name: 'Book flights',
        completed: false,
        projectId: projects[13],
        priority: 1,
      },
      {
        name: 'Reserve accommodations',
        completed: false,
        projectId: projects[13],
        priority: 2,
        deleted: false,
      },
      {
        name: 'Plan daily itineraries',
        completed: false,
        projectId: projects[13],
        priority: 1,
      },

      {
        name: 'Calculate retirement needs',
        completed: false,
        projectId: projects[14],
        priority: 1,
      },
      {
        name: 'Open retirement accounts',
        completed: false,
        projectId: projects[14],
        priority: 2,
      },
      {
        name: 'Set up automatic contributions',
        completed: false,
        projectId: projects[14],
        priority: 1,
      },

      {
        name: 'Take online courses',
        completed: false,
        projectId: projects[15],
        priority: 1,
      },
      {
        name: 'Attend industry conferences',
        completed: false,
        projectId: projects[15],
        priority: 2,
      },
      {
        name: 'Find a mentor',
        completed: false,
        projectId: projects[15],
        priority: 1,
      },

      {
        name: 'Learn new recipes',
        completed: false,
        projectId: projects[16],
        priority: 1,
      },
      {
        name: 'Buy kitchen equipment',
        completed: false,
        projectId: projects[16],
        priority: 2,
      },
      {
        name: 'Meal prep for the week',
        completed: false,
        projectId: projects[16],
        priority: 1,
      },

      {
        name: 'Choose ergonomic chair',
        completed: false,
        projectId: projects[17],
        priority: 1,
      },
      {
        name: 'Set up proper lighting',
        completed: false,
        projectId: projects[17],
        priority: 2,
      },
      {
        name: 'Organize desk space',
        completed: false,
        projectId: projects[17],
        priority: 1,
      },

      {
        name: 'Unsubscribe from newsletters',
        completed: false,
        projectId: projects[18],
        priority: 1,
      },
      {
        name: 'Organize digital photos',
        completed: false,
        projectId: projects[18],
        priority: 2,
      },
      {
        name: 'Clean up computer desktop',
        completed: false,
        projectId: projects[18],
        priority: 1,
      },

      {
        name: 'Research camera models',
        completed: false,
        projectId: projects[19],
        priority: 1,
      },
      {
        name: 'Take online photography course',
        completed: false,
        priority: 2,
      },
      {
        name: 'Practice editing techniques',
        completed: false,
        priority: 1,
      },
    ];

    let firstTaskId: Id<'tasks'> | undefined;
    let count = 0;
    let taskId: Id<'tasks'> | undefined;
    for (let i = 0; i < taskData.length; i++) {
      const task = taskData[i];

      let tasks: Id<'tasks'>[] | null = null;

      if (firstTaskId && count <= 1) {
        tasks = [firstTaskId];
      }

      if (task) {
        taskId = await ctx.db.insert('tasks', {
          name: task.name,
          completed: task.completed,
          projectId: task.projectId as any,
          priority: task.priority as any,
          description: task.description,
          dueDate: task.dueDate,
          deleted: false,
          email: task.email,
          telefon: task.telfon,
          tasks,
        });

        if (count <= 1 && firstTaskId) {
          count++;
        }

        if (!firstTaskId) {
          firstTaskId = taskId;
        }
      }

      // Add tags to each task (0 to 4 tags)
      const numTags = i % 5;
      for (let j = 0; j < numTags; j++) {
        await ctx.db.insert('tasks_tags', {
          tagId: createdTags[(i + j) % 10] as any,
          taskId: taskId as any,
        });
      }
    }

    if (firstTaskId) {
      const todo = {
        name: 'Todo 1',
        completed: true,
        taskId: firstTaskId,
      };

      const todo2 = {
        name: 'Todo 2',
        completed: false,
        taskId: firstTaskId,
      };

      await ctx.db.insert('todos', todo);
      await ctx.db.insert('todos', todo2);
    }
  },
});

export default init;
