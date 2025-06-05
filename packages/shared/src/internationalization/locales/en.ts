import { AllFieldsType, AllModelsType } from '@apps-next/core';

const fieldTranslations: Partial<AllFieldsType> = {
  tableName: {
    one: 'Model',
    other: 'Models',
  },

  entityId: {
    one: 'Entity ID',
    other: 'Entity IDs',
  },

  dueDate: {
    one: 'Due Date',
    other: 'Due Dates',
  },

  age: {
    one: 'Age',
    other: 'Ages',
    edit: 'Edit Age',
    changeField: 'Update age',
  },
  color: {
    one: 'Color1',
    other: 'Colors2',
  },
  label: {
    one: 'Label',
    other: 'Labels',
  },
  name: {
    one: 'Name',
    other: 'Names',
    edit: 'Rename {{model}}',
    // changeField: 'Update description',
  },
  firstname: {
    one: 'First Name',
    other: 'First Name',
  },
  lastname: {
    one: 'Last Name',
    other: 'Last Name',
  },

  priority: {
    one: 'Priority',
    other: 'Priorities',
    none: 'No Priority',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  },
  description: {
    one: 'Description',
    other: 'Descriptions',
    changeField: 'Update description',
  },
  completed: {
    one: 'Completed',
    other: 'Completed',
    markAs: 'Mark as completed ✅',
    unMarkAs: 'Mark as not completed',
  },
};

const modelTranslations: AllModelsType = {
  views: {
    one: 'View',
    other: 'Views',
  },
  history: {
    one: 'History',
    other: 'History',
  },
  tasks_tags: {
    one: 'Task Tag',
    other: 'Task Tags',
  },
  users: {
    one: 'User',
    other: 'Users',
    // edit: 'Edit User',
    // changeField: 'Update user',
  },
  projects: {
    one: 'Project',
    other: 'Projects',
  },

  tags: {
    one: 'Tag',
    other: 'Tags',
  },
  categories: {
    one: 'Category',
    other: 'Categories',
  },
  tasks: {
    one: 'Task',
    other: 'Tasks',
    create: 'Create Task',
    delete: 'Delete Task',
  },
  todos: {
    one: 'Todo',
    other: 'Todos',
  },

  owner: {
    one: 'Owner',
    other: 'Owners',
  },
};

export const en = {
  welcome: {
    title: 'Welcome to FastApp',
    description: 'Manage your tasks and projects efficiently',
  },

  ...fieldTranslations,
  ...modelTranslations,

  shared: {
    rename: 'Rename {{model}}',
  },

  errors: {
    notFound: 'Not found',
    unauthorized: 'Unauthorized',
    minCharacters: 'Minimum {{count}} characters',
    invalidEmail: 'Invalid email address',
    unknownError: 'An unknown error occurred',
  },
  commands: {
    resetDb: 'Reset database',
    makeACopy: 'Make a copy...',
    makeACopyOf: 'Make a copy as new {{model}}...',
    toggleCompleteTask: 'Mark Task as Complete',
    untoggleCompleteTask: 'Mark Task as Incomplete',
  },

  history: {
    insert: 'Insert',
    update: 'Update',
    delete: 'Delete',
    detail: {
      headerInsert: 'Inserted Record',
      headerUpdate: 'Update of Record',
    },
  },
};

export default en;
