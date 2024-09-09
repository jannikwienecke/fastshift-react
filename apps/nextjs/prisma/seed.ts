import { waitFor } from '@apps-next/core';

// eslint-disable-next-line
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

export async function main() {
  console.log('🌱 Seeding Prisma database...');

  // Clear existing data
  await waitFor(1000);
  await prisma.taskTag.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.owner.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.category.deleteMany({});

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

  const owners = [];
  for (const data of userData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
      },
    });

    const owner = await prisma.owner.create({
      data: {
        userId: user.id,
        firstname: data.firstname,
        lastname: data.lastname,
        age: data.age,
        user: { connect: { id: user.id } },
      },
    });
    owners.push(owner);
  }

  // Create categories
  const categories = [
    { label: 'Work', color: 'blue' },
    { label: 'Personal', color: 'green' },
    { label: 'Health', color: 'red' },
    { label: 'Finance', color: 'yellow' },
    { label: 'Education', color: 'purple' },
  ];

  const createdCategories = await Promise.all(
    categories.map((category) => prisma.category.create({ data: category }))
  );

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

  const createdTags = await Promise.all(
    tags.map((tag) => prisma.tag.create({ data: tag }))
  );

  // Create projects
  const projectData = [
    {
      label: 'Website Redesign',
      description: 'Redesign company website for better user experience',
      categoryId: createdCategories[0].id,
      ownerId: owners[0].id,
      dueDate: new Date('2024-12-31').getTime(),
    },
    {
      label: 'Fitness Plan',
      description: 'Create a personal fitness plan for weight loss',
      categoryId: createdCategories[2].id,
      ownerId: owners[1].id,
      dueDate: new Date('2024-09-30').getTime(),
    },
    {
      label: 'Budget Analysis',
      description: 'Analyze monthly budget to reduce expenses',
      categoryId: createdCategories[3].id,
      ownerId: owners[2].id,
      dueDate: new Date('2024-10-15').getTime(),
    },
    {
      label: 'Learn Spanish',
      description: 'Complete Spanish language course for business',
      categoryId: createdCategories[4].id,
      ownerId: owners[3].id,
      dueDate: new Date('2024-11-30').getTime(),
    },
    {
      label: 'Home Renovation',
      description: 'Renovate kitchen and bathroom for modern look',
      categoryId: createdCategories[1].id,
      ownerId: owners[4].id,
      dueDate: new Date('2024-12-15').getTime(),
    },
    {
      label: 'Product Launch',
      description: 'Plan and execute new product launch campaign',
      categoryId: createdCategories[0].id,
      ownerId: owners[0].id,
      dueDate: new Date('2024-08-15').getTime(),
    },
    {
      label: 'Garden Makeover',
      description: 'Redesign backyard garden with native plants',
      categoryId: createdCategories[1].id,
      ownerId: owners[1].id,
      dueDate: new Date('2024-07-20').getTime(),
    },
    {
      label: 'Marathon Training',
      description: 'Prepare for upcoming city marathon',
      categoryId: createdCategories[2].id,
      ownerId: owners[2].id,
      dueDate: new Date('2024-10-25').getTime(),
    },
    {
      label: 'Mobile App Development',
      description: 'Develop a new mobile app for task management',
      categoryId: createdCategories[0].id,
      ownerId: owners[3].id,
      dueDate: new Date('2024-11-30').getTime(),
    },
    {
      label: 'Investment Portfolio',
      description: 'Diversify and optimize investment portfolio',
      categoryId: createdCategories[3].id,
      ownerId: owners[4].id,
      dueDate: new Date('2024-09-10').getTime(),
    },
    {
      label: 'Charity Fundraiser',
      description: 'Organize annual charity fundraising event',
      categoryId: createdCategories[1].id,
      ownerId: owners[0].id,
      dueDate: new Date('2024-12-05').getTime(),
    },
    {
      label: 'Write Novel',
      description: 'Complete first draft of mystery novel',
      categoryId: createdCategories[4].id,
      ownerId: owners[1].id,
      dueDate: new Date('2024-03-20').getTime(),
    },
    {
      label: 'Eco-Friendly Home',
      description: 'Implement sustainable practices at home',
      categoryId: createdCategories[1].id,
      ownerId: owners[2].id,
      dueDate: new Date('2024-11-25').getTime(),
    },
    {
      label: 'European Vacation',
      description: 'Plan and book European family vacation',
      categoryId: createdCategories[1].id,
      ownerId: owners[3].id,
      dueDate: new Date('2024-08-30').getTime(),
    },
    {
      label: 'Retirement Planning',
      description: 'Create comprehensive retirement savings plan',
      categoryId: createdCategories[3].id,
      ownerId: owners[4].id,
      dueDate: new Date('2024-10-10').getTime(),
    },
    {
      label: 'Career Development',
      description: 'Enhance skills for career advancement',
      categoryId: createdCategories[4].id,
      ownerId: owners[0].id,
      dueDate: new Date('2024-12-15').getTime(),
    },
    {
      label: 'Healthy Cooking',
      description: 'Learn and implement healthy cooking techniques',
      categoryId: createdCategories[2].id,
      ownerId: owners[1].id,
      dueDate: new Date('2024-09-20').getTime(),
    },
    {
      label: 'Home Office Setup',
      description: 'Create ergonomic and productive home office',
      categoryId: createdCategories[1].id,
      ownerId: owners[2].id,
      dueDate: new Date('2024-07-25').getTime(),
    },
    {
      label: 'Digital Declutter',
      description: 'Organize and streamline digital files and accounts',
      categoryId: createdCategories[1].id,
      ownerId: owners[3].id,
      dueDate: new Date('2024-08-30').getTime(),
    },
    {
      label: 'Learn Photography',
      description: 'Master DSLR camera and photo editing techniques',
      categoryId: createdCategories[4].id,
      ownerId: owners[4].id,
      dueDate: new Date('2024-11-10').getTime(),
    },
  ];

  const projects = await Promise.all(
    projectData.map((project) => prisma.project.create({ data: project }))
  );

  // Create tasks
  const taskData = [
    {
      name: 'Design mockups',
      completed: false,
      projectId: projects[0].id,
      priority: 'high',
    },
    {
      name: 'Develop frontend',
      completed: false,
      projectId: projects[0].id,
      priority: 'medium',
    },
    {
      name: 'Implement responsive design',
      completed: false,
      projectId: projects[0].id,
      priority: 'high',
    },

    {
      name: 'Create workout schedule',
      completed: true,
      projectId: projects[1].id,
      priority: 'high',
    },
    {
      name: 'Research healthy recipes',
      completed: false,
      projectId: projects[1].id,
      priority: 'medium',
    },
    {
      name: 'Buy workout equipment',
      completed: false,
      projectId: projects[1].id,
      priority: 'low',
    },

    {
      name: 'Track monthly expenses',
      completed: false,
      projectId: projects[2].id,
      priority: 'high',
    },
    {
      name: 'Create savings plan',
      completed: false,
      projectId: projects[2].id,
      priority: 'medium',
    },
    {
      name: 'Review investment options',
      completed: false,
      projectId: projects[2].id,
      priority: 'low',
    },

    {
      name: 'Study Spanish vocabulary',
      completed: false,
      projectId: projects[3].id,
      priority: 'medium',
    },
    {
      name: 'Practice speaking Spanish',
      completed: false,
      projectId: projects[3].id,
      priority: 'high',
    },
    {
      name: 'Watch Spanish movies',
      completed: false,
      projectId: projects[3].id,
      priority: 'low',
    },

    {
      name: 'Choose kitchen cabinets',
      completed: false,
      projectId: projects[4].id,
      priority: 'medium',
    },
    {
      name: 'Hire renovation contractor',
      completed: false,
      projectId: projects[4].id,
      priority: 'high',
    },
    {
      name: 'Select bathroom tiles',
      completed: false,
      projectId: projects[4].id,
      priority: 'low',
    },

    {
      name: 'Define product features',
      completed: false,
      projectId: projects[5].id,
      priority: 'high',
    },
    {
      name: 'Create marketing timeline',
      completed: false,
      projectId: projects[5].id,
      priority: 'medium',
    },
    {
      name: 'Assign launch team roles',
      completed: false,
      projectId: projects[5].id,
      priority: 'low',
    },

    {
      name: 'Research native plants',
      completed: false,
      projectId: projects[6].id,
      priority: 'medium',
    },
    {
      name: 'Create garden layout',
      completed: false,
      projectId: projects[6].id,
      priority: 'high',
    },
    {
      name: 'Purchase gardening supplies',
      completed: false,
      projectId: projects[6].id,
      priority: 'low',
    },

    {
      name: 'Create training schedule',
      completed: false,
      projectId: projects[7].id,
      priority: 'high',
    },
    {
      name: 'Buy running shoes',
      completed: false,
      projectId: projects[7].id,
      priority: 'medium',
    },
    {
      name: 'Plan nutrition strategy',
      completed: false,
      projectId: projects[7].id,
      priority: 'low',
    },

    {
      name: 'Design app wireframes',
      completed: false,
      projectId: projects[8].id,
      priority: 'high',
    },
    {
      name: 'Develop app prototype',
      completed: false,
      projectId: projects[8].id,
      priority: 'medium',
    },
    {
      name: 'Conduct user testing',
      completed: false,
      projectId: projects[8].id,
      priority: 'low',
    },

    {
      name: 'Research market trends',
      completed: false,
      projectId: projects[9].id,
      priority: 'high',
    },
    {
      name: 'Consult financial advisor',
      completed: false,
      projectId: projects[9].id,
      priority: 'medium',
    },
    {
      name: 'Rebalance portfolio',
      completed: false,
      projectId: projects[9].id,
      priority: 'low',
    },

    {
      name: 'Set fundraising goal',
      completed: false,
      projectId: projects[10].id,
      priority: 'high',
    },
    {
      name: 'Contact potential sponsors',
      completed: false,
      projectId: projects[10].id,
      priority: 'medium',
    },
    {
      name: 'Plan event logistics',
      completed: false,
      projectId: projects[10].id,
      priority: 'low',
    },

    {
      name: 'Outline novel chapters',
      completed: false,
      projectId: projects[11].id,
      priority: 'high',
    },
    {
      name: 'Develop character profiles',
      completed: false,
      projectId: projects[11].id,
      priority: 'medium',
    },
    {
      name: 'Research mystery elements',
      completed: false,
      projectId: projects[11].id,
      priority: 'low',
    },

    {
      name: 'Install solar panels',
      completed: false,
      projectId: projects[12].id,
      priority: 'high',
    },
    {
      name: 'Set up composting system',
      completed: false,
      projectId: projects[12].id,
      priority: 'medium',
    },
    {
      name: 'Replace with energy-efficient appliances',
      completed: false,
      projectId: projects[12].id,
      priority: 'low',
    },

    {
      name: 'Book flights',
      completed: false,
      projectId: projects[13].id,
      priority: 'high',
    },
    {
      name: 'Reserve accommodations',
      completed: false,
      projectId: projects[13].id,
      priority: 'medium',
    },
    {
      name: 'Plan daily itineraries',
      completed: false,
      projectId: projects[13].id,
      priority: 'low',
    },

    {
      name: 'Calculate retirement needs',
      completed: false,
      projectId: projects[14].id,
      priority: 'high',
    },
    {
      name: 'Open retirement accounts',
      completed: false,
      projectId: projects[14].id,
      priority: 'medium',
    },
    {
      name: 'Set up automatic contributions',
      completed: false,
      projectId: projects[14].id,
      priority: 'low',
    },

    {
      name: 'Take online courses',
      completed: false,
      projectId: projects[15].id,
      priority: 'high',
    },
    {
      name: 'Attend industry conferences',
      completed: false,
      projectId: projects[15].id,
      priority: 'medium',
    },
    {
      name: 'Find a mentor',
      completed: false,
      projectId: projects[15].id,
      priority: 'low',
    },

    {
      name: 'Learn new recipes',
      completed: false,
      projectId: projects[16].id,
      priority: 'high',
    },
    {
      name: 'Buy kitchen equipment',
      completed: false,
      projectId: projects[16].id,
      priority: 'medium',
    },
    {
      name: 'Meal prep for the week',
      completed: false,
      projectId: projects[16].id,
      priority: 'low',
    },

    {
      name: 'Choose ergonomic chair',
      completed: false,
      projectId: projects[17].id,
      priority: 'high',
    },
    {
      name: 'Set up proper lighting',
      completed: false,
      projectId: projects[17].id,
      priority: 'medium',
    },
    {
      name: 'Organize desk space',
      completed: false,
      projectId: projects[17].id,
      priority: 'low',
    },

    {
      name: 'Unsubscribe from newsletters',
      completed: false,
      projectId: projects[18].id,
      priority: 'high',
    },
    {
      name: 'Organize digital photos',
      completed: false,
      projectId: projects[18].id,
      priority: 'medium',
    },
    {
      name: 'Clean up computer desktop',
      completed: false,
      projectId: projects[18].id,
      priority: 'low',
    },

    {
      name: 'Research camera models',
      completed: false,
      projectId: projects[19].id,
      priority: 'high',
    },
    {
      name: 'Take online photography course',
      completed: false,
      projectId: projects[19].id,
      priority: 'medium',
    },
    {
      name: 'Practice editing techniques',
      completed: false,
      projectId: projects[19].id,
      priority: 'low',
    },
  ];

  for (let i = 0; i < taskData.length; i++) {
    const task = await prisma.task.create({ data: taskData[i] });

    // Add tags to each task (0 to 4 tags)
    const numTags = i % 5;
    for (let j = 0; j < numTags; j++) {
      await prisma.taskTag.create({
        data: {
          tagId: createdTags[(i + j) % 10].id,
          taskId: task.id,
        },
      });
    }
  }

  console.log('Seed data created successfully');
}

// Keep the original execution for when the script is run directly
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
